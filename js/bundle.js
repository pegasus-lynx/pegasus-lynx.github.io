(() => {
  // src/assets/js/index.js
  function syncThemeIcons() {
    const isDark = document.documentElement.classList.contains("dark");
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isDark));
    });
  }
  function toggleTheme() {
    const html = document.documentElement;
    const nextDark = !html.classList.contains("dark");
    html.classList.toggle("dark", nextDark);
    try {
      localStorage.setItem("theme", nextDark ? "dark" : "light");
    } catch (e) {
    }
    syncThemeIcons();
  }
  function toggleMobileMenu(forceClose = false) {
    const menu = document.querySelector("#mobile-nav-menu");
    if (!menu) return;
    if (forceClose) {
      menu.classList.add("hidden");
    } else {
      menu.classList.toggle("hidden");
    }
    if (!menu.classList.contains("hidden")) {
      const header = document.querySelector("#site-header");
      if (header) header.classList.remove("ec-navbar-hidden");
    }
  }
  function updateNavbarScrollState({
    header,
    mobileMenu,
    currentY,
    lastY,
    activeElement = null,
    threshold = 8,
    topOffset = 64
  }) {
    if (!header) return currentY;
    const clampedY = Math.max(0, currentY);
    const menuOpen = Boolean(mobileMenu && !mobileMenu.classList.contains("hidden"));
    const focusInside = Boolean(activeElement && header.contains(activeElement));
    if (clampedY <= topOffset || menuOpen || focusInside) {
      header.classList.remove("ec-navbar-hidden");
      return clampedY;
    }
    const delta = clampedY - lastY;
    if (Math.abs(delta) < threshold) {
      return lastY;
    }
    if (delta >= threshold) {
      header.classList.add("ec-navbar-hidden");
    } else if (delta <= -threshold) {
      header.classList.remove("ec-navbar-hidden");
    }
    return clampedY;
  }
  function initSmartNavbar() {
    const header = document.querySelector("#site-header");
    if (!header) return;
    const mobileMenu = document.querySelector("#mobile-nav-menu");
    let lastY = Math.max(0, window.scrollY || 0);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        lastY = updateNavbarScrollState({
          header,
          mobileMenu,
          currentY: window.scrollY || 0,
          lastY,
          activeElement: document.activeElement
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", () => {
      header.classList.remove("ec-navbar-hidden");
    });
  }
  async function copyPageUrl(buttonEl) {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const label = buttonEl && buttonEl.querySelector("[data-copy-label]");
      const copyIcon = buttonEl && buttonEl.querySelector("[data-copy-icon]");
      const copiedIcon = buttonEl && buttonEl.querySelector("[data-copied-icon]");
      if (label) {
        const original = label.textContent;
        label.textContent = "Copied!";
        if (copyIcon && copiedIcon) {
          copyIcon.classList.add("hidden");
          copiedIcon.classList.remove("hidden");
        }
        setTimeout(() => {
          label.textContent = original;
          if (copyIcon && copiedIcon) {
            copyIcon.classList.remove("hidden");
            copiedIcon.classList.add("hidden");
          }
        }, 2e3);
      }
    } catch (e) {
    }
  }
  function initArticleReader() {
    const prose = document.querySelector("#article-prose");
    const progressBar = document.querySelector("#reading-progress");
    if (prose && progressBar) {
      const updateProgress = () => {
        const rect = prose.getBoundingClientRect();
        const total = Math.max(prose.offsetHeight - window.innerHeight * 0.6, 1);
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        progressBar.style.width = `${scrolled / total * 100}%`;
      };
      window.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();
    }
    const tocRail = document.querySelector("#toc-rail");
    const tocList = document.querySelector("#toc-list");
    if (!prose || !tocRail || !tocList) return;
    const headings = Array.from(prose.querySelectorAll("h2[id], h3[id], h4[id]"));
    if (headings.length < 2) return;
    tocRail.classList.remove("xl:hidden");
    tocRail.classList.add("xl:block");
    const linksById = /* @__PURE__ */ new Map();
    headings.forEach((heading) => {
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = "ec-toc-link";
      if (heading.tagName === "H4") {
        link.style.paddingLeft = "1.5rem";
      } else if (heading.tagName === "H3") {
        link.style.paddingLeft = "1.1rem";
      }
      tocList.appendChild(link);
      linksById.set(heading.id, link);
    });
    if ("IntersectionObserver" in window) {
      const setActive = (id) => {
        linksById.forEach((el, key) => el.classList.toggle("is-active", key === id));
      };
      setActive(headings[0].id);
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
              break;
            }
          }
        },
        { rootMargin: "-15% 0px -72% 0px", threshold: 0 }
      );
      headings.forEach((h) => observer.observe(h));
    }
  }
  function initHomeScrollSpy() {
    const spyLinks = Array.from(document.querySelectorAll("[data-spy-target]"));
    if (!spyLinks.length || !("IntersectionObserver" in window)) return;
    const sections = spyLinks.map((link) => document.getElementById(link.getAttribute("data-spy-target"))).filter(Boolean);
    const setActive = (id) => {
      spyLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("data-spy-target") === id);
      });
    };
    if (sections[0]) setActive(sections[0].id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }
  function computeCarouselIndex(trackCenter, slideCenters) {
    if (!Array.isArray(slideCenters) || slideCenters.length === 0) return 0;
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < slideCenters.length; i += 1) {
      const distance = Math.abs(slideCenters[i] - trackCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  }
  function computeCarouselDotWindow(activeIndex, total, maxVisible = 7) {
    if (total <= 0) return { start: 0, end: -1 };
    if (total <= maxVisible) return { start: 0, end: total - 1 };
    const half = Math.floor(maxVisible / 2);
    const start = Math.max(0, Math.min(total - maxVisible, activeIndex - half));
    return { start, end: start + maxVisible - 1 };
  }
  function initMobileCarousels() {
    const carousels = Array.from(document.querySelectorAll("[data-carousel]"));
    if (!carousels.length) return;
    const prefersReducedMotion = () => Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    carousels.forEach((root) => {
      const track = root.querySelector("[data-carousel-track]");
      const slides = track ? Array.from(track.querySelectorAll("[data-carousel-slide]")) : [];
      if (!track || !slides.length) return;
      const dotsTrack = root.querySelector("[data-carousel-dots]");
      const dots = Array.from(root.querySelectorAll("[data-carousel-dot]"));
      let activeIndex = 0;
      let ticking = false;
      const syncState = () => {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        const slideCenters = slides.map((s) => s.offsetLeft + s.offsetWidth / 2);
        activeIndex = computeCarouselIndex(trackCenter, slideCenters);
        if (dots.length) {
          const maxVisible = 7;
          const dotPitch = 14;
          const { start, end } = computeCarouselDotWindow(activeIndex, dots.length, maxVisible);
          if (dotsTrack && dots.length > maxVisible) {
            dotsTrack.style.transform = `translateX(-${start * dotPitch}px)`;
          }
          dots.forEach((dot, idx) => {
            const isActive = idx === activeIndex;
            const isEdge = !isActive && dots.length > maxVisible && (idx === start && start > 0 || idx === end && end < dots.length - 1);
            dot.classList.toggle("is-active", isActive);
            dot.classList.toggle("is-edge", isEdge);
            dot.setAttribute("aria-current", isActive ? "true" : "false");
          });
        }
      };
      const scrollToSlide = (index) => {
        const clamped = Math.max(0, Math.min(slides.length - 1, index));
        const target = slides[clamped];
        if (!target) return;
        const left = Math.max(
          0,
          target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2
        );
        track.scrollTo({
          left,
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
      };
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => scrollToSlide(idx));
      });
      root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollToSlide(activeIndex - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollToSlide(activeIndex + 1);
        }
      });
      track.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(() => {
            syncState();
            ticking = false;
          });
        },
        { passive: true }
      );
      window.addEventListener("resize", syncState, { passive: true });
      syncState();
    });
  }
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      syncThemeIcons();
      initSmartNavbar();
      initMobileCarousels();
      initArticleReader();
      initHomeScrollSpy();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleMobileMenu(true);
      });
    });
  }
  globalThis.App = {
    toggleTheme,
    toggleMobileMenu,
    copyPageUrl,
    updateNavbarScrollState,
    initSmartNavbar,
    computeCarouselIndex,
    computeCarouselDotWindow,
    initMobileCarousels,
    initArticleReader,
    initHomeScrollSpy
  };
})();
//# sourceMappingURL=bundle.js.map
