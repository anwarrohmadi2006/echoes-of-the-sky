# Pengujian Perangkat Lunak & Aplikasi Web Interaktif — ECHOES of the Sky

Repositori resmi implementasi aplikasi dan skrip pengujian otomatis untuk **Praktikum 1 (Pengujian Fungsional & Struktural Dasar)** serta **Praktikum 2 (Studi Kasus Kelompok: *ECHOES of the Sky — Prolog: Penerbangan Yang Pertama*)**, mencakup sumber aplikasi, diagram *Use Case* dan *Flowgraph*, skrip uji terautomasi, serta bukti eksekusi pengujian.

---

## Tautan Publikasi

- **Aplikasi Produksi Praktikum 2 (Cloudflare Pages):** https://echoes-of-the-sky.pages.dev
- **Target Pengujian Situs Publik Praktikum 1 (Swag Labs):** https://www.saucedemo.com/
- **Repositori GitHub:** https://github.com/anwarrohmadi2006/echoes-of-the-sky

---

## Ringkasan Ruang Lingkup Proyek

### 1. Praktikum 1 — Black Box & White Box Testing (Individu)
- **Black Box Testing Web Eksternal (`tests/praktikum1_blackbox_web.py`):**
  Menguji fungsionalitas situs e-commerce publik *Swag Labs* (`https://www.saucedemo.com/`) menggunakan Playwright pada **10 skenario uji (5 Invalid & 5 Valid)** meliputi validasi autentikasi kosong/salah/akun terkunci (`locked_out_user`), pengurutan harga (*low to high*), pengelolaan keranjang belanja (*add/remove cart*), hingga validasi dan penyelesaian formulir *checkout*.
- **White Box Testing — *Basis Path* (`src/core/praktikum1Stok.py`):**
  Analisis grafik alir (*Flowgraph*) dan *Cyclomatic Complexity* terhadap fungsi `cek_stok(stok)` dengan metrik $N=7$, $E=8$, $P=2 \implies V(G)=3$ (Region = 3) dan verifikasi pada 5 kasus uji nilai batas serta masukan negatif (`-5`, `-1`, `0`, `1`, `25`).

### 2. Praktikum 2 — Studi Kasus Kelompok (*ECHOES of the Sky*)
Aplikasi gim edukasi interaktif berbasis web (*2D Visual Novel & Point-and-Click*) yang merekonstruksi perjalanan perdana **Bacharuddin Jusuf Habibie (Rudy)** pada April 1955 dari Bandara Kemayoran (Jakarta) menuju Aachen, Jerman Barat:
- **Arsitektur Modular Tanpa *Bundler* (UMD):** Pemisahan murni logika aturan main (`src/core/*`) dari lapisan DOM/audio (`src/ui/*`, `src/audio/*`, `src/main.js`) agar seluruh fungsi dapat dijalankan secara langsung di peramban sekaligus diuji melalui Node.js Test Runner.
- **Alur Cerita & Mekanik Interaktif:**
  - *Epigraf Pembuka:* Kutipan tematik Leonardo Da Vinci.
  - *Adegan 1 (Bandara Kemayoran, 1955):* Inspeksi *Kalung Emas Mami* serta perpisahan keluarga di landasan pesawat KLM Constellation.
  - *Adegan 2 (Kabin Connie & Langit Malam Bangkok):* Pelacakan rute transit Asia–Eropa, buku *De Idioot*, dan peristiwa interaktif percikan api mesin sayap (`"Vuur! Vuur!"`).
  - *Adegan 3 & Free Roam Pertama (Frankenberg Str. 16, Aachen):* Eksplorasi Meja Belajar (Buku Fisika, Kamus Bahasa Jerman, Piringan Hitam *Warsaw Concerto* dengan Web Audio prosedural), Jendela Kamar pasca-PD II, serta uji percakapan bahasa Jerman melawan Ibu Indekos **Frau Neuefeiend** menuju Perpustakaan Kampus **RWTH Aachen**.
- **Suite Pengujian Otomatis:**
  - **Black Box End-to-End Live (`tests/blackbox_e2e.py`):** 10 skenario (`BB-01` s.d. `BB-10`) dieksekusi langsung terhadap lingkungan produksi Cloudflare Pages (`https://echoes-of-the-sky.pages.dev`), termasuk pengujian batas masukan, penolakan kondisi prasyarat RWTH, verifikasi nol galat konsol/jaringan, dan responsivitas layar *mobile* (`390x844` tanpa *overflow*).
  - **White Box *Basis Path Testing* (`tests/whitebox.test.js`):** 10 *unit test* terisolasi menggunakan `node --test` untuk `evaluasiDialogJerman()` ($N=11, E=14, P=4 \implies V(G)=5$), `cekKelayakanKeRWTH()` ($N=9, E=11, P=3 \implies V(G)=4$), dan `tanganiInsidenBangkok()`.

