import os
import shutil
import random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = r"C:\Users\user\Downloads\ECHOES"
BRAIN_DIR = r"C:\Users\user\.gemini\antigravity-cli\brain\f3122186-9489-469e-9b50-4a75cdc42fb8"
REF_IMG = os.path.join(BRAIN_DIR, ".user_uploaded", "uploaded_media_0_1794555895252.jpg")

os.makedirs(os.path.join(ROOT, "assets", "references"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "assets", "textures"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "assets", "sprites"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "assets", "scenes"), exist_ok=True)


def extract_paper_texture(src_path: str, out_path: str):
    """Extract a clean cold-pressed paper patch from upper-left margin and mirror-tile seamlessly."""
    img = Image.open(src_path).convert("RGB")
    patch = img.crop((14, 14, 240, 240))
    arr = np.asarray(patch, dtype=np.float32)
    # Remove any global brightness gradient across the patch so mirror seams vanish completely
    smooth = cv2.GaussianBlur(arr, (61, 61), 22)
    high_freq = arr - smooth
    normalized = np.clip(246.0 + high_freq * 1.45, 224, 255).astype(np.uint8)
    clean_patch = Image.fromarray(normalized, mode="RGB")

    w, h = clean_patch.size
    tiled = Image.new("RGB", (w * 2, h * 2))
    tiled.paste(clean_patch, (0, 0))
    tiled.paste(clean_patch.transpose(Image.FLIP_LEFT_RIGHT), (w, 0))
    tiled.paste(clean_patch.transpose(Image.FLIP_TOP_BOTTOM), (0, h))
    tiled.paste(clean_patch.transpose(Image.ROTATE_180), (w, h))
    tiled = tiled.resize((512, 512), Image.Resampling.LANCZOS)
    tiled.save(out_path, format="PNG", optimize=True)
    print(f"Saved seamless paper texture -> {out_path}")
    return tiled


def cutout_character_sprite(src_path: str, out_path: str, crop_box=None):
    """Extract clean transparent PNG character sprite from user's watercolor-and-ink drawing."""
    pil_im = Image.open(src_path).convert("RGB")
    if crop_box:
        pil_im = pil_im.crop(crop_box)
    rgb = np.asarray(pil_im)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    edges = cv2.Canny(gray, 50, 140)
    ink = (gray < 145).astype(np.uint8) * 255
    barrier = cv2.bitwise_or(edges, ink)
    barrier = cv2.dilate(barrier, np.ones((3, 3), np.uint8), iterations=1)
    barrier = cv2.morphologyEx(barrier, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))

    ff = barrier.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for x in range(0, w, 6):
        if ff[0, x] == 0:
            cv2.floodFill(ff, mask, (x, 0), 128)
        if ff[h - 1, x] == 0:
            cv2.floodFill(ff, mask, (x, h - 1), 128)
    for y in range(0, h, 6):
        if ff[y, 0] == 0:
            cv2.floodFill(ff, mask, (0, y), 128)
        if ff[y, w - 1] == 0:
            cv2.floodFill(ff, mask, (w - 1, y), 128)

    fg_mask = (ff != 128).astype(np.uint8) * 255
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask, connectivity=8)
    if num_labels > 1:
        largest_label = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg_mask = (labels == largest_label).astype(np.uint8) * 255

    alpha = cv2.GaussianBlur(fg_mask, (3, 3), 0.65)
    rgba = np.dstack([rgb, alpha])

    ys, xs = np.where(alpha > 12)
    if len(xs) > 0 and len(ys) > 0:
        pad = 12
        x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad)
        y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad)
        rgba = rgba[y0:y1, x0:x1]

    out_img = Image.fromarray(rgba, mode="RGBA")
    if out_img.height > 700:
        ratio = 700.0 / out_img.height
        out_img = out_img.resize((int(out_img.width * ratio), 700), Image.Resampling.LANCZOS)
    out_img.save(out_path, format="PNG", optimize=True)
    print(f"Saved character sprite -> {out_path} ({out_img.size})")
    return out_img


