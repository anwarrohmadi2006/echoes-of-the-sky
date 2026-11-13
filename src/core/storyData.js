(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesStoryData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPIGRAPH = {
    quote:
      'Begitu kamu mencicipi rasanya terbang, kamu akan selalu berjalan dengan mata menatap ke langit, karena kamu pernah ke sana, dan kerinduanmu akan selalu tertuju padanya.',
    author: 'Leonardo Da Vinci',
    subtitle: 'PROLOG: PENERBANGAN YANG PERTAMA',
    yearLocation: 'Jakarta — Aachen, April 1955'
  };

  const TRANSIT_ROUTE = [
    { id: 'jakarta', name: 'Jakarta (Kemayoran)', note: 'Titik keberangkatan April 1955' },
    { id: 'bangkok', name: 'Bangkok', note: 'Insiden malam percikan api baling-baling' },
    { id: 'kolkata', name: 'Kolkata', note: 'Transit pengisian bahan bakar' },
    { id: 'karachi', name: 'Karachi', note: 'Perhentian lintas benua Asia' },
    { id: 'teheran', name: 'Teheran', note: 'Langit pegunungan menuju Timur Tengah' },
    { id: 'kairo', name: 'Kairo', note: 'Gerbang terakhir sebelum Laut Tengah' },
    { id: 'amsterdam', name: 'Amsterdam', note: 'Tiba di Eropa sebelum menuju Jerman' }
  ];

  const PROLOG_STEPS = [
    {
      id: 'adegan1_ambang',
      chapter: 'Adegan 1 • Bandara Kemayoran (April 1955)',
      location: 'Bandara Kemayoran, Jakarta',
      routeIndex: 0,
      sceneArt: 'assets/scenes/scene1_kemayoran.jpg',
      sprite: 'assets/sprites/rudy_kemayoran.png',
      ambient: 'wind',
      narrator: 'Narator',
      text:
        'Layar kenangan terbuka dalam rona pudar tahun 1955. Angin landasan Bandara Kemayoran berembus kencang. Bacharuddin Jusuf Habibie (Rudy), pemuda 18 tahun berbalut jas hangat dan kacamata hitam, berdiri di ambang pintu pesawat Constellation (Connie) milik maskapai KLM.',
      hotspots: [
        {
          id: 'family_wave',
          label: 'Mami & Keluarga di Landasan',
          x: 83,
          y: 58,
          description:
            'Di pinggir landasan, Mami (Tuti Marini), keluarga, dan kekasihnya berdiri melambaikan tangan di tengah terpaan angin.'
        },
        {
          id: 'gold_necklace',
          label: 'Kalung Emas di Balik Jas',
          x: 32,
          y: 41,
          description:
            'Rudy menggenggam kalung emas pemberian Mami—bukan untuk kemewahan, melainkan cadangan darurat untuk digadai demi menyambung hidup di negeri orang.'
        }
      ],
      choices: [
        {
          id: 'reflect_sacrifice',
          label: 'Berbalik menatap Mami & meresapi pengorbanan keluarga',
          calmDelta: 5,
          focusDelta: 10,
          journalNote: 'Mengingat pengorbanan tiket kelas pertama Mami, saudara-saudara, dan bayang-bayang almarhum Papi.',
          nextStep: 'adegan1_kalung'
        },
        {
          id: 'grip_necklace',
          label: 'Menggenggam erat kalung emas Mami di balik jas hangat',
          calmDelta: 10,
          focusDelta: 5,
          journalNote: 'Kalung emas Mami disimpan erat sebagai amanah sekaligus cadangan hidup di perantauan.',
          nextStep: 'adegan1_kalung'
        }
      ]
    },
    {
      id: 'adegan1_kalung',
      chapter: 'Adegan 1 • Perpisahan Terakhir',
      location: 'Tangga Pesawat KLM Constellation',
      routeIndex: 0,
      sceneArt: 'assets/scenes/scene1_kemayoran.jpg',
      sprite: 'assets/sprites/rudy_kemayoran.png',
      ambient: 'wind',
      narrator: 'Batin Rudy',
      text:
        'Sebelum melangkah masuk, Rudy berbalik badan untuk terakhir kalinya. Di dadanya terasa beban sekaligus harapan besar: tiket kelas pertama hasil kerja keras Mami dan penjualan aset keluarga, doa saudara-saudara, serta bayang-bayang almarhum Papi yang telah berpulang.',
      choices: [
        {
          id: 'board_connie',
          label: 'Melangkah masuk ke dalam kabin pesawat Constellation',
          calmDelta: 0,
          focusDelta: 5,
          nextStep: 'adegan2_kabin'
        }
      ]
    },
    {
      id: 'adegan2_kabin',
      chapter: 'Adegan 2 • Di Dalam Kabin Pesawat',
      location: 'Kabin KLM Constellation (Menuju Bangkok)',
      routeIndex: 1,
      sceneArt: 'assets/scenes/scene2_cabin_bangkok.jpg',
      sprite: null,
      ambient: 'engine',
      narrator: 'Narator',
      text:
        'Pintu kabin tertutup. Rudy duduk tepat di samping jendela dengan buku tebal berbahasa Belanda karya Dostoevsky berjudul "De Idioot" (Si Bodoh) di pangkuannya. Mesin Connie menderu kencang; getarannya terasa hingga kursi saat pesawat lepas landas menembus awan meninggalkan Tanah Air.',
      choices: [
        {
          id: 'observe_engine',
          label: 'Menatap ke luar jendela — mengamati sayap & mesin di malam Bangkok',
          calmDelta: 0,
          focusDelta: 10,
          nextStep: 'adegan2_bangkok_event'
        }
      ]
    },
    {
      id: 'adegan2_bangkok_event',
      chapter: 'Adegan 2 • Cutscene Interaktif: Langit Malam Bangkok',
      location: 'Wilayah Udara Bangkok (Malam Hari)',
      routeIndex: 1,
      sceneArt: 'assets/scenes/scene2_cabin_bangkok.jpg',
      sprite: null,
      ambient: 'spark',
      isBangkokEvent: true,
      narrator: 'Peristiwa Kabin',
      text:
        'Melalui perjalanan panjang transit Bangkok, Kolkata, Karachi, Teheran, Kairo hingga Amsterdam, Rudy tak bisa tidur—matanya terus menyala oleh rasa ingin tahu akan fisika penerbangan. Tiba-tiba di malam langit Bangkok, percikan api berputar terlihat di baling-baling mesin sayap pesawat!',
      choices: [
        {
          id: 'shout_vuur',
          label: 'Bangkit spontan dan berteriak: "Vuur! Vuur! (Api! Api!)"',
          actionType: 'panic_shout',
          calmDelta: -15,
          focusDelta: 5,
          nextStep: 'adegan2_pramugari'
        },
        {
          id: 'alert_attendant',
          label: 'Memeriksa percikan baling-baling lebih dekat lalu refleks berseru panik',
          actionType: 'inspect_alert',
          calmDelta: -10,
          focusDelta: 10,
          nextStep: 'adegan2_pramugari'
        }
      ]
    },
    {
      id: 'adegan2_pramugari',
      chapter: 'Adegan 2 • Humor Penyelamat Momen Sulit',
      location: 'Kabin KLM Constellation',
      routeIndex: 4,
      sceneArt: 'assets/scenes/scene2_cabin_bangkok.jpg',
      sprite: 'assets/sprites/rudy_base.png',
      ambient: 'engine',
      narrator: 'Pramugari KLM',
      text:
        '"Vuur! Vuur!" Seketika seluruh penumpang terbangun dan panik! Pramugari bergegas menghampiri, menengok keluar jendela, lalu tersenyum menahan geram: "Kamu baru pertama kali naik pesawat, ya? Memang begitu mesinnya. Kadang-kadang terlihat ada putaran api pada motor mesin sayapnya."',
      choices: [
        {
          id: 'laugh_off',
          label: 'Tersipu malu mendengar penumpang cekikikan, lalu ikut menyeringai menertawakan diri sendiri',
          calmDelta: 20,
          focusDelta: 5,
          journalNote: 'Menertawakan kepolosan sendiri ("Vuur! Vuur!") selama transit panjang menuju Amsterdam.',
          nextStep: 'adegan3_jerman'
        }
      ]
    },
    {
      id: 'adegan3_jerman',
      chapter: 'Adegan 3 • Tiba di Jerman Barat (April 1955)',
      location: 'Bonn → Köln → Aachen',
      routeIndex: 6,
      sceneArt: 'assets/scenes/scene3_aachen_street.jpg',
      sprite: 'assets/sprites/rudy_aachen.png',
      ambient: 'aachen_walk',
      narrator: 'Narator',
      text:
        'Waktu melompat ke bulan April 1955 di Jerman Barat. Setelah mengurus dokumen di Kedubes RI Bonn dan menjalani praktikum awal di pabrik mesin Klöckner Humboldt Deutz di Köln, Rudy tiba seorang diri di kota Aachen yang dingin.',
      choices: [
        {
          id: 'walk_aachen',
          label: 'Melangkah menyusuri jalanan dingin menuju Frankenberg Str. 16',
          calmDelta: 0,
          focusDelta: 5,
          nextStep: 'adegan3_indekos'
        }
      ]
    },
    {
      id: 'adegan3_indekos',
      chapter: 'Adegan 3 • Frankenberg Str. 16, Aachen',
      location: 'Depan Rumah Indekos Keluarga Neuefeiend',
      routeIndex: 6,
      sceneArt: 'assets/scenes/scene3_aachen_street.jpg',
      sprite: 'assets/sprites/rudy_aachen.png',
      ambient: 'aachen_walk',
      narrator: 'Narator',
      text:
        'Berbalut mantel anak-anak—karena posturnya tak muat baju dewasa Jerman—membawa tas kulit lusuh dan sepatu moccasin merek Sioux yang sol ausnya berbunyi "lop-lop", Rudy tiba di rumah indekos sederhana keluarga Neuefeiend. Kamarnya kecil, tanpa pemanas ruangan, hanya memiliki wastafel dan toilet luar.',
      choices: [
        {
          id: 'enter_freeroam',
          label: 'Batas Akhir Prolog — Masuk ke Kamar Indekos & Mulai Free Roam',
          calmDelta: 5,
          focusDelta: 10,
          nextStep: 'freeroam_intro'
        }
      ]
    }
  ];

  const ROOM_HOTSPOTS = {
    desk: {
      id: 'desk',
      label: 'Meja Belajar',
      summary: 'Meja kayu sederhana tempat Rudy menata buku fisika, kamus Jerman, dan pemutar piringan hitam.',
      bounds: { left: 6, top: 43, width: 34, height: 34 },
      subItems: [
        {
          id: 'physics_books',
          label: 'Buku-buku Fisika & Teknik Penerbangan',
          detail:
            'Tumpukan diktat mekanika fluida dan termodinamika berbahasa Jerman. Rasa ingin tahu yang dulu memicu teriakan di atas Bangkok kini menemukan bahasanya dalam rumus-rumus aerodinamika.',
          bonusNote: 'Wawasan dasar untuk kuliah di RWTH Aachen terbuka.'
        },
        {
          id: 'german_dict',
          label: 'Kamus Bahasa Jerman (Wörterbuch)',
          detail:
            'Kamus saku penuh catatan tangan. Frasa kunci untuk menyapa Ibu Indekos: "Guten Tag, Frau Neuefeiend", "Ich studiere an der RWTH", "Mein Zimmer ist kalt", dan "Danke".',
          unlocksDictionary: true
        },
        {
          id: 'warsaw_lp',
          label: 'Piringan Hitam Klasik: Warsaw Concerto',
          detail:
            'Piringan hitam karya Richard Addinsell. Ketika jarum gramofon diletakkan, alunan piano dramatis memenuhi kamar dingin tanpa pemanas, mengembalikan ketenangan batin Rudy.',
          isMusicPlayer: true
        }
      ]
    },
    window: {
      id: 'window',
      label: 'Jendela Kamar',
      summary: 'Jendela kayu menghadap kota Aachen musim semi/dingin 1955.',
      bounds: { left: 37, top: 15, width: 25, height: 38 },
      detail:
        'Dari balik kaca jendela berembun, terbentang atap kota Aachen yang masih dipenuhi sisa-sisa bangunan retak dan puing rehabilitasi pasca-Perang Dunia II. Asap cerobong tipis naik di langit kelabu yang dingin, mengingatkan Rudy mengapa ia harus bertahan dan belajar keras.'
    },
    bag: {
      id: 'bag',
      label: 'Wastafel & Tas Kulit Lusuh',
      summary: 'Sudut wastafel keramik dingin tempat meletakkan tas kulit dan mantel anak-anak.',
      bounds: { left: 63, top: 44, width: 14, height: 30 },
      detail:
        'Air keran wastafel sedingin es karena kamar ini tidak dilengkapi pemanas ruangan, dan toilet berada di luar lorong. Di dalam saku mantel, kalung emas Mami dan buku "De Idioot" tetap aman tersimpan.'
    },
    door: {
      id: 'door',
      label: 'Pintu Keluar / Lorong',
      summary: 'Berbicara dengan Ibu Neuefeiend (Uji Bahasa Jerman) atau berangkat ke Perpustakaan RWTH Aachen.',
      bounds: { left: 78, top: 20, width: 18, height: 64 }
    }
  };

  const GERMAN_PHRASE_OPTIONS = [
    {
      label: 'Guten Tag, Frau Neuefeiend. Ich studiere an der RWTH.',
      meaning: 'Selamat siang, Ibu Neuefeiend. Saya kuliah di RWTH.'
    },
    {
      label: 'Guten Morgen, Frau Neuefeiend. Danke für das Zimmer.',
      meaning: 'Selamat pagi, Ibu Neuefeiend. Terima kasih atas kamarnya.'
    },
    {
      label: 'Entschuldigung, ich gehe zur Bibliothek.',
      meaning: 'Permisi, saya berangkat ke perpustakaan.'
    }
  ];

  return {
    EPIGRAPH,
    TRANSIT_ROUTE,
    PROLOG_STEPS,
    ROOM_HOTSPOTS,
    GERMAN_PHRASE_OPTIONS
  };
}));
