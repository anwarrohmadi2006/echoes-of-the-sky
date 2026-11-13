(function () {
  'use strict';

  const Story = window.EchoesStoryData;
  const Engine = window.EchoesStateEngine;
  const DialogVal = window.EchoesDialogValidator;
  const Rules = window.EchoesFreeRoamRules;
  const AudioFactory = window.EchoesSoundscape;
  const Illust = window.EchoesSceneIllustrations;

  const soundscape = AudioFactory.createSoundscape();
  let state = Engine.createInitialState();

  // Pramuatan aset lukisan & karakter agar transisi adegan mulus tanpa kedipan jaringan
  [
    'assets/scenes/scene1_kemayoran.jpg',
    'assets/scenes/scene2_cabin_bangkok.jpg',
    'assets/scenes/scene3_aachen_street.jpg',
    'assets/scenes/freeroam_room.jpg',
    'assets/scenes/rwth_library.jpg',
    'assets/sprites/rudy_base.png',
    'assets/sprites/rudy_kemayoran.png',
    'assets/sprites/rudy_aachen.png'
  ].forEach(function (src) {
    const pre = new Image();
    pre.src = src;
  });

  // DOM References
  const screenEpigraph = document.getElementById('screen-epigraph');
  const screenGame = document.getElementById('screen-game');
  const btnStartProlog = document.getElementById('btn-start-prolog');
  const btnResume = document.getElementById('btn-resume-session');
  const btnToggleAudio = document.getElementById('btn-toggle-audio');
  const btnOpenInv = document.getElementById('btn-open-inventory');
  const btnResetGame = document.getElementById('btn-reset-game');
  const hudChapter = document.getElementById('hud-chapter');
  const hudLocation = document.getElementById('hud-location');
  const hudRoute = document.getElementById('hud-route');
  const statCalm = document.getElementById('stat-calm');
  const statFocus = document.getElementById('stat-focus');
  const speakerEl = document.getElementById('narrative-speaker');
  const feedbackEl = document.getElementById('hotspot-feedback');
  const narrativeEl = document.getElementById('narrative-text');
  const choicesEl = document.getElementById('choices-container');
  const sidebarNote = document.getElementById('sidebar-mode-note');
  const freeroamQuickbar = document.getElementById('freeroam-quickbar');
  const journalListEl = document.getElementById('journal-list');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const btnCloseModal = document.getElementById('btn-close-modal');

  function syncIcons() {
    btnOpenInv.innerHTML = Illust.ICONS.bag;
    btnResetGame.innerHTML = Illust.ICONS.reset;
    btnToggleAudio.innerHTML = soundscape.isMuted() ? Illust.ICONS.volumeOff : Illust.ICONS.volumeOn;
  }

  function addJournal(entry) {
    if (entry && !state.journalNotes.includes(entry)) {
      state.journalNotes.push(entry);
    }
  }

  function renderSidebar() {
    statCalm.textContent = String(state.calmness);
    statFocus.textContent = String(state.focus);

    Array.from(document.querySelectorAll('#quest-checklist li')).forEach(function (li) {
      const q = li.getAttribute('data-quest');
      const done =
        q === 'door'
          ? state.phase === 'rwth'
          : state.inspectedObjects.includes(q);
      li.classList.toggle('is-done', done);
    });

    journalListEl.innerHTML = state.journalNotes
      .map(function (note) {
        return '<li>' + note + '</li>';
      })
      .join('');
  }

  function openModal(title, htmlContent) {
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modalBackdrop.classList.remove('is-hidden');
  }

  function closeModal() {
    modalBackdrop.classList.add('is-hidden');
  }

  function render() {
    syncIcons();
    renderSidebar();
    Engine.saveState(state);

    if (state.phase === 'epigraph') {
      screenEpigraph.classList.remove('is-hidden');
      screenGame.classList.add('is-hidden');
      return;
    }

    screenEpigraph.classList.add('is-hidden');
    screenGame.classList.remove('is-hidden');
    feedbackEl.textContent = '';

    if (state.phase === 'prolog') {
      freeroamQuickbar.classList.add('is-hidden');
      sidebarNote.textContent =
        'Ikuti kisah prolog hingga tiba di kamar indekos Frankenberg Str. 16, Aachen.';

      const step = Story.PROLOG_STEPS.find(function (s) {
        return s.id === state.stepId;
      }) || Story.PROLOG_STEPS[0];

      hudChapter.textContent = step.chapter;
      hudLocation.textContent = step.location;
      hudRoute.innerHTML = Illust.buildRouteStrip(Story.TRANSIT_ROUTE, step.routeIndex);
      speakerEl.textContent = step.narrator;
      narrativeEl.textContent = step.text;

      soundscape.playAmbient(step.ambient);
      if (step.isBangkokEvent) {
        soundscape.playSparkSfx();
      }
      if (step.id === 'adegan3_indekos') {
        soundscape.playLopLopSteps();
      }

      Illust.renderPrologStage(step, {
        onHotspot: function (spot) {
          feedbackEl.textContent = spot.description;
          addJournal(spot.description);
          renderSidebar();
        },
        onSparkClick: function () {
          soundscape.playSparkSfx();
          feedbackEl.textContent =
            'Percikan api memutar di motor baling-baling sayap kanan! Pilih reaksi Rudy di bawah.';
        }
      });

      choicesEl.innerHTML = '';
      step.choices.forEach(function (ch) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.textContent = ch.label;
        btn.addEventListener('click', function () {
          if (ch.actionType) {
            const ev = Rules.tanganiInsidenBangkok(ch.actionType, state.calmness);
            state.calmness = Engine.clampStat(ev.ketenanganAkhir);
            state.bangkokEventResolved = true;
          } else {
            state.calmness = Engine.clampStat(state.calmness + (ch.calmDelta || 0));
          }
          state.focus = Engine.clampStat(state.focus + (ch.focusDelta || 0));
          if (ch.journalNote) addJournal(ch.journalNote);

          if (ch.nextStep === 'freeroam_intro') {
            state.phase = 'transition_banner';
          } else {
            state.stepId = ch.nextStep;
          }
          render();
        });
        choicesEl.appendChild(btn);
      });
    } else if (state.phase === 'transition_banner') {
      freeroamQuickbar.classList.add('is-hidden');
      hudChapter.textContent = 'Batas Akhir Prolog';
      hudLocation.textContent = 'Kamar Indekos Frankenberg Str. 16, Aachen';
      hudRoute.innerHTML = Illust.buildRouteStrip(Story.TRANSIT_ROUTE, 6);
      soundscape.playAmbient('none');

      Illust.renderFreeRoamStage(Story.ROOM_HOTSPOTS, state.inspectedObjects, state.warsawPlaying, function () {});
      speakerEl.textContent = 'Sistem';
      narrativeEl.textContent =
        'Prolog selesai! Kontrol sekarang beralih sepenuhnya kepada Anda. Jelajahi kamar sewa dingin di Frankenberg Str. 16: periksa Meja Belajar (Fisika, Kamus Jerman, Warsaw Concerto), lihat Jendela Kota Aachen, lalu uji kemampuan bahasa Jerman bersama Ibu Neuefeiend sebelum ke RWTH Aachen.';
      choicesEl.innerHTML = '';
      const goBtn = document.createElement('button');
      goBtn.type = 'button';
      goBtn.id = 'btn-enter-freeroam-play';
      goBtn.className = 'btn-primary';
      goBtn.textContent = 'Mulai Eksplorasi Kamar (Free Roam)';
      goBtn.addEventListener('click', function () {
        state.phase = 'freeroam';
        render();
      });
      choicesEl.appendChild(goBtn);
    } else if (state.phase === 'freeroam') {
      freeroamQuickbar.classList.remove('is-hidden');
      sidebarNote.textContent =
        'Klik langsung benda di kamar atau tombol akses cepat untuk menyelesaikan tujuan tutorial awal.';
      hudChapter.textContent = 'Gameplay Interaktif • Free Roam Pertama';
      hudLocation.textContent = 'Kamar Indekos Frankenberg Str. 16, Aachen (1955)';
      hudRoute.innerHTML = Illust.buildRouteStrip(Story.TRANSIT_ROUTE, 6);

      Illust.renderFreeRoamStage(Story.ROOM_HOTSPOTS, state.inspectedObjects, state.warsawPlaying, openRoomHotspot);
      speakerEl.textContent = 'Rudy (Kendali Pemain)';
      narrativeEl.textContent =
        'Kamar kecil tanpa pemanas ini menjadi saksi perjuangan awalmu di Jerman. Periksa barang-barang di Meja Belajar, tengok keluar Jendela, lalu temui Ibu Neuefeiend di Pintu Keluar / Lorong.';
      choicesEl.innerHTML = '';

      const statusCheck = Rules.cekKelayakanKeRWTH(state.inspectedObjects, state.passedGermanTest);
      const rwthBtn = document.createElement('button');
      rwthBtn.type = 'button';
      rwthBtn.id = 'btn-walk-rwth';
      rwthBtn.className = statusCheck.bolehBerangkat ? 'btn-primary' : 'choice-btn';
      rwthBtn.textContent = 'Berjalan Keluar Menuju Perpustakaan Kampus RWTH Aachen';
      rwthBtn.addEventListener('click', function () {
        const res = Rules.cekKelayakanKeRWTH(state.inspectedObjects, state.passedGermanTest);
        if (!res.bolehBerangkat) {
          feedbackEl.textContent = res.pesan;
          openModal('Syarat Menuju RWTH Aachen Belum Terpenuhi', '<div class="feedback-banner is-fail">' + res.pesan + '</div>');
        } else {
          state.phase = 'rwth';
          soundscape.toggleWarsawConcerto(false);
          state.warsawPlaying = false;
          addJournal(res.pesan);
          render();
        }
      });
      choicesEl.appendChild(rwthBtn);
    } else if (state.phase === 'rwth') {
      freeroamQuickbar.classList.add('is-hidden');
      hudChapter.textContent = 'Tujuan Tercapai • RWTH Aachen';
      hudLocation.textContent = 'Perpustakaan Kampus RWTH Aachen, Jerman Barat';
      hudRoute.innerHTML = Illust.buildRouteStrip(Story.TRANSIT_ROUTE, 6);
      soundscape.playAmbient('aachen_walk');
      soundscape.playLopLopSteps();

      Illust.renderRwthStage();
      speakerEl.textContent = 'Narator';
      narrativeEl.textContent =
        'Dengan langkah sepatu Sioux yang berbunyi "lop-lop", mantel anak-anak, kamus bahasa Jerman, dan amanah kalung emas Mami di saku, Rudy tiba di Perpustakaan Kampus RWTH Aachen. Bab Prolog & Free Roam Pertama selesai!';
      choicesEl.innerHTML = '';

      const backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.className = 'choice-btn';
      backBtn.textContent = 'Kembali Menjelajah Kamar Indekos';
      backBtn.addEventListener('click', function () {
        state.phase = 'freeroam';
        render();
      });
      choicesEl.appendChild(backBtn);
    }
  }

  function openRoomHotspot(key) {
    if (key === 'desk') {
      const desk = Story.ROOM_HOTSPOTS.desk;
      const cards = desk.subItems
        .map(function (item) {
          const checked = state.inspectedObjects.includes(item.id) ? ' (Sudah diperiksa ✓)' : '';
          let actionHtml =
            '<button type="button" class="btn-secondary" data-inspect-sub="' + item.id + '">Periksa ' + item.label + '</button>';
          if (item.isMusicPlayer) {
            actionHtml =
              '<button type="button" class="btn-primary" id="btn-toggle-warsaw" data-inspect-sub="warsaw_lp">' +
              (state.warsawPlaying ? 'Hentikan Warsaw Concerto' : 'Putar Piringan Hitam Warsaw Concerto') +
              '</button>';
          }
          return (
            '<div class="item-box">' +
            '<h4>' + item.label + checked + '</h4>' +
            '<p>' + item.detail + '</p>' +
            actionHtml +
            '</div>'
          );
        })
        .join('');

      openModal('Meja Belajar Rudy', '<div class="modal-subcards">' + cards + '</div>');

      Array.from(modalBody.querySelectorAll('[data-inspect-sub]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          const subId = btn.getAttribute('data-inspect-sub');
          Engine.recordInspected(state, subId);
          if (subId === 'warsaw_lp') {
            state.warsawPlaying = !state.warsawPlaying;
            soundscape.toggleWarsawConcerto(state.warsawPlaying);
            state.calmness = Engine.clampStat(state.calmness + 8);
            addJournal('Memutar piringan hitam klasik Warsaw Concerto di kamar Aachen.');
          } else if (subId === 'german_dict') {
            state.focus = Engine.clampStat(state.focus + 10);
            addJournal('Mempelajari sapaan dasar dari Kamus Bahasa Jerman.');
          } else if (subId === 'physics_books') {
            state.focus = Engine.clampStat(state.focus + 10);
            addJournal('Membaca buku-buku fisika dasar persiapan kuliah di RWTH.');
          }
          render();
          openRoomHotspot('desk');
        });
      });
    } else if (key === 'window') {
      Engine.recordInspected(state, 'window');
      addJournal('Mengamati pemandangan sisa reruntuhan pasca-PD II kota Aachen dari jendela kamar.');
      render();
      openModal(
        'Jendela Kamar • Kota Aachen 1955',
        '<div class="item-box"><h4>Pemandangan Pasca-Perang Dunia II</h4><p>' +
          Story.ROOM_HOTSPOTS.window.detail +
          '</p></div>'
      );
    } else if (key === 'bag') {
      Engine.recordInspected(state, 'bag');
      render();
      openModal(
        'Wastafel & Tas Kulit Lusuh',
        '<div class="item-box"><h4>Kondisi Kamar Indekos Tanpa Pemanas</h4><p>' +
          Story.ROOM_HOTSPOTS.bag.detail +
          '</p></div>'
      );
    } else if (key === 'door') {
      openGermanDialogModal();
    }
  }

  function openGermanDialogModal(lastResult, lastInput) {
    const chipsHtml = Story.GERMAN_PHRASE_OPTIONS.map(function (opt, idx) {
      return (
        '<button type="button" class="phrase-chip" data-phrase-idx="' +
        idx +
        '"><strong>' +
        opt.label +
        '</strong> — <em>' +
        opt.meaning +
        '</em></button>'
      );
    }).join('');

    const dictNotice = state.hasReadDictionary
      ? '<p class="sidebar-note">Status Kamus: <strong>Sudah dibaca ✓</strong> (Berpotensi meraih nilai fasih 100).</p>'
      : '<p class="sidebar-note">Status Kamus: <strong>Belum dibaca</strong> (Periksa Kamus Bahasa Jerman di Meja Belajar untuk pelafalan fasih).</p>';

    const resultHtml = lastResult
      ? '<div id="german-eval-result" class="feedback-banner ' +
        (lastResult.lolos ? 'is-pass' : 'is-fail') +
        '">[' +
        lastResult.status +
        ' | Skor: ' +
        lastResult.skor +
        '] ' +
        lastResult.pesan +
        '</div>'
      : '<div id="german-eval-result"></div>';

    const proceedBtnHtml = state.passedGermanTest
      ? '<button type="button" id="btn-modal-go-rwth" class="btn-primary" style="margin-top:12px;">Berjalan Menuju Perpustakaan RWTH Aachen</button>'
      : '';

    openModal(
      'Pintu Keluar & Lorong • Uji Bahasa Jerman (Frau Neuefeiend)',
      '<p>Frau Neuefeiend menyapamu di lorong rumah indekos Frankenberg Str. 16: <em>"Guten Tag, Herr Habibie! Wohin gehen Sie heute?"</em></p>' +
        dictNotice +
        '<div class="phrase-chips">' +
        chipsHtml +
        '</div>' +
        '<form id="form-german-dialog" class="german-form" novalidate>' +
        '<label for="input-german-speech"><strong>Ketik jawaban bahasa Jerman (maks. 80 karakter):</strong></label>' +
        '<input type="text" id="input-german-speech" class="german-input" placeholder="Contoh: Guten Tag, Frau Neuefeiend. Ich studiere an der RWTH." value="' +
        (lastInput ? lastInput.replace(/"/g, '&quot;') : '') +
        '" />' +
        '<button type="submit" id="btn-submit-german" class="btn-primary">Ucapkan Kalimat</button>' +
        '</form>' +
        resultHtml +
        proceedBtnHtml
    );

    const inputEl = document.getElementById('input-german-speech');
    Array.from(modalBody.querySelectorAll('[data-phrase-idx]')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        const idx = Number(chip.getAttribute('data-phrase-idx'));
        inputEl.value = Story.GERMAN_PHRASE_OPTIONS[idx].label;
      });
    });

    const formEl = document.getElementById('form-german-dialog');
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      const rawText = inputEl.value;
      const evalRes = DialogVal.evaluasiDialogJerman(rawText, state.hasReadDictionary);
      if (evalRes.lolos) {
        state.passedGermanTest = true;
        state.germanScore = evalRes.skor;
        Engine.recordInspected(state, 'door');
        addJournal('Berhasil menyapa Frau Neuefeiend dalam bahasa Jerman (' + evalRes.status + ').');
      }
      render();
      openGermanDialogModal(evalRes, rawText);
    });

    const goRwthModalBtn = document.getElementById('btn-modal-go-rwth');
    if (goRwthModalBtn) {
      goRwthModalBtn.addEventListener('click', function () {
        const check = Rules.cekKelayakanKeRWTH(state.inspectedObjects, state.passedGermanTest);
        if (!check.bolehBerangkat) {
          const box = document.getElementById('german-eval-result');
          box.className = 'feedback-banner is-fail';
          box.textContent = check.pesan;
          return;
        }
        closeModal();
        state.phase = 'rwth';
        soundscape.toggleWarsawConcerto(false);
        state.warsawPlaying = false;
        addJournal(check.pesan);
        render();
      });
    }
  }

  function openInventoryModal() {
    const items = state.inventory
      .map(function (it) {
        return '<div class="item-box"><h4>' + it.name + '</h4><p>' + it.detail + '</p></div>';
      })
      .join('');
    openModal('Tas Kulit Lusuh & Barang Bawaan Rudy', '<div class="modal-subcards">' + items + '</div>');
  }

  // Global Event Bindings
  btnStartProlog.addEventListener('click', function () {
    Engine.clearState();
    state = Engine.createInitialState();
    state.phase = 'prolog';
    state.stepId = 'adegan1_ambang';
    render();
  });

  btnResume.addEventListener('click', function () {
    const saved = Engine.loadState();
    if (saved) {
      state = saved;
      render();
    }
  });

  btnToggleAudio.addEventListener('click', function () {
    const nextMuted = !soundscape.isMuted();
    soundscape.setMuted(nextMuted);
    if (!nextMuted && state.phase === 'prolog') {
      const step = Story.PROLOG_STEPS.find(function (s) {
        return s.id === state.stepId;
      });
      if (step) soundscape.playAmbient(step.ambient);
    }
    syncIcons();
  });

  btnOpenInv.addEventListener('click', openInventoryModal);

  btnResetGame.addEventListener('click', function () {
    soundscape.stopAmbient();
    soundscape.toggleWarsawConcerto(false);
    Engine.clearState();
    state = Engine.createInitialState();
    state.phase = 'epigraph';
    render();
  });

  btnCloseModal.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', function (ev) {
    if (ev.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modalBackdrop.classList.contains('is-hidden')) {
      closeModal();
    }
  });

  Array.from(document.querySelectorAll('[data-quick-hotspot]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      openRoomHotspot(btn.getAttribute('data-quick-hotspot'));
    });
  });

  // Boot check for saved session
  const existing = Engine.loadState();
  if (existing && existing.phase !== 'epigraph') {
    btnResume.classList.remove('is-hidden');
  }
  render();
}());
