import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUT_DIR = r"C:\Users\user\Downloads\ECHOES\docs\evidence"
os.makedirs(OUT_DIR, exist_ok=True)


def draw_node(ax, x, y, text, r=0.40):
    circ = patches.Circle((x, y), r, facecolor="#FFFFFF", edgecolor="#000000", linewidth=1.6, zorder=4)
    ax.add_patch(circ)
    ax.text(x, y, text, ha="center", va="center", fontsize=10, fontweight="bold", color="#000000", zorder=5)


def draw_pill_node(ax, x, y, w, h, text, fontsize=8.4):
    rect = patches.FancyBboxPatch(
        (x - w / 2, y - h / 2), w, h,
        boxstyle="round,pad=0.05,rounding_size=0.20",
        facecolor="#FFFFFF", edgecolor="#000000", linewidth=1.55, zorder=4
    )
    ax.add_patch(rect)
    ax.text(x, y, text, ha="center", va="center", fontsize=fontsize, fontweight="bold", color="#000000", zorder=5)


def draw_box(ax, x, y, w, h, text, bold=False, fontsize=8.8):
    rect = patches.FancyBboxPatch(
        (x - w / 2, y - h / 2), w, h,
        boxstyle="round,pad=0.05,rounding_size=0.07",
        facecolor="#FFFFFF", edgecolor="#000000", linewidth=1.3, zorder=4
    )
    ax.add_patch(rect)
    ax.text(
        x, y, text, ha="center", va="center",
        fontsize=fontsize, fontweight=("bold" if bold else "normal"),
        color="#000000", zorder=5
    )


def draw_arrow(ax, x1, y1, x2, y2, label=None, lx_off=0.0, ly_off=0.0, rad=0.0):
    arrow = patches.FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="-|>", mutation_scale=13, linewidth=1.35, color="#000000",
        connectionstyle=f"arc3,rad={rad}", zorder=3
    )
    ax.add_patch(arrow)
    if label:
        mx, my = (x1 + x2) / 2 + lx_off, (y1 + y2) / 2 + ly_off
        ax.text(
            mx, my, label, ha="center", va="center", fontsize=8.5, fontweight="bold",
            bbox=dict(boxstyle="square,pad=0.14", facecolor="#FFFFFF", edgecolor="none"), zorder=6
        )


def make_flowgraph_stok():
    fig, ax = plt.subplots(figsize=(9.2, 6.8), dpi=240)
    ax.set_xlim(-1.8, 10.2)
    ax.set_ylim(-1.1, 8.2)
    ax.axis("off")

    ax.text(4.2, 7.85, "Flowgraph White Box Testing — Fungsi cek_stok(stok)", ha="center", va="center", fontsize=12, fontweight="bold")
    ax.text(4.2, 7.42, "N = 7, E = 8, P = 2  |  V(G) = E - N + 2 = 3  |  P + 1 = 3  |  Region = 3", ha="center", va="center", fontsize=9.5)

    draw_node(ax, 2.4, 6.5, "1")
    draw_box(ax, 5.0, 6.5, 3.0, 0.48, "Mulai / Input stok")

    draw_node(ax, 2.4, 5.1, "2")
    draw_box(ax, 5.2, 5.1, 3.2, 0.48, "Keputusan 1: stok < 0 ?", bold=True)

    draw_pill_node(ax, 0.2, 3.4, 2.6, 0.56, "(3) hasil = 'Input salah'")

    draw_node(ax, 4.8, 3.5, "4")
    draw_box(ax, 7.7, 3.5, 3.2, 0.48, "Keputusan 2: stok == 0 ?", bold=True)

    draw_pill_node(ax, 3.0, 1.85, 2.2, 0.54, "(5) hasil = 'Habis'")
    draw_pill_node(ax, 6.8, 1.85, 2.4, 0.54, "(6) hasil = 'Tersedia'")

    draw_node(ax, 3.8, 0.25, "7")
    draw_box(ax, 3.8, -0.58, 2.6, 0.44, "Return hasil (Selesai)")

    draw_arrow(ax, 2.4, 6.10, 2.4, 5.50)
    draw_arrow(ax, 2.08, 4.80, 0.55, 3.74, "True", lx_off=-0.35, ly_off=0.14)
    draw_arrow(ax, 2.72, 4.80, 4.46, 3.80, "False", lx_off=0.35, ly_off=0.14)
    draw_arrow(ax, 0.2, 3.05, 3.40, 0.38, rad=0.18)
    draw_arrow(ax, 4.46, 3.20, 3.25, 2.18, "True", lx_off=-0.35, ly_off=0.12)
    draw_arrow(ax, 5.14, 3.20, 6.45, 2.18, "False", lx_off=0.35, ly_off=0.12)
    draw_arrow(ax, 3.0, 1.52, 3.62, 0.62)
    draw_arrow(ax, 6.8, 1.52, 4.18, 0.42)

    ax.text(2.15, 2.75, "R1", fontsize=10, fontweight="bold")
    ax.text(4.8, 1.50, "R2", fontsize=10, fontweight="bold")
    ax.text(9.0, 5.8, "R3 (Luar)", fontsize=9.5, fontweight="bold")

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, "flowgraph_praktikum1_stok.png"), facecolor="#FFFFFF")
    plt.close(fig)


