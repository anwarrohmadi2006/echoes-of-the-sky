import os
import shutil

ROOT = r"C:\Users\user\Downloads\ECHOES"
DIST = os.path.join(ROOT, "dist")

if os.path.exists(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST, exist_ok=True)

# Only deploy pure web application files to Cloudflare Pages
shutil.copy2(os.path.join(ROOT, "index.html"), os.path.join(DIST, "index.html"))
shutil.copy2(os.path.join(ROOT, "styles.css"), os.path.join(DIST, "styles.css"))
shutil.copytree(os.path.join(ROOT, "src"), os.path.join(DIST, "src"))

# Copy generated assets excluding reference photos if unused
assets_dst = os.path.join(DIST, "assets")
os.makedirs(assets_dst, exist_ok=True)
for folder in ["textures", "sprites", "scenes"]:
    src_sub = os.path.join(ROOT, "assets", folder)
    if os.path.exists(src_sub):
        shutil.copytree(src_sub, os.path.join(assets_dst, folder))

print("Built clean Cloudflare Pages bundle in:", DIST)