def create_character_variants(base_sprite: Image.Image):
    """Create watercolor-blended Kemayoran sunglasses + gold glint and Aachen satchel variants."""
    w, h = base_sprite.size

    # Kemayoran: feathered dark lens tint inside exact measured spectacles circles (x=59..84 & 96..123, y=61..87)
    kem = base_sprite.copy()
    lens_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lens_layer)
    ld.ellipse((59, 63, 84, 87), fill=(26, 26, 30, 185))
    ld.ellipse((96, 61, 122, 85), fill=(26, 26, 30, 185))
    # Subtle soft gold chain highlight tucked near collar
    ld.line([(98, 152), (112, 188)], fill=(214, 168, 66, 175), width=2)
    ld.ellipse((108, 186, 118, 196), fill=(224, 178, 72, 200))
    lens_layer = lens_layer.filter(ImageFilter.GaussianBlur(0.8))
    kem = Image.alpha_composite(kem, lens_layer)
    kem.save(os.path.join(ROOT, "assets", "sprites", "rudy_kemayoran.png"), format="PNG", optimize=True)

    # Aachen: soft watercolor leather satchel strap across torso & hip pouch matching ink outline
    aac = base_sprite.copy()
    bag_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bag_layer)
    bd.line([(72, 168), (154, 374)], fill=(116, 75, 46, 210), width=10)
    bd.rounded_rectangle((144, 355, 184, 435), radius=7, fill=(124, 80, 50, 215))
    bag_layer = bag_layer.filter(ImageFilter.GaussianBlur(0.9))
    bd2 = ImageDraw.Draw(bag_layer)
    bd2.line([(68, 170), (150, 376)], fill=(44, 37, 32, 210), width=2)
    bd2.line([(76, 166), (158, 372)], fill=(44, 37, 32, 210), width=2)
    bd2.rounded_rectangle((144, 355, 184, 435), radius=7, outline=(44, 37, 32, 235), width=2)
    bd2.line([(144, 386), (184, 386)], fill=(44, 37, 32, 210), width=2)
    aac = Image.alpha_composite(aac, bag_layer)
    aac.save(os.path.join(ROOT, "assets", "sprites", "rudy_aachen.png"), format="PNG", optimize=True)
    print("Saved calibrated Kemayoran and Aachen sprite variants.")


def make_paper_canvas(paper_tile: Image.Image, w=1280, h=720) -> Image.Image:
    canvas = Image.new("RGB", (w, h))
    tw, th = paper_tile.size
    for y in range(0, h, th):
        for x in range(0, w, tw):
            canvas.paste(paper_tile, (x, y))
    return canvas


