const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "src", "assets", "js", "index.js"), "utf8");
const scrollSpySource = source.slice(source.indexOf("function initScrollSpyBottom("), source.indexOf("function computeCarouselIndex("));

function setup(kind, { height = 2000, viewport = 1000 } = {}) {
  let scrollY = 0;
  const listeners = {};
  const observers = [];
  const targets = [100, 800, 1700].map((top, index) => ({
    id: `section-${index}`,
    tagName: "H2",
    textContent: `Section ${index}`,
    getBoundingClientRect: () => ({ top: top - scrollY }),
  }));
  const links = [];
  const makeLink = (id) => {
    const classes = new Set();
    return {
      style: {},
      getAttribute: () => id,
      classList: {
        toggle: (name, active) => active ? classes.add(name) : classes.delete(name),
        contains: (name) => classes.has(name),
      },
    };
  };
  const rail = { classList: { add() {}, remove() {} } };
  const prose = { querySelectorAll: () => targets };
  const list = { appendChild: (link) => links.push(link) };
  if (kind === "home") targets.forEach((target) => links.push(makeLink(target.id)));

  const document = {
    documentElement: { scrollHeight: height },
    querySelector: (selector) => ({
      "#article-prose": kind === "article" ? prose : null,
      "#toc-rail": kind === "article" ? rail : null,
      "#toc-list": kind === "article" ? list : null,
    })[selector] || null,
    querySelectorAll: () => kind === "home" ? links : [],
    getElementById: (id) => targets.find((target) => target.id === id),
    createElement: () => makeLink(),
  };
  const window = {
    innerHeight: viewport,
    get scrollY() { return scrollY; },
    addEventListener: (event, handler) => { (listeners[event] ||= []).push(handler); },
    IntersectionObserver: true,
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
  }
  const context = { document, window, IntersectionObserver };
  vm.runInNewContext(scrollSpySource, context);
  context[kind === "article" ? "initArticleReader" : "initHomeScrollSpy"]();

  return {
    links,
    intersect(index) { observers[0].callback([{ target: targets[index], isIntersecting: true }]); },
    scrollTo(y) { scrollY = y; (listeners.scroll || []).forEach((handler) => handler()); },
    active() { return links.findIndex((link) => link.classList.contains("is-active")); },
  };
}

for (const kind of ["article", "home"]) {
  test(`${kind} scroll spy highlights the final section at the bottom and restores the current section on scroll up`, () => {
    const page = setup(kind);
    page.intersect(1);
    assert.equal(page.active(), 1);
    page.scrollTo(1000);
    assert.equal(page.active(), 2);
    page.intersect(1);
    assert.equal(page.active(), 2);
    page.scrollTo(950);
    assert.equal(page.active(), 1);
  });

  test(`${kind} scroll spy does not treat an unscrollable page as scrolled to bottom`, () => {
    const page = setup(kind, { height: 1000 });
    page.scrollTo(0);
    assert.equal(page.active(), 0);
  });
}