def make_usecase_diagram():
    fig, ax = plt.subplots(figsize=(9.5, 6.2), dpi=240)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")

    ax.text(6.0, 7.62, "Use Case Fitur yang Diuji — ECHOES of the Sky (Kelompok 5)", ha="center", va="center", fontsize=12, fontweight="bold")

    boundary = patches.Rectangle((3.2, 0.5), 7.8, 6.6, fill=False, edgecolor="#000000", linewidth=1.8)
    ax.add_patch(boundary)
    ax.text(7.1, 6.82, "Sistem Game HTML: ECHOES (Prolog & Free Roam Aachen)", ha="center", va="center", fontsize=10, fontweight="bold")

    ax.add_patch(patches.Circle((1.2, 4.9), 0.35, fill=False, edgecolor="#000000", linewidth=1.6))
    ax.plot([1.2, 1.2], [4.55, 3.45], color="#000000", linewidth=1.6)
    ax.plot([0.6, 1.8], [4.2, 4.2], color="#000000", linewidth=1.6)
    ax.plot([1.2, 0.75], [3.45, 2.65], color="#000000", linewidth=1.6)
    ax.plot([1.2, 1.65], [3.45, 2.65], color="#000000", linewidth=1.6)
    ax.text(1.2, 2.25, "Player\n(Rudy Habibie)", ha="center", va="center", fontsize=9.5, fontweight="bold")

    usecases = [
        (6.9, 6.0, "UC-01: Memulai Prolog & Navigasi Adegan 1–3"),
        (6.9, 4.9, "UC-02: Inspeksi Kalung Emas & Perpisahan Kemayoran"),
        (6.9, 3.8, "UC-03: Cutscene Insiden Mesin Bangkok ('Vuur! Vuur!')"),
        (6.9, 2.7, "UC-04: Eksplorasi Kamar Indekos (Meja, Jendela, Warsaw LP)"),
        (6.9, 1.4, "UC-05: Uji Bahasa Jerman (Ibu Neuefeiend) & Akses RWTH")
    ]

    for ux, uy, label in usecases:
        ell = patches.Ellipse((ux, uy), 6.4, 0.85, facecolor="#FFFFFF", edgecolor="#000000", linewidth=1.5)
        ax.add_patch(ell)
        ax.text(ux, uy, label, ha="center", va="center", fontsize=9, fontweight="bold")
        ax.plot([1.85, ux - 3.2], [4.0, uy], color="#000000", linewidth=1.2)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, "usecase_echoes_prolog.png"), facecolor="#FFFFFF")
    plt.close(fig)


