
    // 0. REVEAL AL SCROLL
    (function () {
      const groupSelectors = ['.burger-item-card', 'details.faq-item', '.feature-item', '.retro-yellow-box', '.extras-panel'];
      groupSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          el.classList.add('reveal');
          el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
        });
      });

      const revealEls = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window) || !revealEls.length) {
        revealEls.forEach(el => el.classList.add('is-visible'));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(el => io.observe(el));
    })();

    // 0b. CTA FLOTANTE: aparece tras el hero, se oculta al llegar a "Dónde Estamos"
    (function () {
      const cta = document.getElementById('floatingCta');
      const shareBtn = document.getElementById('shareBtn');
      const heroEl = document.querySelector('.hero');
      const ubicacionEl = document.getElementById('ubicacion');
      if (!cta || !heroEl) return;
      let pastHero = false;
      let inUbicacion = false;

      function refreshCta() {
        const visible = pastHero && !inUbicacion;
        cta.classList.toggle('show', visible);
        if (shareBtn && !shareBtn.hidden) shareBtn.classList.toggle('show', visible);
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((entry) => { pastHero = !entry.isIntersecting; });
          refreshCta();
        }, { threshold: 0, rootMargin: '-10% 0px 0px 0px' }).observe(heroEl);

        if (ubicacionEl) {
          new IntersectionObserver((entries) => {
            entries.forEach((entry) => { inUbicacion = entry.isIntersecting; });
            refreshCta();
          }, { threshold: 0.25 }).observe(ubicacionEl);
        }
      } else {
        window.addEventListener('scroll', () => {
          pastHero = window.scrollY > heroEl.offsetHeight * 0.8;
          refreshCta();
        });
      }
    })();

    // 0c-bis. LAZY-LOAD REAL DE VÍDEOS
    (function () {
      const videos = document.querySelectorAll('video.lazy-video');
      if (!videos.length) return;

      function loadVideo(video) {
        const source = video.querySelector('source[data-src]');
        if (!source || source.src) return;
        source.src = source.dataset.src;
        video.load();
      }

      videos.forEach((video) => {
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadVideo(video);
                io.disconnect();
              }
            });
          }, { rootMargin: '400px 0px' });
          io.observe(video);
        } else {
          loadVideo(video);
        }
        // Si el usuario le da a play antes de que el observer dispare, cargamos igualmente
        video.addEventListener('play', () => loadVideo(video), { once: true });
      });
    })();

    // 0b-bis. BOTÓN COMPARTIR (Web Share API nativa, solo si el navegador la soporta)
    (function () {
      const shareBtn = document.getElementById('shareBtn');
      if (!shareBtn || typeof navigator.share !== 'function') return;
      shareBtn.hidden = false;
      shareBtn.addEventListener('click', () => {
        navigator.share({
          title: window.HOLY_I18N.shareTitle,
          text: window.HOLY_I18N.shareText,
          url: window.location.href
        }).catch(() => {});
      });
    })();

    // 0d-bis. EVENTOS DE CONVERSIÓN (Google Analytics 4)
    // No hace nada si Analytics no está activo (gtag no existe): no rompe nada mientras el ID siga sin configurar.
    (function () {
      function trackEvent(name) {
        if (typeof window.gtag === 'function') {
          window.gtag('event', name);
        }
      }
      document.querySelectorAll('[data-track]').forEach((el) => {
        el.addEventListener('click', () => trackEvent(el.dataset.track));
      });
    })();

    // 0d. SCROLLSPY: resalta la sección activa en el menú
    (function () {
      const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
      if (!navLinks.length) return;

      const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

      if (!sections.length || !('IntersectionObserver' in window)) return;

      function setActive(id) {
        navLinks.forEach((link) => {
          link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`);
        });
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      sections.forEach((section) => io.observe(section));
    })();

    // 0c. ESTADO DE HORARIO EN VIVO (tabla + badge navbar + banner destacado)
    (function () {
      const rows = document.querySelectorAll('.schedule-table tbody tr[data-days]');
      if (!rows.length) return;

      function toMinutes(hhmm) {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
      }
      function toHHMM(mins) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
      }

      // Construye el mapa semanal (0=domingo..6=sábado) a partir de las filas de la tabla,
      // así la tabla sigue siendo la única fuente de verdad del horario.
      const weekMap = {};
      rows.forEach((row) => {
        const days = row.dataset.days.split(',').map(Number);
        days.forEach((d) => {
          weekMap[d] = row.dataset.closed === 'true'
            ? { closed: true }
            : { open: row.dataset.open, close: row.dataset.close };
        });
      });

      function dayLabel(i18n, day, isToday) {
        return isToday ? i18n.todayWord : `${i18n.dayPrefix} ${i18n.dayNames[day]}`;
      }

      function computeLiveStatus(now) {
        const i18n = window.HOLY_I18N.schedule;
        const day = now.getDay();
        const minutesNow = now.getHours() * 60 + now.getMinutes();
        const today = weekMap[day];

        if (today && !today.closed) {
          const openMin = toMinutes(today.open);
          const closeMin = toMinutes(today.close);
          if (minutesNow >= openMin && minutesNow < closeMin) {
            return { open: true, text: i18n.liveOpen(today.close) };
          }
          if (minutesNow < openMin) {
            return { open: false, text: i18n.liveClosed(i18n.todayWord, today.open) };
          }
        }

        // Cerrado ahora: busca la próxima apertura, día a día, hasta 7 días vista
        for (let offset = 1; offset <= 7; offset++) {
          const nextDay = (day + offset) % 7;
          const info = weekMap[nextDay];
          if (info && !info.closed) {
            return { open: false, text: i18n.liveClosed(dayLabel(i18n, nextDay, false), info.open) };
          }
        }
        return { open: false, text: i18n.closedNow };
      }

      const liveDot = document.getElementById('liveDot');
      const liveBadgeText = document.getElementById('liveBadgeText');
      const liveDotBanner = document.getElementById('liveDotBanner');
      const liveBannerText = document.getElementById('liveBannerText');

      function refreshSchedule() {
        const now = new Date();
        const day = now.getDay();
        const minutesNow = now.getHours() * 60 + now.getMinutes();

        rows.forEach((row) => {
          const days = row.dataset.days.split(',').map(Number);
          const isToday = days.includes(day);
          row.classList.toggle('is-today', isToday);

          if (!isToday) return;
          const badge = row.querySelector('.schedule-status');
          if (!badge) return;

          if (row.dataset.closed === 'true') {
            badge.textContent = window.HOLY_I18N.schedule.closedToday;
            badge.className = 'badge-closed schedule-status badge-live';
            return;
          }

          const openMin = toMinutes(row.dataset.open);
          const closeMin = toMinutes(row.dataset.close);

          if (minutesNow >= openMin && minutesNow < closeMin) {
            badge.textContent = window.HOLY_I18N.schedule.openNow;
            badge.className = 'badge-open schedule-status badge-live';
          } else if (minutesNow < openMin) {
            badge.textContent = window.HOLY_I18N.schedule.opensAt(row.dataset.open);
            badge.className = 'badge-closed schedule-status';
          } else {
            badge.textContent = window.HOLY_I18N.schedule.closedNow;
            badge.className = 'badge-closed schedule-status';
          }
        });

        const status = computeLiveStatus(now);
        [
          [liveDot, liveBadgeText],
          [liveDotBanner, liveBannerText]
        ].forEach(([dot, textEl]) => {
          if (!dot || !textEl) return;
          dot.classList.toggle('is-closed', !status.open);
          textEl.textContent = (status.open ? '🟢 ' : '🔴 ') + status.text;
        });
      }

      refreshSchedule();
      setInterval(refreshSchedule, 60000);
    })();

    // 0e. FILTROS RÁPIDOS DE LA CARTA
    (function () {
      const tabs = document.querySelectorAll('.filter-tab');
      const menuLayout = document.getElementById('menuLayout');
      const burgersCol = document.querySelector('[data-menu-group="burgers"]');
      const sidebarWrap = document.querySelector('.sidebar-menu-wrap');
      if (!tabs.length || !menuLayout) return;

      function setGroupVisible(el, visible) {
        if (!el) return;
        if (visible) {
          el.classList.remove('menu-group-hidden');
          requestAnimationFrame(() => el.classList.remove('menu-fade-out'));
        } else {
          el.classList.add('menu-fade-out');
          window.setTimeout(() => el.classList.add('menu-group-hidden'), 220);
        }
      }

      function applyFilter(filter) {
        const showBurgers = filter === 'all' || filter === 'burgers';
        const showSidebar = filter === 'all' || ['entrantes', 'complementos', 'postres'].includes(filter);

        setGroupVisible(burgersCol, showBurgers);
        setGroupVisible(sidebarWrap, showSidebar);

        document.querySelectorAll('.sidebar-menu-wrap [data-menu-group]').forEach((el) => {
          setGroupVisible(el, filter === 'all' || el.dataset.menuGroup === filter);
        });

        menuLayout.classList.toggle('menu-layout-single', filter !== 'all');

        tabs.forEach((tab) => {
          const isActive = tab.dataset.filter === filter;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', String(isActive));
        });
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
      });
    })();

    // 0f. COPIAR DIRECCIÓN AL PORTAPAPELES
    (function () {
      const btn = document.getElementById('copyAddressBtn');
      const label = document.getElementById('copyAddressText');
      if (!btn || !label) return;
      const originalText = label.textContent;
      let resetTimer = null;

      async function copyAddress() {
        const address = btn.dataset.address;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(address);
          } else {
            const ta = document.createElement('textarea');
            ta.value = address;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          label.textContent = window.HOLY_I18N.copyAddress.copied;
          btn.classList.add('copied');
        } catch (e) {
          label.textContent = window.HOLY_I18N.copyAddress.error;
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          label.textContent = originalText;
          btn.classList.remove('copied');
        }, 2200);
      }

      btn.addEventListener('click', copyAddress);
    })();

    // 1. MENU MOBILE
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    function setNavOpen(open) {
      navMenu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    navToggle.addEventListener('click', () => setNavOpen(!navMenu.classList.contains('open')));
    document.querySelectorAll('.nav-menu a').forEach(l => l.addEventListener('click', () => setNavOpen(false)));

    // 2. FAQ AUTO-CIERRE NATIVO
    document.querySelectorAll('details.faq-item').forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (detail.open) {
          document.querySelectorAll('details.faq-item').forEach((otherDetail) => {
            if (otherDetail !== detail) {
              otherDetail.open = false;
            }
          });
        }
      });
    });

    // 3. CARRUSEL MULTI-CARD DE RESEÑAS
    const track = document.getElementById('carouselTrack');
    const cards = document.querySelectorAll('.multi-review-card');
    const totalCards = cards.length;
    let trackIndex = 0;
    let carouselAutoplay = null;

    function getStepWidth() {
      if (!cards || cards.length === 0) return 384;
      return cards[0].getBoundingClientRect().width + 24;
    }

    function getMaxScrollIndex() {
      const viewportEl = document.getElementById('carouselViewport');
      const containerWidth = viewportEl ? viewportEl.getBoundingClientRect().width : 1200;
      const step = getStepWidth();
      const visibleCards = Math.max(1, Math.floor(containerWidth / step));
      return Math.max(0, totalCards - visibleCards);
    }

    function updateCarousel() {
      if (!track) return;
      const maxScroll = getMaxScrollIndex();
      if (trackIndex > maxScroll) trackIndex = 0;
      if (trackIndex < 0) trackIndex = maxScroll;

      const offset = trackIndex * getStepWidth();
      track.style.transform = `translateX(-${offset}px)`;
      const counterEl = document.getElementById('trackCounterText');
      if (counterEl) {
        counterEl.innerText = `${trackIndex + 1} / ${totalCards}`;
      }
    }

    function nextTrackSlide() {
      const maxScroll = getMaxScrollIndex();
      if (trackIndex >= maxScroll) {
        trackIndex = 0;
      } else {
        trackIndex++;
      }
      updateCarousel();
    }

    function prevTrackSlide() {
      const maxScroll = getMaxScrollIndex();
      if (trackIndex <= 0) {
        trackIndex = maxScroll;
      } else {
        trackIndex--;
      }
      updateCarousel();
    }

    function startCarousel() {
      if (carouselAutoplay) clearInterval(carouselAutoplay);
      carouselAutoplay = setInterval(nextTrackSlide, 4500);
    }

    const nextBtn = document.getElementById('nextTrackBtn');
    const prevBtn = document.getElementById('prevTrackBtn');

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextTrackSlide();
        startCarousel();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevTrackSlide();
        startCarousel();
      });
    }

    const viewport = document.getElementById('carouselViewport');
    if (viewport) {
      viewport.addEventListener('mouseenter', () => clearInterval(carouselAutoplay));
      viewport.addEventListener('mouseleave', startCarousel);
    }

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
    startCarousel();

    // 4. COOKIES
    function acceptCookies(all) {
      localStorage.setItem('holy_cookies', all ? 'all' : 'essential');
      document.getElementById('cookieBanner').classList.remove('show');
    }
    window.addEventListener('DOMContentLoaded', () => {
      if (!localStorage.getItem('holy_cookies')) {
        setTimeout(() => document.getElementById('cookieBanner').classList.add('show'), 800);
      }
    });

    // 5. LEGAL
    const legalModal = document.getElementById('legalModal');

    function openLegalModal(type) {
      const title = document.getElementById('legalTitle');
      const content = document.getElementById('legalContent');

      const legal = window.HOLY_I18N.legal[type] || window.HOLY_I18N.legal.cookies;
      title.innerText = legal.title;
      content.innerHTML = legal.html;
      legalModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLegalModal() {
      legalModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeLegalModal(); }
    });
    legalModal.addEventListener('click', e => { if (e.target === legalModal) { closeLegalModal(); } });

    // 6. LIGHTBOX DE FOTOS
    const photoLightbox = document.getElementById('photoLightbox');
    const photoLightboxImg = document.getElementById('photoLightboxImg');

    function openPhotoLightbox(src, alt) {
      photoLightboxImg.src = src;
      photoLightboxImg.alt = alt || '';
      photoLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closePhotoLightbox() {
      photoLightbox.classList.remove('active');
      document.body.style.overflow = '';
      photoLightboxImg.src = '';
    }
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closePhotoLightbox(); }
    });
    photoLightbox.addEventListener('click', e => {
      if (e.target === photoLightbox) { closePhotoLightbox(); }
    });
  