def wash_poly(base: Image.Image, pts, color, alpha=160, blur=4.0):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon(pts, fill=(*color, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(base.convert("RGBA"), layer)


def wash_rect(base: Image.Image, box, color, alpha=160, blur=4.0):
    return wash_poly(
        base,
        [(box[0], box[1]), (box[2], box[1]), (box[2], box[3]), (box[0], box[3])],
        color, alpha=alpha, blur=blur
    )


def hand_ink(draw: ImageDraw.ImageDraw, pts, width=2, color=(44, 37, 32, 235), seed=42):
    rng = random.Random(seed)
    sub = []
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        steps = max(2, int(max(abs(x1 - x0), abs(y1 - y0)) / 36))
        for s in range(steps):
            t = s / steps
            jx = rng.uniform(-0.9, 0.9) if 0 < s < steps else 0
            jy = rng.uniform(-0.9, 0.9) if 0 < s < steps else 0
            sub.append((x0 + (x1 - x0) * t + jx, y0 + (y1 - y0) * t + jy))
    sub.append(pts[-1])
    draw.line(sub, fill=color, width=width, joint="curve")


def hand_rect(draw, box, width=2, color=(44, 37, 32, 235), seed=10):
    x0, y0, x1, y1 = box
    hand_ink(draw, [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)], width=width, color=color, seed=seed)


def paint_freeroam_room(paper_tile: Image.Image, out_path: str):
    """Painterly 1955 Aachen boarding room with soft watercolor lighting and hand-jittered ink."""
    img = make_paper_canvas(paper_tile).convert("RGBA")
    # Warm shaded room atmosphere + ambient lighting from window
    img = wash_rect(img, (0, 0, 1280, 508), (222, 211, 192), alpha=155, blur=10)
    img = wash_poly(img, [(460, 115), (790, 115), (920, 720), (310, 720)], (245, 239, 224), alpha=95, blur=18)
    img = wash_rect(img, (0, 0, 210, 508), (186, 173, 156), alpha=95, blur=18)
    img = wash_rect(img, (1050, 0, 1280, 508), (182, 169, 152), alpha=95, blur=18)
    # Wooden floorboards + wainscoting trim
    img = wash_rect(img, (0, 445, 1280, 508), (195, 179, 156), alpha=150, blur=4)
    img = wash_poly(img, [(0, 508), (1280, 508), (1280, 720), (0, 720)], (166, 138, 108), alpha=190, blur=6)
    img = wash_rect(img, (75, 585, 480, 622), (96, 76, 58), alpha=75, blur=10)  # desk floor shadow

    # Window view (472..792, 108..384): overcast sky & post-WWII Aachen gable ruins
    img = wash_rect(img, (476, 114, 788, 378), (176, 194, 206), alpha=205, blur=5)
    img = wash_poly(img, [(482, 378), (482, 275), (528, 240), (576, 278), (576, 378)], (162, 130, 110), alpha=215, blur=2.5)
    img = wash_poly(img, [(582, 378), (582, 295), (618, 268), (656, 292), (656, 378)], (134, 144, 154), alpha=210, blur=2.5)
    img = wash_poly(img, [(662, 378), (662, 238), (722, 212), (784, 255), (784, 378)], (172, 140, 116), alpha=215, blur=2.5)
    img = wash_rect(img, (702, 184, 722, 232), (132, 102, 86), alpha=220, blur=1.5)
    img = wash_poly(img, [(714, 182), (738, 146), (776, 130), (754, 168)], (242, 240, 238), alpha=140, blur=7)
    # Soft side curtains flanking window
    img = wash_poly(img, [(444, 102), (484, 102), (476, 395), (434, 395)], (126, 136, 142), alpha=170, blur=3)
    img = wash_poly(img, [(780, 102), (822, 102), (830, 395), (788, 395)], (126, 136, 142), alpha=170, blur=3)

    # Meja Belajar (Left zone: 75..495)
    img = wash_poly(img, [(74, 396), (496, 396), (468, 434), (56, 434)], (152, 106, 68), alpha=220, blur=2.5)
    img = wash_rect(img, (84, 434, 116, 608), (122, 82, 52), alpha=225, blur=2)
    img = wash_rect(img, (430, 434, 462, 598), (122, 82, 52), alpha=225, blur=2)
    # Books & Warsaw Concerto LP player on desk
    img = wash_rect(img, (104, 368, 206, 396), (42, 68, 98), alpha=230, blur=1.5)
    img = wash_rect(img, (112, 344, 198, 368), (110, 118, 76), alpha=230, blur=1.5)
    img = wash_rect(img, (124, 326, 186, 344), (154, 114, 64), alpha=230, blur=1.5)
    img = wash_rect(img, (220, 362, 308, 396), (144, 62, 48), alpha=230, blur=1.5)
    img = wash_rect(img, (326, 355, 444, 396), (94, 68, 50), alpha=230, blur=1.5)
    img = wash_rect(img, (342, 346, 424, 356), (34, 32, 32), alpha=235, blur=1.0)
    # Warm reading lamp glow on desk corner
    img = wash_poly(img, [(82, 290), (126, 290), (142, 330), (68, 330)], (224, 184, 102), alpha=200, blur=3)

    # Wastafel, Mirror & Tas Kulit Lusuh (Right-center: 810..975)
    img = wash_rect(img, (836, 232, 924, 338), (188, 204, 212), alpha=185, blur=2.5)
    img = wash_poly(img, [(822, 385), (946, 385), (932, 434), (836, 434)], (245, 242, 236), alpha=235, blur=1.5)
    img = wash_rect(img, (828, 456, 904, 536), (120, 76, 46), alpha=230, blur=2)

    # Pintu Keluar / Lorong (Far-right: 1005..1225)
    img = wash_rect(img, (1012, 146, 1218, 598), (138, 102, 72), alpha=225, blur=2.5)
    img = wash_rect(img, (1035, 178, 1192, 352), (118, 86, 58), alpha=140, blur=2)
    img = wash_rect(img, (1035, 374, 1192, 560), (118, 86, 58), alpha=140, blur=2)

    # Hand-drawn dark-brown ink contours
    d = ImageDraw.Draw(img, "RGBA")
    hand_ink(d, [(0, 445), (1280, 445)], width=1, color=(86, 72, 58, 150), seed=1)
    hand_ink(d, [(0, 508), (1280, 508)], width=3, seed=2)
    for fx in range(80, 1280, 150):
        hand_ink(d, [(fx, 508), (fx - 72, 720)], width=1, color=(64, 52, 42, 115), seed=fx)

    hand_rect(d, (472, 108, 794, 384), width=3, seed=11)
    hand_rect(d, (482, 118, 784, 374), width=2, seed=12)
    hand_ink(d, [(633, 118), (633, 374)], width=2, seed=13)
    hand_ink(d, [(482, 245), (784, 245)], width=2, seed=14)
    hand_ink(d, [(484, 275), (528, 240), (576, 278), (576, 374)], width=2, seed=15)
    hand_ink(d, [(582, 295), (618, 268), (656, 292), (656, 374)], width=2, seed=16)
    hand_ink(d, [(662, 238), (722, 212), (784, 255)], width=2, seed=17)
    hand_rect(d, (702, 184, 722, 232), width=2, seed=18)

    hand_ink(d, [(74, 396), (496, 396), (468, 434), (56, 434), (74, 396)], width=3, seed=20)
    hand_rect(d, (84, 434, 116, 608), width=3, seed=21)
    hand_rect(d, (430, 434, 462, 598), width=3, seed=22)
    hand_rect(d, (104, 368, 206, 396), width=2, seed=23)
    hand_rect(d, (112, 344, 198, 368), width=2, seed=24)
    hand_rect(d, (124, 326, 186, 344), width=2, seed=25)
    hand_rect(d, (220, 362, 308, 396), width=2, seed=26)
    hand_rect(d, (326, 355, 444, 396), width=2, seed=27)
    hand_ink(d, [(426, 355), (434, 336), (390, 348)], width=2, seed=28)

    hand_rect(d, (836, 232, 924, 338), width=2, seed=31)
    hand_ink(d, [(822, 385), (946, 385), (932, 434), (836, 434), (822, 385)], width=2, seed=32)
    hand_ink(d, [(885, 385), (885, 362), (898, 366)], width=2, seed=33)
    hand_rect(d, (828, 456, 904, 536), width=2, seed=34)

    hand_rect(d, (1012, 146, 1218, 598), width=3, seed=41)
    hand_rect(d, (1035, 178, 1192, 352), width=2, seed=42)
    hand_rect(d, (1035, 374, 1192, 560), width=2, seed=43)
    d.ellipse((1026, 382, 1044, 400), fill=(196, 152, 62, 255), outline=(44, 37, 32, 235), width=2)

    paper_full = make_paper_canvas(paper_tile).convert("RGB")
    blended = np.asarray(img.convert("RGB"), dtype=np.float32) * (np.asarray(paper_full, dtype=np.float32) / 255.0)
    Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8)).save(out_path, format="JPEG", quality=90, optimize=True)
    print(f"Saved painterly freeroam_room -> {out_path}")


