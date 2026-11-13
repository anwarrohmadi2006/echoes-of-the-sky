import argparse
import functools
import http.server
import os
import socketserver
import threading
import time
from playwright.sync_api import sync_playwright

ROOT = r"C:\Users\user\Downloads\ECHOES"
DIST_DIR = os.path.join(ROOT, "dist")
EVIDENCE_DIR = os.path.join(ROOT, "docs", "evidence")
os.makedirs(EVIDENCE_DIR, exist_ok=True)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_local_server(directory: str):
    handler = functools.partial(QuietHandler, directory=directory)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, f"http://127.0.0.1:{port}/index.html"


def wait_stage_images(page):
    page.wait_for_function(
        """() => {
            const imgs = Array.from(document.querySelectorAll('#stage-canvas img'));
            return imgs.length > 0 && imgs.every(img => img.complete && img.naturalWidth > 0);
        }"""
    )
    page.wait_for_timeout(120)


def run_e2e(target_url: str = None):
    httpd = None
    if not target_url:
        serve_dir = DIST_DIR if os.path.exists(os.path.join(DIST_DIR, "index.html")) else ROOT
        httpd, target_url = start_local_server(serve_dir)

    print(f"Testing URL: {target_url}")
    results = []
    console_errors = []
    page_errors = []
    failed_requests = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page.on(
            "response",
            lambda res: failed_requests.append(f"{res.status} {res.url}") if res.status >= 400 else None,
        )

        # BB-01: Buka situs & periksa Epigraf
        page.goto(target_url, wait_until="networkidle")
        page.wait_for_selector("#btn-start-prolog")
        quote_text = page.inner_text(".epigraph-quote")
        assert "Leonardo Da Vinci" in page.inner_text(".epigraph-author")
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "01_epigraf.png"))
        results.append(("BB-01", "Halaman Pembuka & Epigraf", "PASS", f"Kutipan tampil ({len(quote_text)} karakter)"))

        # BB-02: Adegan 1 Kemayoran & Inspeksi Kalung Emas
        page.click("#btn-start-prolog")
        page.wait_for_selector("[data-hotspot='gold_necklace']")
        wait_stage_images(page)
        page.click("[data-hotspot='gold_necklace']")
        fb1 = page.inner_text("#hotspot-feedback")
        assert "kalung emas" in fb1.lower()
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "02_kemayoran_adegan1.png"))
        results.append(("BB-02", "Adegan 1 Kemayoran & Kalung Emas", "PASS", fb1[:68]))

        # Lanjut langkah kedua Adegan 1 -> masuk Adegan 2 kabin
        page.click(".choice-btn")
        page.wait_for_timeout(150)
        page.click(".choice-btn")
        page.wait_for_timeout(150)
        page.click(".choice-btn")  # observe_engine -> adegan2_bangkok_event
        page.wait_for_selector("#btn-inspect-spark")
        wait_stage_images(page)

        # BB-03: Cutscene Interaktif Malam Bangkok ("Vuur! Vuur!")
        page.click("#btn-inspect-spark")
        spark_fb = page.inner_text("#hotspot-feedback")
        assert "baling-baling" in spark_fb.lower()
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "03_bangkok_spark.png"))
        results.append(("BB-03", "Cutscene Percikan Api Bangkok", "PASS", spark_fb[:68]))

        # Teriak "Vuur! Vuur!" -> Pramugari -> Humor -> Adegan 3 Aachen
        page.click(".choice-btn")  # shout_vuur
        page.wait_for_timeout(120)
        assert "kamu baru pertama kali naik pesawat" in page.inner_text("#narrative-text").lower()
        page.click(".choice-btn")  # laugh_off -> adegan3_jerman
        page.wait_for_timeout(120)
        page.click(".choice-btn")  # walk_aachen -> adegan3_indekos
        wait_stage_images(page)
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "04_aachen_adegan3.png"))

        # BB-04: Masuk Free Roam Kamar Indekos
        page.click(".choice-btn")  # enter_freeroam
        page.wait_for_selector("#btn-enter-freeroam-play")
        page.click("#btn-enter-freeroam-play")
        page.wait_for_selector("#hotspot-desk")
        wait_stage_images(page)
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "05_freeroam_room.png"))
        results.append(("BB-04", "Transisi Batas Akhir Prolog -> Free Roam", "PASS", "Hotspot kamar aktif lengkap"))

        # BB-05 (Negative): Akses RWTH Aachen sebelum eksplorasi & uji bahasa
        page.click("#btn-walk-rwth")
        page.wait_for_selector(".modal-sheet .feedback-banner.is-fail")
        deny_msg = page.inner_text(".modal-sheet .feedback-banner.is-fail")
        assert "periksa dulu kamar indekosmu" in deny_msg.lower()
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "06_validasi_rwth_ditolak.png"))
        page.click("#btn-close-modal")
        results.append(("BB-05", "Validasi Akses RWTH Sebelum Syarat Terpenuhi", "PASS", deny_msg[:68]))

        # BB-06: Eksplorasi Meja Belajar (Fisika, Kamus Jerman, Warsaw LP) & Jendela Kamar
        page.click("#hotspot-desk")
        page.wait_for_selector("[data-inspect-sub='physics_books']")
        page.click("[data-inspect-sub='physics_books']")
        page.wait_for_selector("[data-inspect-sub='german_dict']")
        page.click("[data-inspect-sub='german_dict']")
        page.wait_for_selector("#btn-toggle-warsaw")
        page.click("#btn-toggle-warsaw")
        page.click("#btn-close-modal")
        page.click("#hotspot-window")
        page.wait_for_selector(".modal-sheet h4")
        page.click("#btn-close-modal")
        assert page.locator("#quest-checklist li.is-done").count() == 4
        results.append(("BB-06", "Eksplorasi Meja Belajar, Warsaw LP & Jendela", "PASS", "4/4 objek kamar tercatat selesai"))

        # BB-07 (Negative): Input dialog bahasa Jerman kosong
        page.click("#hotspot-door")
        page.wait_for_selector("#input-german-speech")
        page.fill("#input-german-speech", "")
        page.click("#btn-submit-german")
        empty_err = page.inner_text("#german-eval-result")
        assert "INVALID_EMPTY" in empty_err
        results.append(("BB-07", "Validasi Input Bahasa Jerman Kosong", "PASS", empty_err[:68]))

        # BB-08 (Negative): Input dialog > 80 karakter
        long_str = "Guten Tag Frau Neuefeiend " * 4
        page.fill("#input-german-speech", long_str)
        page.click("#btn-submit-german")
        len_err = page.inner_text("#german-eval-result")
        assert "INVALID_LENGTH" in len_err
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "07_uji_jerman_invalid_length.png"))
        results.append(("BB-08", "Validasi Batas Karakter Input (> 80 huruf)", "PASS", len_err[:68]))

        # BB-09 (Negative): Input kalimat non-Jerman
        page.fill("#input-german-speech", "Permisi Bu saya mau kuliah dulu ya")
        page.click("#btn-submit-german")
        wrong_err = page.inner_text("#german-eval-result")
        assert "FAIL_MISUNDERSTOOD" in wrong_err
        results.append(("BB-09", "Validasi Kalimat Non-Jerman", "PASS", wrong_err[:68]))

        # BB-10 (Valid): Input Jerman valid + baca kamus -> PASS_FLUENT -> RWTH Aachen
        page.fill("#input-german-speech", "Guten Tag, Frau Neuefeiend. Ich studiere an der RWTH.")
        page.click("#btn-submit-german")
        pass_msg = page.inner_text("#german-eval-result")
        assert "PASS_FLUENT" in pass_msg
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "08_uji_jerman_pass.png"))
        page.click("#btn-modal-go-rwth")
        wait_stage_images(page)
        assert "perpustakaan kampus rwth aachen" in page.inner_text("#narrative-text").lower()
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "09_rwth_aachen.png"))
        results.append(("BB-10", "Uji Bahasa Jerman Fasih & Menuju RWTH Aachen", "PASS", pass_msg[:68]))

        # Mobile responsive check (390x844)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(150)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "10_mobile_view.png"))
        assert not overflow, "Mobile horizontal overflow detected!"

        browser.close()

    if httpd:
        httpd.shutdown()

    assert not console_errors, f"Console errors: {console_errors}"
    assert not page_errors, f"Page errors: {page_errors}"
    assert not failed_requests, f"Failed requests: {failed_requests}"

    print("\n=== BLACK BOX E2E SUMMARY ===")
    for r in results:
        print(f"{r[0]} | {r[1]:<46} | {r[2]} | {r[3]}")
    print("Console errors: 0 | Page errors: 0 | Failed requests: 0 | Mobile overflow: False")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=None, help="Target URL (e.g. https://echoes-of-the-sky.pages.dev)")
    args = parser.parse_args()
    run_e2e(args.url)
