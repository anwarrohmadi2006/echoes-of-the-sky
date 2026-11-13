(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesDialogValidator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Mengevaluasi kalimat bahasa Jerman yang dimasukkan atau dipilih pemain
   * saat berinteraksi dengan Ibu Indekos (Frau Neuefeiend) di lorong Frankenberg Str. 16.
   *
   * @param {string} inputTeks - Ucapan bahasa Jerman dari pemain.
   * @param {boolean} sudahBacaKamus - Apakah pemain sudah memeriksa Kamus Bahasa Jerman di meja belajar.
   * @returns {{ status: string, skor: number, lolos: boolean, pesan: string }}
   */
  function evaluasiDialogJerman(inputTeks, sudahBacaKamus) {
    if (typeof inputTeks !== 'string' || inputTeks.trim().length === 0) {
      return {
        status: 'INVALID_EMPTY',
        skor: 0,
        lolos: false,
        pesan: 'Rudy masih terdiam. Masukkan atau pilih kalimat bahasa Jerman terlebih dahulu.'
      };
    }

    const teksBersih = inputTeks.trim().toLowerCase();
    if (teksBersih.length > 80) {
      return {
        status: 'INVALID_LENGTH',
        skor: 0,
        lolos: false,
        pesan: 'Kalimat terlalu panjang untuk sapaan lorong (maksimal 80 karakter).'
      };
    }

    const kataKunci = [
      'guten tag',
      'guten morgen',
      'guten abend',
      'danke',
      'ich studiere',
      'rwth',
      'entschuldigung',
      'frau neuefeiend'
    ];
    const cocokKataKunci = kataKunci.some(function (kata) {
      return teksBersih.includes(kata);
    });

    if (cocokKataKunci && Boolean(sudahBacaKamus)) {
      return {
        status: 'PASS_FLUENT',
        skor: 100,
        lolos: true,
        pesan: 'Frau Neuefeiend tersenyum hangat mendengar pelafalan bahasa Jermanmu yang rapi dan sopan.'
      };
    } else if (cocokKataKunci) {
      return {
        status: 'PASS_BASIC',
        skor: 70,
        lolos: true,
        pesan: 'Pelafalanmu masih agak kaku, tetapi Frau Neuefeiend memahami maksudmu dan mengizinkanmu berangkat.'
      };
    } else {
      return {
        status: 'FAIL_MISUNDERSTOOD',
        skor: 25,
        lolos: false,
        pesan: 'Frau Neuefeiend tampak bingung. Periksa Kamus Bahasa Jerman di meja belajar untuk memakai ungkapan yang tepat.'
      };
    }
  }

  return {
    evaluasiDialogJerman: evaluasiDialogJerman
  };
}));
