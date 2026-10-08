// Mejora progresiva: revelado por intersección y respeto a movimiento reducido.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var video = document.querySelector(".hero-video");

  function applyMotionPreference() {
    if (!video) return;
    if (reduceMotion.matches) {
      video.pause();
      video.removeAttribute("autoplay");
    } else if (video.paused && video.dataset.userPaused !== "true") {
      var play = video.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    }
  }

  if (video) {
    video.muted = true;
    video.controls = false;
    applyMotionPreference();
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", applyMotionPreference);
    }
  }

  var items = document.querySelectorAll(".reveal");
  var header = document.querySelector(".site-header");
  var heroCopy = document.querySelector(".hero-copy");
  var hero = document.querySelector(".hero");
  var portada = document.querySelector(".portada");
  var portadaWord = document.querySelector(".portada-word");
  var ticking = false;

  function onScroll() {
    if (header) header.classList.toggle("is-solid", window.scrollY > 40);
    var bar = document.querySelector(".scroll-progress");
    if (bar) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    if (!reduceMotion.matches && hero && heroCopy) {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroCopy.style.transform = "translateY(" + y * 0.22 + "px)";
        heroCopy.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.85));
      }
    }
    if (!reduceMotion.matches && portada && portadaWord) {
      var pr = portada.getBoundingClientRect();
      var vh = window.innerHeight;
      if (pr.bottom > 0 && pr.top < vh) {
        var pCenter = pr.top + pr.height / 2;
        var p = Math.max(-0.5, Math.min(0.5, (vh / 2 - pCenter) / vh));
        var wW = portadaWord.scrollWidth || 1;
        portadaWord.style.transform = "translate3d(calc(-50% + " + p * 0.12 * wW + "px), -50%, 0)";
      }
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* Nav móvil isla */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
    } else {
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { if (toggle.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 350);
    }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* Estado activo en nav por sección visible */
  var navLinks = document.querySelectorAll("[data-nav]");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = map[en.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["paisaje", "bodega", "cata", "recorrido", "galeria"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navObs.observe(s);
    });
  }

  /* Tagline reveal palabra por palabra */
  document.querySelectorAll("[data-tagline]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var spans = el.querySelectorAll(".w");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      spans.forEach(function (s) { s.classList.add("is-on"); });
      return;
    }
    var wo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-on");
          wo.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    spans.forEach(function (s) { wo.observe(s); });
  });

  /* Carga de imágenes con estado */
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) { img.classList.add("is-ready"); return; }
    img.classList.add("is-loading");
    img.addEventListener("load", function () {
      img.classList.remove("is-loading");
      img.classList.add("is-ready");
    }, { once: true });
    img.addEventListener("error", function () {
      img.classList.remove("is-loading");
      img.alt += " (imagen no disponible)";
    }, { once: true });
  });

  /* Anime.js: entrada del hero, botones magnéticos */
  var hasAnime = !!(window.anime && window.anime.animate) && !reduceMotion.matches;
  if (hasAnime) {
    var A = window.anime;
    var tl = A.createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(".site-header", { opacity: [0, 1], y: [-18, 0], duration: 700 }, 100)
      .add(".hero-kicker", { opacity: [0, 1], y: [22, 0], duration: 700 }, 300)
      .add(".hero-title", { opacity: [0, 1], y: [28, 0], duration: 850 }, 420)
      .add(".hero-lede", { opacity: [0, 1], y: [22, 0], duration: 700 }, 600)
      .add(".hero-actions", { opacity: [0, 1], y: [22, 0], duration: 700 }, 730)
      .add(".hero-proof", { opacity: [0, 1], duration: 700 }, 850);

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".button").forEach(function (btn) {
        var fullTransition = "";
        btn.addEventListener("mouseenter", function () {
          fullTransition = btn.style.transition;
          btn.style.transition = "box-shadow 500ms cubic-bezier(0.32, 0.72, 0, 1)";
        });
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
          var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          A.set(btn, { x: x * 7, y: y * 5 });
        });
        btn.addEventListener("mouseleave", function () {
          A.animate(btn, {
            x: 0, y: 0, duration: 800, ease: "outElastic(1, .45)",
            onComplete: function () { btn.style.transition = fullTransition; }
          });
        });
      });
    }
  }

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* Zoom cinematográfico en imágenes de contenido (anime.js) */
  var zoomFigs = document.querySelectorAll(
    ".split .frame, .band .frame, .gallery-grid .frame"
  );
  var ZA = window.anime;
  var canZoom = !!(ZA && ZA.animate) && !reduceMotion.matches &&
    "IntersectionObserver" in window && zoomFigs.length;
  if (canZoom) {
    var zoomObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target.querySelector("img");
        if (img) ZA.animate(img, { scale: [1.15, 1], duration: 1100, ease: "outExpo" });
        zoomObs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    zoomFigs.forEach(function (fig) { zoomObs.observe(fig); });
    if (window.matchMedia("(hover: hover)").matches) {
      zoomFigs.forEach(function (fig) {
        var img = fig.querySelector("img");
        if (!img) return;
        fig.addEventListener("mouseenter", function () {
          if (ZA.remove) ZA.remove(img);
          ZA.animate(img, { scale: 1.06, duration: 600, ease: "outQuad" });
        });
        fig.addEventListener("mouseleave", function () {
          if (ZA.remove) ZA.remove(img);
          ZA.animate(img, { scale: 1, duration: 700, ease: "outQuad" });
        });
      });
    }
  }

  /* Contador de galería móvil */
  var galGrid = document.querySelector(".gallery-grid");
  var galCurrent = document.querySelector("[data-gallery-current]");
  if (galGrid && galCurrent && "IntersectionObserver" in window) {
    var galCards = galGrid.querySelectorAll(".frame");
    var galObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var i = Array.prototype.indexOf.call(galCards, entry.target);
        if (i > -1) galCurrent.textContent = String(i + 1);
      });
    }, { root: galGrid, threshold: 0.6 });
    galCards.forEach(function (card) { galObs.observe(card); });
  }

  /* Rail activo */
  var showcase = document.querySelector(".showcase-grid");
  if (showcase && "IntersectionObserver" in window) {
    var stackImgs = showcase.querySelectorAll(".showcase-stack img");
    var railItems = showcase.querySelectorAll(".showcase-rail .rail-step");
    var caption = showcase.querySelector(".showcase-caption");
    function setShowcase(index) {
      stackImgs.forEach(function (img, i) { img.classList.toggle("is-active", i === index); });
      railItems.forEach(function (step, i) { step.classList.toggle("is-active", i === index - 1); });
      if (caption && stackImgs[index]) caption.textContent = stackImgs[index].getAttribute("data-caption");
    }
    var showcaseObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("showcase-head")) { setShowcase(0); return; }
        railItems.forEach(function (item, i) { if (item === entry.target) setShowcase(i + 1); });
      });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    var showcaseHead = document.querySelector(".showcase-head");
    if (showcaseHead) showcaseObserver.observe(showcaseHead);
    railItems.forEach(function (item) { showcaseObserver.observe(item); });
  }

  /* Portada: intercambio lateral / central con deslizamiento */
  var centerFig = document.querySelector(".portada-main");
  if (centerFig) {
    function bottleImg(fig) { return fig.querySelector("img"); }
    function wineName(img) { return img.getAttribute("data-name") || "botella"; }
    function setWine(fig) {
      var b = bottleImg(fig);
      if (b) fig.style.setProperty("--wine", b.getAttribute("data-wine"));
    }
    function refreshLabels() {
      centerFig.setAttribute("aria-label", "Botella central: " + wineName(bottleImg(centerFig)));
      document.querySelectorAll(".portada-side").forEach(function (f) {
        f.setAttribute("aria-label", "Poner al centro: " + wineName(bottleImg(f)));
      });
    }
    function doSwap(sideFig) {
      var cImg = bottleImg(centerFig);
      var sImg = bottleImg(sideFig);
      centerFig.appendChild(sImg);
      sideFig.appendChild(cImg);
      setWine(centerFig);
      setWine(sideFig);
      refreshLabels();
    }
    var beltBusy = false;
    var beltRow = centerFig.parentNode;
    function beltRelease(cImg, sImg) {
      if (beltRow) beltRow.classList.remove("is-moving");
      [cImg, sImg].forEach(function (img) { if (img) img.style.transform = ""; });
      beltBusy = false;
    }
    function beltSwap(sideFig) {
      var cImg = bottleImg(centerFig);
      var sImg = bottleImg(sideFig);
      if (!cImg || !sImg || beltBusy) return;
      var A = window.anime;
      if (!A || !A.createTimeline) { doSwap(sideFig); return; }
      var rc = centerFig.getBoundingClientRect();
      var rs = sideFig.getBoundingClientRect();
      if (!sideFig.getClientRects().length || rs.width < 2) { doSwap(sideFig); return; }
      var dx = (rs.left + rs.width / 2) - (rc.left + rc.width / 2);
      if (!isFinite(dx) || Math.abs(dx) < 2) { doSwap(sideFig); return; }
      beltBusy = true;
      if (beltRow) beltRow.classList.add("is-moving");
      var tl = A.createTimeline({
        defaults: { duration: 650, ease: "inOutQuad" },
        onComplete: function () { beltSettle(cImg, sImg, sideFig); }
      });
      tl.add(cImg, { x: dx }, 0).add(sImg, { x: -dx }, 0);
    }
    function beltSettle(cImg, sImg, sideFig) {
      var A = window.anime;
      var arrC = cImg.getBoundingClientRect();
      var arrS = sImg.getBoundingClientRect();
      doSwap(sideFig);
      A.set(cImg, { x: 0 });
      A.set(sImg, { x: 0 });
      var natC = cImg.getBoundingClientRect();
      var natS = sImg.getBoundingClientRect();
      var kC = natC.width ? arrC.width / natC.width : 1;
      var kS = natS.width ? arrS.width / natS.width : 1;
      if (!isFinite(kC)) kC = 1;
      if (!isFinite(kS)) kS = 1;
      if (Math.abs(kC - 1) < 0.02 && Math.abs(kS - 1) < 0.02) { beltRelease(cImg, sImg); return; }
      var tl2 = A.createTimeline({
        defaults: { duration: 280, ease: "inOutQuad" },
        onComplete: function () { beltRelease(cImg, sImg); }
      });
      tl2.add(cImg, { scale: [kC, 1] }, 0).add(sImg, { scale: [kS, 1] }, 0);
    }
    var autoFns = [];
    document.querySelectorAll(".portada-side").forEach(function (sideFig) {
      function activate() {
        if (reduceMotion.matches) { doSwap(sideFig); return; }
        beltSwap(sideFig);
      }
      autoFns.push(activate);
      sideFig.addEventListener("click", function () { activate(); portadaAutoRestart(); });
      sideFig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); portadaAutoRestart(); }
      });
    });

    /* Cinta automática: avanza sola, se pausa al interactuar */
    var autoIdx = 0;
    var autoTimer = null;
    var AUTO_MS = 4500;
    var beltHover = false;
    var beltFocus = false;
    var beltVisible = true;
    function beltAutoOk() {
      return !reduceMotion.matches && !document.hidden && !beltBusy &&
        !beltHover && !beltFocus && beltVisible && autoFns.length > 0;
    }
    function beltAutoStep() {
      if (!beltAutoOk()) return;
      autoFns[autoIdx % autoFns.length]();
      autoIdx++;
    }
    function beltAutoStop() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    function portadaAutoRestart() {
      beltAutoStop();
      if (reduceMotion.matches) return;
      autoTimer = setInterval(beltAutoStep, AUTO_MS);
    }
    if (beltRow) {
      beltRow.addEventListener("mouseenter", function () { beltHover = true; });
      beltRow.addEventListener("mouseleave", function () { beltHover = false; });
      beltRow.addEventListener("focusin", function () { beltFocus = true; });
      beltRow.addEventListener("focusout", function () { beltFocus = false; });
    }
    if (portada && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        beltVisible = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0.2 }).observe(portada);
    }
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", function () {
        if (reduceMotion.matches) beltAutoStop(); else portadaAutoRestart();
      });
    }
    portadaAutoRestart();
  }

  /* Hotspots de cata */
  var wineFigures = document.querySelectorAll(".wine-figure");
  var allSpots = [];
  wineFigures.forEach(function (wineFigure) {
    var tip = wineFigure.querySelector(".wine-tip");
    var spots = wineFigure.querySelectorAll(".hotspot");
    if (!tip || !spots.length) return;
    var defaultTip = tip.textContent || "";
    function placeTip(stage, button, event) {
      var rect = stage.getBoundingClientRect();
      var cx, cy;
      if (event && typeof event.clientX === "number" && event.clientX !== 0) {
        cx = event.clientX - rect.left;
        cy = event.clientY - rect.top;
      } else {
        cx = button.offsetLeft + button.offsetWidth / 2;
        cy = button.offsetTop + button.offsetHeight / 2;
      }
      var gap = 14;
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var sw = stage.clientWidth, sh = stage.clientHeight;
      var tx = cx + gap;
      if (tx + tw > sw - 8) tx = cx - gap - tw;
      if (tx < 8) tx = 8;
      var ty = cy - th / 2;
      if (ty < 8) ty = 8;
      if (ty + th > sh - 8) ty = Math.max(8, sh - th - 8);
      tip.style.left = tx + "px";
      tip.style.top = ty + "px";
    }
    function showTip(button, event) {
      tip.textContent = button.getAttribute("data-tip");
      tip.classList.add("is-open");
      placeTip(wineFigure.querySelector(".wine-stage"), button, event);
    }
    function resetTip() {
      tip.textContent = defaultTip;
      tip.classList.remove("is-open");
    }
    var legendBtns = wineFigure.querySelectorAll(".wine-legend button");
    function syncLegend() {
      legendBtns.forEach(function (btn, i) {
        var on = !!(spots[i] && spots[i].classList.contains("is-active"));
        btn.classList.toggle("is-active", on);
      });
    }
    function setExpanded(spot, on) {
      spot.setAttribute("aria-expanded", on ? "true" : "false");
    }
    spots.forEach(function (spot) {
      allSpots.push({ spot: spot, tip: tip, reset: resetTip });
      spot.addEventListener("mouseenter", function (e) { showTip(spot, e); });
      spot.addEventListener("focus", function () { showTip(spot, null); });
      spot.addEventListener("mouseleave", resetTip);
      spot.addEventListener("blur", resetTip);
      spot.addEventListener("click", function (e) {
        var wasActive = spot.classList.contains("is-active");
        wineFigures.forEach(function (other) {
          other.querySelectorAll(".hotspot").forEach(function (s) {
            s.classList.remove("is-active");
            setExpanded(s, false);
          });
          var otherTip = other.querySelector(".wine-tip");
          if (otherTip) { otherTip.textContent = ""; otherTip.classList.remove("is-open"); }
          var otherLegend = other.querySelectorAll(".wine-legend button");
          otherLegend.forEach(function (b) { b.classList.remove("is-active"); });
        });
        spot.classList.toggle("is-active", !wasActive);
        setExpanded(spot, !wasActive);
        if (!wasActive) showTip(spot, e);
        syncLegend();
      });
    });
    legendBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-spot"), 10);
        if (!spots[i] || spots[i].classList.contains("is-active")) return;
        spots[i].click();
      });
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    allSpots.forEach(function (entry) {
      entry.spot.classList.remove("is-active");
      entry.spot.setAttribute("aria-expanded", "false");
      if (entry.tip) { entry.tip.textContent = ""; entry.tip.classList.remove("is-open"); }
    });
    document.querySelectorAll(".wine-legend button.is-active").forEach(function (b) {
      b.classList.remove("is-active");
    });
    if (document.activeElement && document.activeElement.classList.contains("hotspot")) document.activeElement.blur();
  });

  /* Diálogo legal */
  var legalDlg = document.getElementById("legal-dialog");
  if (legalDlg) {
    document.querySelectorAll("[data-legal]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof legalDlg.showModal === "function") {
          legalDlg.showModal();
          var target = document.getElementById(link.getAttribute("href").slice(1));
          if (target && typeof target.scrollIntoView === "function") {
            target.scrollIntoView({ block: "start" });
          }
        }
      });
    });
    legalDlg.addEventListener("click", function (e) {
      if (e.target === legalDlg) legalDlg.close();
    });
    var legalClose = legalDlg.querySelector("[data-close]");
    if (legalClose) legalClose.addEventListener("click", function () { legalDlg.close(); });
  }

})();
