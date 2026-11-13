(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesFreeRoamRules = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Memvalidasi apakah Rudy diizinkan meninggalkan indekos Frankenberg Str. 16
   * menuju Perpustakaan Kampus RWTH Aachen.
   *
   * @param {string[]} objekDiperiksa - Daftar ID objek kamar yang telah diperiksa.
   * @param {boolean} lulusUjiJerman - Apakah interaksi bahasa Jerman dengan Ibu Neuefeiend sudah lulus.
   * @returns {{ bolehBerangkat: boolean, kode: string, pesan: string }}
   */
  function cekKelayakanKeRWTH(objekDiperiksa, lulusUjiJerman) {
    if (!Array.isArray(objekDiperiksa) || objekDiperiksa.length === 0) {
      return {
        bolehBerangkat: false,
        kode: 'LOCKED_NO_EXPLORE',
        pesan: 'Periksa dulu kamar indekosmu (Meja Belajar dan Jendela Kamar) sebelum keluar.'
      };
    }

    const sudahCekMeja = objekDiperiksa.includes('physics_books') ||
      objekDiperiksa.includes('german_dict') ||
      objekDiperiksa.includes('warsaw_lp');
    const sudahCekJendela = objekDiperiksa.includes('window');

    if (!sudahCekMeja || !sudahCekJendela) {
      return {
        bolehBerangkat: false,
        kode: 'LOCKED_INCOMPLETE_ROOM',
        pesan: 'Lengkapi orientasi awal: periksa minimal satu benda di Meja Belajar serta Jendela Kamar Aachen.'
      };
    }

    if (!lulusUjiJerman) {
      return {
        bolehBerangkat: false,
        kode: 'LOCKED_NEED_FRAU_DIALOG',
        pesan: 'Sapa dan uji bahasa Jermanmu dengan Ibu Neuefeiend di lorong sebelum berangkat ke RWTH Aachen.'
      };
    }

    return {
      bolehBerangkat: true,
      kode: 'READY_RWTH',
      pesan: 'Berbekal mantel anak-anak, kamus Jerman, dan restu sapaan Frau Neuefeiend, Rudy berjalan menuju Perpustakaan RWTH Aachen.'
    };
  }

  /**
   * Mengevaluasi respons cutscene interaktif percikan api di langit malam Bangkok.
   *
   * @param {string} aksiPemain - Jenis aksi ('panic_shout' | 'inspect_alert').
   * @param {number} ketenanganAwal - Nilai ketenangan Rudy saat ini (0-100).
   * @returns {{ status: string, teriakan: string, ketenanganAkhir: number, humorAktif: boolean }}
   */
  function tanganiInsidenBangkok(aksiPemain, ketenanganAwal) {
    const base = typeof ketenanganAwal === 'number' && !Number.isNaN(ketenanganAwal) ? ketenanganAwal : 70;
    if (aksiPemain === 'panic_shout') {
      const akhir = Math.max(10, base - 15);
      return {
        status: 'PANIC_VUUR',
        teriakan: 'Vuur! Vuur! (Api! Api!)',
        ketenanganAkhir: akhir,
        humorAktif: true
      };
    } else if (aksiPemain === 'inspect_alert') {
      const akhir = Math.max(10, base - 5);
      return {
        status: 'CURIOUS_VUUR',
        teriakan: 'Vuur! Vuur! — lihat baling-baling sayapnya!',
        ketenanganAkhir: akhir,
        humorAktif: true
      };
    }
    return {
      status: 'INVALID_ACTION',
      teriakan: '',
      ketenanganAkhir: base,
      humorAktif: false
    };
  }

  return {
    cekKelayakanKeRWTH: cekKelayakanKeRWTH,
    tanganiInsidenBangkok: tanganiInsidenBangkok
  };
}));