---

## Struktur Direktori Repositori

```text
ECHOES/
├── index.html                        # Dokumen antarmuka utama aplikasi web
├── styles.css                        # Tata letak responsif & tema kertas tahun 1955
├── assets/
│   ├── references/                   # Ilustrasi karakter referensi asli
│   ├── scenes/                       # Latar adegan 2D (Kemayoran, Kabin, Aachen, Kamar, RWTH)
│   ├── sprites/                      # Sprite karakter Rudy (base, Kemayoran, Aachen)
│   └── textures/                     # Ubin tekstur kertas cat air seamless
├── src/
│   ├── audio/soundscape.js           # Mesin audio prosedural Web Audio API
│   ├── core/
│   │   ├── dialogValidator.js        # Validasi dialog Jerman — Target White Box #1
│   │   ├── freeRoamRules.js          # Aturan kelayakan RWTH & insiden Bangkok — Target White Box #2
│   │   ├── praktikum1Stok.py         # Fungsi cek_stok(stok) untuk Praktikum 1 White Box
│   │   ├── stateEngine.js            # Pengelola state permainan
│   │   └── storyData.js              # Skrip narasi, hotspot, dan percabangan alur
│   ├── ui/sceneIllustrations.js      # Perender panggung adegan, rute & hotspot SVG
│   └── main.js                       # Orkestrator UI, event listener, modal & pramuatan aset
├── tests/
│   ├── praktikum1_blackbox_web.py    # 10 skenario Black Box situs publik Swag Labs (Praktikum 1)
│   ├── blackbox_e2e.py               # 10 skenario Black Box E2E live game & mobile (Praktikum 2)
│   └── whitebox.test.js              # 10 unit test Basis Path White Box Node.js (Praktikum 2)
├── scripts/
│   ├── build_dist.py                 # Pembuat bundel statis dist/ untuk deployment Cloudflare Pages
│   ├── generate_diagrams.py          # Generator diagram Use Case & Flowgraph PNG
│   └── prepare_textures.py           # Utilitas pemroses sprite & tekstur kertas cat air
└── docs/
    └── evidence/                     # Bukti tangkapan layar eksekusi, diagram & log terminal
```

---

## Matriks Ringkas Hasil Pengujian

| Ruang Lingkup | Metode & Berkas Skrip | Cakupan Kasus Uji | Hasil Verifikasi |
| :--- | :--- | :--- | :--- |
| **Praktikum 1 — Black Box** | Playwright (`tests/praktikum1_blackbox_web.py`) | 10 skenario (`P1-BB-01`..`P1-BB-10`, 5 Invalid & 5 Valid pada `saucedemo.com`) | **10/10 PASS** |
| **Praktikum 1 — White Box** | Python (`src/core/praktikum1Stok.py`) | Fungsi `cek_stok(stok)` dengan $V(G)=3$, 5 skenario nilai uji (`-5, -1, 0, 1, 25`) | **5/5 PASS** |
| **Praktikum 2 — Black Box E2E** | Playwright (`tests/blackbox_e2e.py`) | 10 skenario (`BB-01`..`BB-10`) live pada `echoes-of-the-sky.pages.dev` + *mobile check* | **10/10 PASS** (`0` console/page/network errors) |
| **Praktikum 2 — White Box** | Node.js Test Runner (`tests/whitebox.test.js`) | `evaluasiDialogJerman` ($V(G)=5$) & `cekKelayakanKeRWTH` ($V(G)=4$) + insiden Bangkok | **10/10 PASS** |

---

## Panduan Menjalankan Aplikasi & Pengujian Secara Lokal

### 1. Menjalankan Aplikasi Web Praktikum 2 Secara Lokal
```bash
python scripts/build_dist.py
python -m http.server 8080 --directory dist
# Buka http://localhost:8080 pada peramban
```

### 2. Menjalankan Pengujian White Box
```bash
# Praktikum 2 (Node.js Built-in Test Runner)
node --test tests/whitebox.test.js

# Praktikum 1 (Fungsi cek_stok)
python src/core/praktikum1Stok.py
```

### 3. Menjalankan Pengujian Black Box (Playwright)
```bash
# Praktikum 1 (Situs Publik Swag Labs)
python tests/praktikum1_blackbox_web.py

# Praktikum 2 (Live Production Cloudflare Pages)
python tests/blackbox_e2e.py --url https://echoes-of-the-sky.pages.dev
```

---

## Informasi Penyusun

- **Nama:** Anwar Rohmadi
- **NIM:** 247411027
- **Kelas:** B
- **Kelompok:** Kelompok 5 (*Sistem Game Edukasi CRACK — Echoes of the Sky*)
- **Mata Kuliah:** Rekayasa Perangkat Lunak