def paint_rwth_library(paper_tile: Image.Image, out_path: str):
    """Painterly 1955 RWTH Aachen university facade with cobblestone plaza and warm sunbeams."""
    img = make_paper_canvas(paper_tile).convert("RGBA")
    img = wash_rect(img, (0, 0, 1280, 470), (174, 198, 212), alpha=180, blur=10)
    img = wash_poly(img, [(60, 0), (500, 0), (790, 470), (310, 470)], (246, 226, 178), alpha=125, blur=20)
    img = wash_rect(img, (0, 470, 1280, 720), (186, 172, 152), alpha=195, blur=8)

    # Side foliage / spring branches silhouettes
    img = wash_poly(img, [(40, 260), (185, 220), (210, 475), (25, 475)], (118, 128, 92), alpha=165, blur=8)
    img = wash_poly(img, [(1060, 240), (1240, 205), (1255, 475), (1040, 475)], (118, 128, 92), alpha=165, blur=8)

    # University building body, slate roof & central pediment
    img = wash_rect(img, (215, 136, 1065, 502), (214, 194, 168), alpha=225, blur=3)
    img = wash_rect(img, (215, 445, 1065, 502), (178, 160, 138), alpha=180, blur=3)
    img = wash_poly(img, [(172, 136), (640, 56), (1108, 136)], (112, 122, 136), alpha=220, blur=3)
    img = wash_poly(img, [(455, 168), (640, 88), (825, 168)], (196, 174, 146), alpha=230, blur=2)

    for wx in [280, 365, 515, 610, 705, 855, 940]:
        img = wash_rect(img, (wx, 215, wx + 52, 325), (238, 198, 126), alpha=205, blur=2.5)

    img = wash_rect(img, (585, 365, 695, 502), (122, 82, 54), alpha=235, blur=2)
    for step_i in range(4):
        pad = step_i * 18
        img = wash_rect(img, (540 - pad, 502 + step_i * 18, 740 + pad, 520 + step_i * 18), (182, 170, 152), alpha=230, blur=1.5)

    d = ImageDraw.Draw(img, "RGBA")
    hand_rect(d, (215, 136, 1065, 502), width=3, seed=51)
    hand_ink(d, [(172, 136), (640, 56), (1108, 136), (172, 136)], width=3, seed=52)
    hand_ink(d, [(455, 168), (640, 88), (825, 168), (455, 168)], width=3, seed=53)
    for idx, wx in enumerate([280, 365, 515, 610, 705, 855, 940]):
        hand_rect(d, (wx, 215, wx + 52, 325), width=2, seed=60 + idx)
        d.arc((wx, 192, wx + 52, 240), 180, 360, fill=(44, 37, 32, 230), width=2)
        hand_ink(d, [(wx + 26, 200), (wx + 26, 325)], width=2, seed=70 + idx)
    hand_rect(d, (585, 365, 695, 502), width=3, seed=81)
    hand_ink(d, [(640, 365), (640, 502)], width=2, seed=82)
    for step_i in range(4):
        pad = step_i * 18
        hand_rect(d, (540 - pad, 502 + step_i * 18, 740 + pad, 520 + step_i * 18), width=2, seed=85 + step_i)

    # Cobblestone foreground hints
    for cy in [595, 635, 675]:
        hand_ink(d, [(120, cy), (1160, cy)], width=1, color=(96, 82, 68, 95), seed=cy)

    paper_full = make_paper_canvas(paper_tile).convert("RGB")
    blended = np.asarray(img.convert("RGB"), dtype=np.float32) * (np.asarray(paper_full, dtype=np.float32) / 255.0)
    Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8)).save(out_path, format="JPEG", quality=90, optimize=True)
    print(f"Saved painterly rwth_library -> {out_path}")


