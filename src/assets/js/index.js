
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
  } catch (e) {}
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
  topOffset = 64,
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
        activeElement: document.activeElement,
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
      }, 2000);
    }
  } catch (e) {}
}

function initArticleReader() {
  const prose = document.querySelector("#article-prose");
  const progressBar = document.querySelector("#reading-progress");

  if (prose && progressBar) {
    const updateProgress = () => {
      const rect = prose.getBoundingClientRect();
      const total = Math.max(prose.offsetHeight - window.innerHeight * 0.6, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      progressBar.style.width = `${(scrolled / total) * 100}%`;
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

  const linksById = new Map();
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

  const sections = spyLinks
    .map((link) => document.getElementById(link.getAttribute("data-spy-target")))
    .filter(Boolean);

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

  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
          const isEdge =
            !isActive &&
            dots.length > maxVisible &&
            ((idx === start && start > 0) || (idx === end && end < dots.length - 1));
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
        behavior: prefersReducedMotion() ? "auto" : "smooth",
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

function countChipLines(tops, tolerance = 2) {
  if (!Array.isArray(tops) || tops.length === 0) return 0;
  let lines = 1;
  let currentTop = tops[0];
  for (let i = 1; i < tops.length; i++) {
    if (Math.abs(tops[i] - currentTop) > tolerance) {
      lines += 1;
      currentTop = tops[i];
    }
  }
  return lines;
}

function fitTagList(container, maxLines = 2) {
  if (!container) return { visibleCount: 0, hiddenCount: 0 };
  const items = Array.from(container.querySelectorAll("[data-tag-item]"));
  const moreChip = container.querySelector("[data-tag-more]");
  if (!items.length || !moreChip) {
    return { visibleCount: items.length, hiddenCount: 0 };
  }

  items.forEach((item) => {
    item.hidden = false;
  });
  moreChip.hidden = true;
  moreChip.textContent = "";
  moreChip.removeAttribute("title");
  moreChip.removeAttribute("aria-label");

  if (container.clientWidth === 0) {
    return { visibleCount: items.length, hiddenCount: 0 };
  }

  const allTops = items.map((item) => item.offsetTop);
  if (countChipLines(allTops) <= maxLines) {
    return { visibleCount: items.length, hiddenCount: 0 };
  }

  let lines = 1;
  let currentTop = allTops[0];
  let visibleCount = items.length;
  for (let i = 1; i < allTops.length; i++) {
    if (Math.abs(allTops[i] - currentTop) > 2) {
      lines += 1;
      currentTop = allTops[i];
      if (lines > maxLines) {
        visibleCount = i;
        break;
      }
    }
  }

  for (let i = visibleCount; i < items.length; i++) {
    items[i].hidden = true;
  }
  moreChip.hidden = false;

  while (visibleCount > 1) {
    const hiddenCount = items.length - visibleCount;
    moreChip.textContent = `+${hiddenCount}`;
    const currentTops = [];
    for (let i = 0; i < visibleCount; i++) {
      currentTops.push(items[i].offsetTop);
    }
    currentTops.push(moreChip.offsetTop);
    if (countChipLines(currentTops) <= maxLines) {
      break;
    }
    visibleCount -= 1;
    items[visibleCount].hidden = true;
  }

  const hiddenItems = items.slice(visibleCount);
  const hiddenNames = hiddenItems.map((el) => el.textContent.trim()).filter(Boolean);
  const hiddenCount = hiddenItems.length;
  moreChip.textContent = `+${hiddenCount}`;
  if (hiddenNames.length) {
    const summary = hiddenNames.join(", ");
    moreChip.title = summary;
    moreChip.setAttribute(
      "aria-label",
      `${hiddenCount} more ${hiddenCount === 1 ? "tag" : "tags"}: ${summary}`
    );
  }
  return { visibleCount, hiddenCount };
}

function initCardTagOverflow() {
  const lists = Array.from(document.querySelectorAll("[data-tag-list]"));
  if (!lists.length) return;

  const lastWidths = new WeakMap();
  const updateList = (list, force = false) => {
    const width = list.clientWidth;
    if (!force && lastWidths.get(list) === width) return;
    lastWidths.set(list, width);
    fitTagList(list, 2);
  };

  lists.forEach((list) => updateList(list, true));

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => updateList(entry.target, false));
    });
    lists.forEach((list) => observer.observe(list));
  } else {
    window.addEventListener(
      "resize",
      () => lists.forEach((list) => updateList(list, false)),
      { passive: true }
    );
  }

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(() => {
      lists.forEach((list) => updateList(list, true));
    });
  }
}