def make_flowgraph_dialog_jerman():
    fig, ax = plt.subplots(figsize=(11.4, 8.6), dpi=240)
    ax.set_xlim(-1.8, 13.8)
    ax.set_ylim(-1.8, 9.6)
    ax.axis("off")

    ax.text(6.0, 9.22, "Flowgraph White Box #1 — Fungsi evaluasiDialogJerman(inputTeks, sudahBacaKamus)", ha="center", va="center", fontsize=11.5, fontweight="bold")
    ax.text(6.0, 8.80, "N = 11, E = 14, P = 4  |  V(G) = E - N + 2 = 5  |  P + 1 = 5  |  Region = 5", ha="center", va="center", fontsize=9.5)

    draw_node(ax, 3.2, 8.0, "1")
    draw_box(ax, 6.5, 8.0, 4.6, 0.46, "Mulai: terima (inputTeks, sudahBacaKamus)")

    draw_node(ax, 3.2, 6.7, "2")
    draw_box(ax, 7.0, 6.7, 5.2, 0.46, "D1: typeof !== 'string' || trim.length === 0 ?", bold=True)

    draw_pill_node(ax, 0.4, 5.2, 2.7, 0.56, "(3) INVALID_EMPTY (0)", fontsize=8.2)

    draw_node(ax, 5.3, 5.3, "4")
    draw_box(ax, 8.8, 5.3, 4.2, 0.46, "D2: teksBersih.length > 80 ?", bold=True)

    draw_pill_node(ax, 2.8, 3.8, 2.8, 0.56, "(5) INVALID_LENGTH (0)", fontsize=8.2)

    draw_node(ax, 7.4, 3.9, "6")
    draw_box(ax, 10.6, 3.9, 4.0, 0.46, "D3: cocok && sudahBacaKamus ?", bold=True)

    draw_pill_node(ax, 5.1, 2.35, 2.7, 0.54, "(7) PASS_FLUENT (100)", fontsize=8.2)

    draw_node(ax, 9.6, 2.4, "8")
    draw_box(ax, 11.8, 2.4, 2.2, 0.44, "D4: cocok ?", bold=True)

    draw_pill_node(ax, 7.7, 0.9, 2.4, 0.52, "(9) PASS_BASIC (70)", fontsize=8.0)
    draw_pill_node(ax, 11.5, 0.9, 2.9, 0.52, "(10) FAIL_MISUNDERSTOOD", fontsize=7.8)

    draw_node(ax, 5.4, -0.65, "11")
    draw_box(ax, 5.4, -1.30, 2.4, 0.42, "Return / Selesai")

    draw_arrow(ax, 3.2, 7.60, 3.2, 7.10)
    draw_arrow(ax, 2.85, 6.45, 0.85, 5.55, "T", lx_off=-0.25, ly_off=0.14)
    draw_arrow(ax, 3.55, 6.45, 4.96, 5.60, "F", lx_off=0.25, ly_off=0.14)
    draw_arrow(ax, 0.4, 4.86, 4.98, -0.58, rad=0.26)

    draw_arrow(ax, 4.95, 5.02, 3.15, 4.14, "T", lx_off=-0.25, ly_off=0.14)
    draw_arrow(ax, 5.65, 5.02, 7.06, 4.20, "F", lx_off=0.25, ly_off=0.14)
    draw_arrow(ax, 2.8, 3.46, 5.05, -0.35, rad=0.16)

    draw_arrow(ax, 7.05, 3.62, 5.42, 2.68, "T", lx_off=-0.24, ly_off=0.12)
    draw_arrow(ax, 7.75, 3.62, 9.26, 2.70, "F", lx_off=0.24, ly_off=0.12)
    draw_arrow(ax, 5.1, 2.02, 5.36, -0.25)

    draw_arrow(ax, 9.25, 2.12, 8.05, 1.22, "T", lx_off=-0.24, ly_off=0.12)
    draw_arrow(ax, 9.95, 2.12, 11.15, 1.22, "F", lx_off=0.24, ly_off=0.12)
    draw_arrow(ax, 7.7, 0.58, 5.76, -0.48)
    draw_arrow(ax, 11.5, 0.58, 5.82, -0.64, rad=-0.08)

    ax.text(2.5, 5.0, "R1", fontsize=9.5, fontweight="bold")
    ax.text(4.6, 3.2, "R2", fontsize=9.5, fontweight="bold")
    ax.text(6.9, 1.75, "R3", fontsize=9.5, fontweight="bold")
    ax.text(9.6, 0.85, "R4", fontsize=9.5, fontweight="bold")
    ax.text(12.5, 8.0, "R5 (Luar)", fontsize=9.5, fontweight="bold")

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, "flowgraph_dialog_jerman.png"), facecolor="#FFFFFF")
    plt.close(fig)


