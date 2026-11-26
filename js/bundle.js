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
  document.addEventListener("DOMContentLoaded", () => {
    syncThemeIcons();
    initArticleReader();
    initHomeScrollSpy();
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggleMobileMenu(true);
    });
  });
  globalThis.App = {
    toggleTheme,
    toggleMobileMenu,
    copyPageUrl,
    initArticleReader,
    initHomeScrollSpy
  };
})();
//# sourceMappingURL=bundle.js.map