function nextSelectedTags(selectedTags, clickedSlug, isMultiSelect = false) {
  const current = Array.isArray(selectedTags) ? selectedTags.filter(Boolean) : [];
  const slug = String(clickedSlug || "").trim();
  if (!slug) return [...current];

  if (isMultiSelect) {
    return current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
  }

  if (current.length === 1 && current[0] === slug) {
    return [];
  }
  return [slug];
}

function filterSearchEntries(entries, filters = {}) {
  const list = Array.isArray(entries) ? entries : [];
  const rawQuery = String(filters.query || "").toLowerCase().trim();
  const tokens = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : [];
  const selectedTags = Array.isArray(filters.tags) ? filters.tags.filter(Boolean) : [];
  const selectedType =
    filters.type && filters.type !== "all" ? String(filters.type) : "all";

  const scored = [];
  for (const item of list) {
    if (selectedType !== "all" && item.type !== selectedType) continue;

    const itemTags = Array.isArray(item.tags) ? item.tags : [];
    const itemTagSlugs = itemTags.map((t) => t.slug);
    if (
      selectedTags.length > 0 &&
      !selectedTags.every((slug) => itemTagSlugs.includes(slug))
    ) {
      continue;
    }

    let score = 0;
    if (tokens.length > 0) {
      const titleText = String(item.title || "").toLowerCase();
      const tagText = itemTags
        .map((t) => `${t.name || ""} ${t.slug || ""}`)
        .join(" ")
        .toLowerCase();
      const descText = String(item.description || "").toLowerCase();
      const bodyText = String(item.content || "").toLowerCase();

      let matchedAllTokens = true;
      for (const tok of tokens) {
        const inTitle = titleText.includes(tok);
        const inTag = tagText.includes(tok);
        const inDesc = descText.includes(tok);
        const inBody = bodyText.includes(tok);
        if (!inTitle && !inTag && !inDesc && !inBody) {
          matchedAllTokens = false;
          break;
        }
        score +=
          (inTitle ? 8 : 0) +
          (inTag ? 5 : 0) +
          (inDesc ? 3 : 0) +
          (inBody ? 1 : 0);
      }
      if (!matchedAllTokens) continue;
    }

    scored.push({ item, score });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (b.item.sortTimestamp || 0) - (a.item.sortTimestamp || 0)
  );
  return scored.map((entry) => entry.item);
}