def make_flowgraph_akses_rwth():
    fig, ax = plt.subplots(figsize=(10.6, 7.4), dpi=240)
    ax.set_xlim(-1.8, 12.2)
    ax.set_ylim(-1.6, 8.5)
    ax.axis("off")

    ax.text(5.2, 8.15, "Flowgraph White Box #2 — Fungsi cekKelayakanKeRWTH(objekDiperiksa, lulusUjiJerman)", ha="center", va="center", fontsize=11.5, fontweight="bold")
    ax.text(5.2, 7.72, "N = 9, E = 11, P = 3  |  V(G) = E - N + 2 = 4  |  P + 1 = 4  |  Region = 4", ha="center", va="center", fontsize=9.5)

    draw_node(ax, 2.8, 6.9, "1")
    draw_box(ax, 6.1, 6.9, 4.5, 0.46, "Mulai: cek objekDiperiksa & lulusUjiJerman")

    draw_node(ax, 2.8, 5.6, "2")
    draw_box(ax, 6.4, 5.6, 4.9, 0.46, "D1: !Array.isArray || length === 0 ?", bold=True)

    draw_pill_node(ax, 0.4, 4.1, 3.0, 0.56, "(3) LOCKED_NO_EXPLORE", fontsize=8.0)

    draw_node(ax, 4.9, 4.2, "4")
    draw_box(ax, 8.3, 4.2, 4.4, 0.46, "D2: !sudahCekMeja || !sudahCekJendela ?", bold=True)

    draw_pill_node(ax, 2.6, 2.65, 3.3, 0.56, "(5) LOCKED_INCOMPLETE_ROOM", fontsize=7.8)

    draw_node(ax, 6.9, 2.7, "6")
    draw_box(ax, 9.6, 2.7, 3.0, 0.46, "D3: !lulusUjiJerman ?", bold=True)

    draw_pill_node(ax, 4.8, 1.1, 3.2, 0.54, "(7) LOCKED_NEED_FRAU_DIALOG", fontsize=7.6)
    draw_pill_node(ax, 9.1, 1.1, 2.4, 0.54, "(8) READY_RWTH", fontsize=8.2)

    draw_node(ax, 4.6, -0.5, "9")
    draw_box(ax, 4.6, -1.15, 2.4, 0.42, "Return / Selesai")

    draw_arrow(ax, 2.8, 6.50, 2.8, 6.00)
    draw_arrow(ax, 2.45, 5.34, 0.78, 4.44, "T", lx_off=-0.25, ly_off=0.14)
    draw_arrow(ax, 3.15, 5.34, 4.56, 4.50, "F", lx_off=0.25, ly_off=0.14)
    draw_arrow(ax, 0.4, 3.76, 4.18, -0.42, rad=0.26)

    draw_arrow(ax, 4.55, 3.92, 2.95, 2.99, "T", lx_off=-0.25, ly_off=0.14)
    draw_arrow(ax, 5.25, 3.92, 6.56, 3.00, "F", lx_off=0.25, ly_off=0.14)
    draw_arrow(ax, 2.6, 2.31, 4.26, -0.22, rad=0.14)

    draw_arrow(ax, 6.55, 2.42, 5.25, 1.44, "T", lx_off=-0.24, ly_off=0.12)
    draw_arrow(ax, 7.25, 2.42, 8.70, 1.44, "F", lx_off=0.24, ly_off=0.12)
    draw_arrow(ax, 4.8, 0.77, 4.64, -0.10)
    draw_arrow(ax, 9.1, 0.77, 5.02, -0.44, rad=-0.09)

    ax.text(2.3, 3.9, "R1", fontsize=9.5, fontweight="bold")
    ax.text(4.3, 2.2, "R2", fontsize=9.5, fontweight="bold")
    ax.text(6.9, 1.0, "R3", fontsize=9.5, fontweight="bold")
    ax.text(10.8, 6.9, "R4 (Luar)", fontsize=9.5, fontweight="bold")

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, "flowgraph_akses_rwth.png"), facecolor="#FFFFFF")
    plt.close(fig)


if __name__ == "__main__":
    make_flowgraph_stok()
    make_usecase_diagram()
    make_flowgraph_dialog_jerman()
    make_flowgraph_akses_rwth()
    print("Regenerated overlap-free diagrams in:", OUT_DIR)
