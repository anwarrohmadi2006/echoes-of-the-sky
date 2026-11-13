def cek_stok(stok):
    """Fungsi White Box Testing Tugas Praktikum 1 (Slide 17)."""
    if stok < 0:
        hasil = 'Input salah'
    elif stok == 0:
        hasil = 'Habis'
    else:
        hasil = 'Tersedia'
    return hasil


if __name__ == '__main__':
    uji = [(-5, 'Input salah'), (-1, 'Input salah'), (0, 'Habis'), (1, 'Tersedia'), (25, 'Tersedia')]
    for nilai, expected in uji:
        actual = cek_stok(nilai)
        status = 'PASS' if actual == expected else 'FAIL'
        print(f'stok={nilai:>3} | expected={expected:<12} | actual={actual:<12} | {status}')
