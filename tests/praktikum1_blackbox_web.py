import os
from playwright.sync_api import sync_playwright

ROOT = r"C:\Users\user\Downloads\ECHOES"
EVIDENCE_DIR = os.path.join(ROOT, "docs", "evidence")
TARGET_URL = "https://www.saucedemo.com/"


def run_saucedemo_blackbox():
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 820})
        page = context.new_page()

        def shot(filename: str):
            page.wait_for_function(
                """() => Array.from(document.querySelectorAll('img')).every(i => i.complete && i.naturalWidth > 0)"""
            )
            page.wait_for_timeout(150)
            page.screenshot(path=os.path.join(EVIDENCE_DIR, filename))

        # P1-BB-01 (Invalid): Username & Password kosong
        page.goto(TARGET_URL, wait_until="domcontentloaded")
        page.wait_for_selector("#login-button")
        page.fill("#user-name", "")
        page.fill("#password", "")
        page.click("#login-button")
        err1 = page.inner_text("[data-test='error']").strip()
        assert "Username is required" in err1
        shot("p1_bb_01.png")
        results.append(("P1-BB-01", "Invalid", "Login input kosong", err1, "PASS"))

        # P1-BB-02 (Invalid): Username terisi, Password kosong
        page.fill("#user-name", "standard_user")
        page.fill("#password", "")
        page.click("#login-button")
        err2 = page.inner_text("[data-test='error']").strip()
        assert "Password is required" in err2
        shot("p1_bb_02.png")
        results.append(("P1-BB-02", "Invalid", "Login password kosong", err2, "PASS"))

        # P1-BB-03 (Invalid): Akun terkunci (locked_out_user)
        page.fill("#user-name", "locked_out_user")
        page.fill("#password", "secret_sauce")
        page.click("#login-button")
        err3 = page.inner_text("[data-test='error']").strip()
        assert "locked out" in err3.lower()
        shot("p1_bb_03.png")
        results.append(("P1-BB-03", "Invalid", "Login akun terkunci (locked_out_user)", err3, "PASS"))

        # P1-BB-04 (Invalid): Kredensial tidak terdaftar
        page.fill("#user-name", "pengguna_tidak_ada")
        page.fill("#password", "salah123")
        page.click("#login-button")
        err4 = page.inner_text("[data-test='error']").strip()
        assert "do not match any user" in err4.lower()
        shot("p1_bb_04.png")
        results.append(("P1-BB-04", "Invalid", "Login kredensial salah", err4, "PASS"))

        # P1-BB-05 (Valid): Login kredensial valid (standard_user)
        page.fill("#user-name", "standard_user")
        page.fill("#password", "secret_sauce")
        page.click("#login-button")
        page.wait_for_url("**/inventory.html")
        page.wait_for_selector(".inventory_item_name")
        item_count = page.locator(".inventory_item").count()
        assert item_count == 6
        shot("p1_bb_05.png")
        results.append(("P1-BB-05", "Valid", "Login kredensial valid", f"URL={page.url} ({item_count} produk tampil)", "PASS"))

        # P1-BB-06 (Valid): Urutkan produk Price (low to high)
        page.select_option("[data-test='product-sort-container']", "lohi")
        first_name = page.locator(".inventory_item_name").first.inner_text().strip()
        first_price = page.locator(".inventory_item_price").first.inner_text().strip()
        assert first_name == "Sauce Labs Onesie" and first_price == "$7.99"
        shot("p1_bb_06.png")
        results.append(("P1-BB-06", "Valid", "Sortir katalog (Price low to high)", f"Produk #1: {first_name} ({first_price})", "PASS"))

        # P1-BB-07 (Valid): Tambah 2 produk ke keranjang & buka halaman Cart
        page.click("#add-to-cart-sauce-labs-onesie")
        page.click("#add-to-cart-sauce-labs-backpack")
        badge = page.inner_text(".shopping_cart_badge").strip()
        assert badge == "2"
        page.click(".shopping_cart_link")
        page.wait_for_url("**/cart.html")
        page.wait_for_selector(".cart_item")
        cart_items = page.locator(".cart_item").count()
        assert cart_items == 2, f"Expected 2 cart items, got {cart_items}"
        shot("p1_bb_07.png")
        results.append(("P1-BB-07", "Valid", "Tambah 2 produk & cek Cart", f"Badge={badge}, isi cart={cart_items} item", "PASS"))

        # P1-BB-08 (Valid): Hapus 1 produk dari keranjang
        page.click("#remove-sauce-labs-backpack")
        badge_after = page.inner_text(".shopping_cart_badge").strip()
        cart_after = page.locator(".cart_item").count()
        assert badge_after == "1" and cart_after == 1
        shot("p1_bb_08.png")
        results.append(("P1-BB-08", "Valid", "Hapus 1 item dari keranjang", f"Sisa badge={badge_after}, item={cart_after}", "PASS"))

        # P1-BB-09 (Invalid): Checkout Step 1 dengan form data diri kosong
        page.click("#checkout")
        page.wait_for_url("**/checkout-step-one.html")
        page.click("#continue")
        err9 = page.inner_text("[data-test='error']").strip()
        assert "First Name is required" in err9
        shot("p1_bb_09.png")
        results.append(("P1-BB-09", "Invalid", "Checkout form data diri kosong", err9, "PASS"))

        # P1-BB-10 (Valid): Lengkapi Checkout & Finish Order
        page.fill("#first-name", "Anwar")
        page.fill("#last-name", "Rohmadi")
        page.fill("#postal-code", "55281")
        page.click("#continue")
        page.wait_for_url("**/checkout-step-two.html")
        page.click("#finish")
        page.wait_for_url("**/checkout-complete.html")
        complete_msg = page.inner_text(".complete-header").strip()
        assert "Thank you for your order!" in complete_msg
        shot("p1_bb_10.png")
        results.append(("P1-BB-10", "Valid", "Checkout lengkap hingga Finish", f"URL={page.url} | '{complete_msg}'", "PASS"))

        browser.close()

    print(f"Testing URL: {TARGET_URL}")
    print("=== PRAKTIKUM 1 BLACK BOX WEB (SAUCEDEMO) ===")
    for row in results:
        print(f"{row[0]} | {row[1]:<7} | {row[2]:<36} | {row[4]} | {row[3]}")


if __name__ == "__main__":
    run_saucedemo_blackbox()
