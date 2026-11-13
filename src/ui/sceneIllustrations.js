(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesSceneIllustrations = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ICONS = {
    volumeOn: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
    volumeOff: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>',
    bag: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
    desk: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    window: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
    door: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V3h11v18"></path><path d="M3 21h18"></path><circle cx="13" cy="12" r="1"></circle></svg>',
    disc: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="2.5"></circle></svg>',
    compass: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"></polygon></svg>',
    check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    spark: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    reset: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>'
  };

  function buildRouteStrip(routeList, activeIndex) {
    return routeList
      .map(function (stop, idx) {
        const cls = idx === activeIndex ? 'route-stop is-active' : idx < activeIndex ? 'route-stop is-done' : 'route-stop';
        return '<span class="' + cls + '" title="' + stop.note + '">' + stop.name.split(' ')[0] + '</span>';
      })
      .join('<span class="route-sep" aria-hidden="true">-</span>');
  }

  function renderPrologStage(step, handlers) {
    const stageEl = document.getElementById('stage-canvas');
    if (!stageEl) return;

    const hotspotsHtml = (step.hotspots || [])
      .map(function (spot) {
        return (
          '<button type="button" class="hotspot-pin" data-hotspot="' +
          spot.id +
          '" style="left:' +
          spot.x +
          '%;top:' +
          spot.y +
          '%;">' +
          '<span class="hotspot-dot"></span>' +
          '<span class="hotspot-label">' +
          spot.label +
          '</span></button>'
        );
      })
      .join('');

    const sparkOverlay = step.isBangkokEvent
      ? '<div class="bangkok-spark-ring" style="left:60%;top:53%;" aria-hidden="true"><span class="spark-core"></span><span class="spark-flare"></span></div>' +
        '<button type="button" id="btn-inspect-spark" class="hotspot-pin is-urgent" style="left:60%;top:53%;">' +
        '<span class="hotspot-dot"></span><span class="hotspot-label">Percikan Api Mesin Sayap!</span></button>'
      : '';

    const walkBadge =
      step.id === 'adegan3_indekos'
        ? '<div class="ambient-caption-pill">Langkah sepatu Sioux: <em>"lop... lop... lop..."</em></div>'
        : '';

    const spriteHtml = step.sprite
      ? '<img class="character-sprite" src="' +
        step.sprite +
        '" alt="Rudy Habibie" onerror="this.src=\'assets/sprites/rudy_base.png\'" />'
      : '';

    stageEl.innerHTML =
      '<div class="scene-frame">' +
      '<img class="scene-bg" src="' +
      step.sceneArt +
      '" alt="' +
      step.location +
      '" />' +
      '<div class="paper-wash-overlay" aria-hidden="true"></div>' +
      '<div class="scene-vignette" aria-hidden="true"></div>' +
      spriteHtml +
      sparkOverlay +
      hotspotsHtml +
      walkBadge +
      '</div>';

    Array.from(stageEl.querySelectorAll('[data-hotspot]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-hotspot');
        const found = (step.hotspots || []).find(function (h) {
          return h.id === id;
        });
        if (found && handlers.onHotspot) handlers.onHotspot(found);
      });
    });

    const sparkBtn = document.getElementById('btn-inspect-spark');
    if (sparkBtn && handlers.onSparkClick) {
      sparkBtn.addEventListener('click', handlers.onSparkClick);
    }
  }

  function renderFreeRoamStage(roomHotspots, inspectedObjects, warsawPlaying, onOpenHotspot) {
    const stageEl = document.getElementById('stage-canvas');
    if (!stageEl) return;

    const hotspotOrder = ['desk', 'window', 'bag', 'door'];
    const zonesHtml = hotspotOrder
      .map(function (key) {
        const h = roomHotspots[key];
        const done =
          key === 'desk'
            ? inspectedObjects.includes('physics_books') &&
              inspectedObjects.includes('german_dict') &&
              inspectedObjects.includes('warsaw_lp')
            : inspectedObjects.includes(key);
        const cls = done ? 'room-hotspot is-visited' : 'room-hotspot';
        return (
          '<button type="button" class="' +
          cls +
          '" id="hotspot-' +
          key +
          '" data-room-hotspot="' +
          key +
          '" style="left:' +
          h.bounds.left +
          '%;top:' +
          h.bounds.top +
          '%;width:' +
          h.bounds.width +
          '%;height:' +
          h.bounds.height +
          '%;">' +
          '<span class="room-hotspot-tag">' +
          h.label +
          (done ? ' ✓' : '') +
          '</span></button>'
        );
      })
      .join('');

    const vinylStatus = warsawPlaying
      ? '<div class="ambient-caption-pill is-music">' + ICONS.disc + ' <span>Warsaw Concerto sedang diputar...</span></div>'
      : '';

    stageEl.innerHTML =
      '<div class="scene-frame">' +
      '<img class="scene-bg" src="assets/scenes/freeroam_room.jpg" alt="Kamar Indekos Frankenberg Str. 16 Aachen" />' +
      '<div class="paper-wash-overlay" aria-hidden="true"></div>' +
      '<div class="scene-vignette" aria-hidden="true"></div>' +
      '<img class="character-sprite is-room" src="assets/sprites/rudy_base.png" alt="Rudy di Kamar Indekos Aachen" />' +
      zonesHtml +
      vinylStatus +
      '</div>';

    Array.from(stageEl.querySelectorAll('[data-room-hotspot]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        onOpenHotspot(btn.getAttribute('data-room-hotspot'));
      });
    });
  }

  function renderRwthStage() {
    const stageEl = document.getElementById('stage-canvas');
    if (!stageEl) return;
    stageEl.innerHTML =
      '<div class="scene-frame">' +
      '<img class="scene-bg" src="assets/scenes/rwth_library.jpg" alt="Perpustakaan Kampus RWTH Aachen 1955" />' +
      '<div class="paper-wash-overlay" aria-hidden="true"></div>' +
      '<div class="scene-vignette" aria-hidden="true"></div>' +
      '<img class="character-sprite" src="assets/sprites/rudy_aachen.png" alt="Rudy tiba di RWTH Aachen" onerror="this.src=\'assets/sprites/rudy_base.png\'" />' +
      '<div class="ambient-caption-pill">RWTH Aachen • Musim Semi 1955</div>' +
      '</div>';
  }

  return {
    ICONS: ICONS,
    buildRouteStrip: buildRouteStrip,
    renderPrologStage: renderPrologStage,
    renderFreeRoamStage: renderFreeRoamStage,
    renderRwthStage: renderRwthStage
  };
}));