function initSearchPage() {
  const root = document.querySelector("[data-search-root]");
  if (!root) return;

  const inputEl = root.querySelector("[data-search-input]");
  const clearQueryBtn = root.querySelector("[data-search-clear-query]");
  const resetBtn = root.querySelector("[data-search-reset]");
  const emptyResetBtn = root.querySelector("[data-search-empty-reset]");
  const statusEl = root.querySelector("[data-search-status]");
  const resultsEl = root.querySelector("[data-search-results]");
  const emptyEl = root.querySelector("[data-search-empty]");
  const typeBtns = Array.from(root.querySelectorAll("[data-search-type]"));
  const tagBtns = Array.from(root.querySelectorAll("[data-search-tag]"));

  const knownTagSlugs = new Set(
    tagBtns.map((btn) => btn.getAttribute("data-search-tag")).filter(Boolean)
  );

  const readStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const rawType = params.get("type") || "all";
    const type = rawType === "project" || rawType === "blog" ? rawType : "all";
    const seen = new Set();
    const tags = [];
    for (const raw of params.getAll("tag")) {
      for (const part of raw.split(",")) {
        const slug = part.trim();
        if (slug && !seen.has(slug) && (knownTagSlugs.size === 0 || knownTagSlugs.has(slug))) {
          seen.add(slug);
          tags.push(slug);
        }
      }
    }
    return { query, tags, type };
  };

  let state = readStateFromUrl();
  let allItems = [];
  let tagNameBySlug = new Map();

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (state.query.trim()) params.set("q", state.query.trim());
    if (state.tags.length > 0) params.set("tag", state.tags.join(","));
    if (state.type !== "all") params.set("type", state.type);
    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const fitRenderedCards = () => {
    if (!resultsEl) return;
    resultsEl
      .querySelectorAll("[data-tag-list]")
      .forEach((list) => fitTagList(list, 2));
  };

  const buildResultCard = (item) => {
    const article = document.createElement("article");
    article.className = "ec-card ec-card-interactive p-6";

    const meta = document.createElement("div");
    meta.className = "font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)] mb-2";
    const kindLabel = item.type === "project" ? "Project" : "Essay";
    meta.textContent = item.dateLabel ? `${kindLabel} · ${item.dateLabel}` : kindLabel;

    const heading = document.createElement("h2");
    heading.className = "font-display text-xl md:text-2xl font-bold leading-snug mb-2";
    const titleLink = document.createElement("a");
    titleLink.href = item.url;
    titleLink.className = "hover:text-[var(--accent-primary)] transition-colors";
    titleLink.textContent = item.title;
    heading.appendChild(titleLink);

    const desc = document.createElement("p");
    desc.className = "text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-4";
    desc.textContent = item.description || "";

    const tagList = document.createElement("div");
    tagList.setAttribute("data-tag-list", "");
    tagList.className = "flex flex-wrap gap-1.5";

    for (const tag of item.tags || []) {
      const chip = document.createElement("a");
      chip.href = `/search/?tag=${encodeURIComponent(tag.slug)}`;
      chip.setAttribute("data-tag-item", "");
      chip.className = "ec-chip";
      chip.textContent = tag.name;
      chip.addEventListener("click", (e) => {
        if (e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        state = {
          ...state,
          tags: nextSelectedTags(state.tags, tag.slug, e.ctrlKey || e.metaKey),
        };
        syncUrl();
        render();
      });
      tagList.appendChild(chip);
    }

    const moreChip = document.createElement("span");
    moreChip.setAttribute("data-tag-more", "");
    moreChip.className = "ec-chip ec-chip-more";
    moreChip.hidden = true;
    tagList.appendChild(moreChip);

    article.append(meta, heading, desc, tagList);
    return article;
  };

  const render = () => {
    if (inputEl && inputEl.value !== state.query) {
      inputEl.value = state.query;
    }
    if (clearQueryBtn) {
      clearQueryBtn.hidden = !state.query;
    }
    const hasActiveFilter =
      Boolean(state.query.trim()) || state.tags.length > 0 || state.type !== "all";
    if (resetBtn) {
      resetBtn.hidden = !hasActiveFilter;
    }

    typeBtns.forEach((btn) => {
      const isSelected = btn.getAttribute("data-search-type") === state.type;
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    tagBtns.forEach((btn) => {
      const slug = btn.getAttribute("data-search-tag");
      const isSelected = state.tags.includes(slug);
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    const matches = filterSearchEntries(allItems, state);
    if (resultsEl) {
      resultsEl.replaceChildren(...matches.map(buildResultCard));
    }
    if (emptyEl) {
      emptyEl.hidden = matches.length > 0;
    }

    if (statusEl) {
      const countWord = matches.length === 1 ? "entry" : "entries";
      const parts = [`${matches.length} ${countWord}`];
      if (state.tags.length > 0) {
        const labels = state.tags.map((slug) => tagNameBySlug.get(slug) || slug);
        parts.push(`tagged ${labels.join(" + ")}`);
      }
      if (state.query.trim()) {
        parts.push(`matching "${state.query.trim()}"`);
      }
      statusEl.textContent = parts.join(" · ");
    }

    fitRenderedCards();
  };

  if (inputEl) {
    inputEl.value = state.query;
    inputEl.addEventListener("input", () => {
      state = { ...state, query: inputEl.value };
      syncUrl();
      render();
    });
  }

  if (clearQueryBtn) {
    clearQueryBtn.addEventListener("click", () => {
      state = { ...state, query: "" };
      syncUrl();
      render();
      inputEl?.focus();
    });
  }

  const resetAll = () => {
    state = { query: "", tags: [], type: "all" };
    syncUrl();
    render();
    inputEl?.focus();
  };

  resetBtn?.addEventListener("click", resetAll);
  emptyResetBtn?.addEventListener("click", resetAll);

  typeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextType = btn.getAttribute("data-search-type") || "all";
      state = { ...state, type: nextType };
      syncUrl();
      render();
    });
  });

  tagBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const slug = btn.getAttribute("data-search-tag");
      state = {
        ...state,
        tags: nextSelectedTags(state.tags, slug, e.ctrlKey || e.metaKey),
      };
      syncUrl();
      render();
    });
  });

  window.addEventListener("popstate", () => {
    state = readStateFromUrl();
    render();
  });

  if (resultsEl && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => fitRenderedCards());
    observer.observe(resultsEl);
  } else {
    window.addEventListener("resize", fitRenderedCards, { passive: true });
  }

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(() => fitRenderedCards());
  }

  fetch("/search.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((payload) => {
      allItems = Array.isArray(payload.items) ? payload.items : [];
      tagNameBySlug = new Map(
        (Array.isArray(payload.tags) ? payload.tags : []).map((t) => [t.slug, t.name])
      );
      render();
    })
    .catch(() => {
      if (statusEl) {
        statusEl.textContent = "Unable to load search index.";
      }
    });
}