def main():
    ref_copy = os.path.join(ROOT, "assets", "references", "rudy_ref.jpg")
    shutil.copy2(REF_IMG, ref_copy)
    paper_tile = extract_paper_texture(ref_copy, os.path.join(ROOT, "assets", "textures", "watercolor_paper_tile.png"))
    base_sprite = cutout_character_sprite(
        ref_copy,
        os.path.join(ROOT, "assets", "sprites", "rudy_base.png"),
        crop_box=(280, 30, 740, 1005),
    )
    create_character_variants(base_sprite)

    exact_map = {
        "scene1_kemayoran_": "scene1_kemayoran.jpg",
        "vintage_airliner_night_bangkok_": "scene2_cabin_bangkok.jpg",
        "aachen_1955_boarding_house_street_": "scene3_aachen_street.jpg",
    }
    for prefix, target_name in exact_map.items():
        matches = sorted([f for f in os.listdir(BRAIN_DIR) if f.startswith(prefix) and f.endswith((".jpg", ".png"))])
        if matches:
            src = os.path.join(BRAIN_DIR, matches[-1])
            dst = os.path.join(ROOT, "assets", "scenes", target_name)
            im = Image.open(src).convert("RGB").resize((1280, 720), Image.Resampling.LANCZOS)
            im.save(dst, format="JPEG", quality=88, optimize=True)
            print(f"Copied generated scene -> {dst}")

    paint_freeroam_room(paper_tile, os.path.join(ROOT, "assets", "scenes", "freeroam_room.jpg"))
    paint_rwth_library(paper_tile, os.path.join(ROOT, "assets", "scenes", "rwth_library.jpg"))


if __name__ == "__main__":
    main()