function orderInlineCardUrls(initialUrls, matchedUrls, hasQuery) {
  const base = Array.isArray(initialUrls) ? initialUrls : [];
  const matched = Array.isArray(matchedUrls) ? matchedUrls : [];
  if (hasQuery) {
    const baseSet = new Set(base);
    return matched.filter((url) => baseSet.has(url));
  }
  const matchedSet = new Set(matched);
  return base.filter((url) => matchedSet.has(url));
}

function initInlineCollectionSearch() {
  const root = document.querySelector("[data-inline-search-root]");
  if (!root) return;

  const fixedType = root.getAttribute("data-inline-search-type") || "all";
  const inputEl = root.querySelector("[data-search-input]");
  const clearQueryBtn = root.querySelector("[data-search-clear-query]");
  const resetBtn = root.querySelector("[data-search-reset]");
  const emptyResetBtn = root.querySelector("[data-search-empty-reset]");
  const statusEl = root.querySelector("[data-search-status]");
  const resultsEl = root.querySelector("[data-search-results]");
  const emptyEl = root.querySelector("[data-search-empty]");
  const dropdownEl = root.querySelector("[data-topic-dropdown]");
  const dropdownBtn = root.querySelector("[data-topic-dropdown-btn]");
  const dropdownPanel = root.querySelector("[data-topic-dropdown-panel]");
  const dropdownChevron = root.querySelector("[data-topic-chevron]");
  const topicCountEl = root.querySelector("[data-topic-count]");
  const topicFilterInput = root.querySelector("[data-topic-filter-input]");
  const topicFilterEmpty = root.querySelector("[data-topic-filter-empty]");
  const dropdownFooter = root.querySelector("[data-topic-dropdown-footer]");
  const topicClearBtn = root.querySelector("[data-topic-clear]");
  const activeTagsRow = root.querySelector("[data-active-tags-row]");
  const activeTagsList = root.querySelector("[data-active-tags-list]");
  const tagBtns = Array.from(root.querySelectorAll("[data-search-tag]"));
  const cards = Array.from(root.querySelectorAll("[data-inline-card]"));
  if (!resultsEl || !cards.length) return;

  const initialUrls = cards
    .map((card) => card.getAttribute("data-inline-card"))
    .filter(Boolean);
  const cardByUrl = new Map(
    cards.map((card) => [card.getAttribute("data-inline-card"), card])
  );

  const tagNameBySlug = new Map();
  tagBtns.forEach((btn) => {
    const slug = btn.getAttribute("data-search-tag");
    const label =
      btn.getAttribute("data-search-tag-label") ||
      btn.querySelector("span")?.textContent?.trim() ||
      slug;
    if (slug) tagNameBySlug.set(slug, label);
  });

  const filterTopicOptions = () => {
    if (!topicFilterInput) return;
    const q = topicFilterInput.value.toLowerCase().trim();
    let visibleOptions = 0;
    tagBtns.forEach((btn) => {
      const slug = btn.getAttribute("data-search-tag") || "";
      const label = (tagNameBySlug.get(slug) || slug).toLowerCase();
      const matches = !q || label.includes(q) || slug.includes(q);
      btn.hidden = !matches;
      if (matches) visibleOptions += 1;
    });
    if (topicFilterEmpty) {
      topicFilterEmpty.hidden = visibleOptions > 0;
    }
  };

  const setDropdownOpen = (open) => {
    if (!dropdownPanel || !dropdownBtn) return;
    dropdownPanel.hidden = !open;
    dropdownBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (dropdownChevron) {
      dropdownChevron.style.transform = open ? "rotate(180deg)" : "";
    }
    if (!open && topicFilterInput && topicFilterInput.value) {
      topicFilterInput.value = "";
      filterTopicOptions();
    }
  };

  // Immediate fallback index derived from server-rendered cards before /search.json resolves
  let entries = cards.map((card, idx) => {
    const url = card.getAttribute("data-inline-card") || "";
    const title = card.querySelector("h2")?.textContent?.trim() || "";
    const description = card.querySelector("p")?.textContent?.trim() || "";
    const tags = Array.from(card.querySelectorAll("[data-tag-item]")).map((el) => ({
      name: el.textContent.trim(),
      slug: el.getAttribute("data-tag-slug") || "",
    }));
    return {
      title,
      url,
      type: fixedType,
      sortTimestamp: cards.length - idx,
      description,
      tags,
      content: "",
    };
  });

  const readStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const seen = new Set();
    const tags = [];
    for (const raw of params.getAll("tag")) {
      for (const part of raw.split(",")) {
        const slug = part.trim();
        if (slug && !seen.has(slug) && (tagNameBySlug.size === 0 || tagNameBySlug.has(slug))) {
          seen.add(slug);
          tags.push(slug);
        }
      }
    }
    return { query, tags };
  };

  let state = readStateFromUrl();

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (state.query.trim()) params.set("q", state.query.trim());
    if (state.tags.length > 0) params.set("tag", state.tags.join(","));
    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const render = () => {
    if (inputEl && inputEl.value !== state.query) {
      inputEl.value = state.query;
    }
    if (clearQueryBtn) {
      clearQueryBtn.hidden = !state.query;
    }

    const hasQuery = Boolean(state.query.trim());
    const hasTags = state.tags.length > 0;
    const hasActiveFilter = hasQuery || hasTags;

    if (topicCountEl) {
      topicCountEl.hidden = !hasTags;
      topicCountEl.textContent = String(state.tags.length);
    }
    if (dropdownBtn) {
      dropdownBtn.style.borderColor = hasTags ? "var(--accent-primary)" : "";
      dropdownBtn.style.color = hasTags ? "var(--text-primary)" : "";
    }
    if (dropdownFooter) {
      dropdownFooter.hidden = !hasTags;
    }

    tagBtns.forEach((btn) => {
      const slug = btn.getAttribute("data-search-tag");
      const isSelected = state.tags.includes(slug);
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    if (activeTagsRow && activeTagsList) {
      activeTagsRow.hidden = !hasTags;
      const chipNodes = state.tags.map((slug) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ec-chip ec-chip-removable";
        const labelText = tagNameBySlug.get(slug) || slug;
        chip.setAttribute("aria-label", `Remove ${labelText} filter`);
        const nameSpan = document.createElement("span");
        nameSpan.textContent = labelText;
        const closeSpan = document.createElement("span");
        closeSpan.setAttribute("aria-hidden", "true");
        closeSpan.textContent = "×";
        chip.append(nameSpan, closeSpan);
        chip.addEventListener("click", () => {
          state = {
            ...state,
            tags: nextSelectedTags(state.tags, slug, true),
          };
          syncUrl();
          render();
        });
        return chip;
      });
      activeTagsList.replaceChildren(...chipNodes);
    }
    if (resetBtn) {
      resetBtn.hidden = !hasActiveFilter;
    }

    const matches = filterSearchEntries(entries, {
      query: state.query,
      tags: state.tags,
      type: fixedType,
    });
    const orderedUrls = orderInlineCardUrls(
      initialUrls,
      matches.map((m) => m.url),
      hasQuery
    );
    const visibleSet = new Set(orderedUrls);

    const targetOrder = [
      ...orderedUrls,
      ...initialUrls.filter((u) => !visibleSet.has(u)),
    ];
    const currentDomUrls = Array.from(resultsEl.children).map((el) =>
      el.getAttribute("data-inline-card")
    );
    if (targetOrder.some((u, idx) => currentDomUrls[idx] !== u)) {
      targetOrder.forEach((u) => {
        const card = cardByUrl.get(u);
        if (card) resultsEl.appendChild(card);
      });
    }

    cards.forEach((card) => {
      const url = card.getAttribute("data-inline-card");
      const isVisible = visibleSet.has(url);
      card.hidden = !isVisible;
      if (isVisible) {
        card.querySelectorAll("[data-tag-list]").forEach((list) => fitTagList(list, 2));
      }
    });

    resultsEl.hidden = orderedUrls.length === 0;
    if (emptyEl) {
      emptyEl.hidden = orderedUrls.length > 0;
    }

    if (statusEl) {
      statusEl.hidden = !hasActiveFilter;
      if (hasActiveFilter) {
        const noun =
          fixedType === "project"
            ? orderedUrls.length === 1
              ? "project"
              : "projects"
            : orderedUrls.length === 1
              ? "essay"
              : "essays";
        const parts = [`${orderedUrls.length} ${noun}`];
        if (state.tags.length > 0) {
          const labels = state.tags.map((slug) => tagNameBySlug.get(slug) || slug);
          parts.push(`tagged ${labels.join(" + ")}`);
        }
        if (hasQuery) {
          parts.push(`matching "${state.query.trim()}"`);
        }
        statusEl.textContent = parts.join(" · ");
      } else {
        statusEl.textContent = "";
      }
    }
  };

  if (inputEl) {
    inputEl.value = state.query;
    inputEl.addEventListener("input", () => {
      state = { ...state, query: inputEl.value };
      syncUrl();
      render();
    });
  }

  clearQueryBtn?.addEventListener("click", () => {
    state = { ...state, query: "" };
    syncUrl();
    render();
    inputEl?.focus();
  });

  const resetAll = () => {
    state = { query: "", tags: [] };
    syncUrl();
    render();
    inputEl?.focus();
  };

  resetBtn?.addEventListener("click", resetAll);
  emptyResetBtn?.addEventListener("click", resetAll);

  topicClearBtn?.addEventListener("click", () => {
    state = { ...state, tags: [] };
    syncUrl();
    render();
  });

  dropdownBtn?.addEventListener("click", () => {
    const isOpen = dropdownBtn.getAttribute("aria-expanded") === "true";
    setDropdownOpen(!isOpen);
  });

  topicFilterInput?.addEventListener("input", filterTopicOptions);

  document.addEventListener("click", (e) => {
    if (dropdownEl && !dropdownEl.contains(e.target)) {
      setDropdownOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  });

  tagBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-search-tag");
      state = {
        ...state,
        tags: nextSelectedTags(state.tags, slug, true),
      };
      syncUrl();
      render();
    });
  });

  resultsEl.querySelectorAll("[data-tag-item]").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.shiftKey || e.altKey || e.button !== 0) return;
      const slug = chip.getAttribute("data-tag-slug");
      if (!slug) return;
      e.preventDefault();
      state = {
        ...state,
        tags: nextSelectedTags(state.tags, slug, e.ctrlKey || e.metaKey),
      };
      syncUrl();
      render();
    });
  });

  window.addEventListener("popstate", () => {
    state = readStateFromUrl();
    render();
  });

  render();

  fetch("/search.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((payload) => {
      if (Array.isArray(payload.items)) {
        entries = payload.items.filter((item) => item.type === fixedType);
        render();
      }
    })
    .catch(() => {});
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    syncThemeIcons();
    initSmartNavbar();
    initCardTagOverflow();
    initMobileCarousels();
    initSearchPage();
    initInlineCollectionSearch();
    initArticleReader();
    initHomeScrollSpy();
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggleMobileMenu(true);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          window.location.href = "/search/";
        }
      }
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
  countChipLines,
  fitTagList,
  initCardTagOverflow,
  nextSelectedTags,
  filterSearchEntries,
  orderInlineCardUrls,
  initSearchPage,
  initInlineCollectionSearch,
  initArticleReader,
  initHomeScrollSpy,
};