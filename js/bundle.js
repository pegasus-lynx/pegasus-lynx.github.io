(() => {
  // src/assets/js/index.js
  function copyPageUrl() {
    const ta = document.createElement("textarea");
    ta.value = window.location.href;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  function toggleMobileMenu() {
    const menu = document.querySelector("#mobile-nav-menu");
    menu.classList.toggle("hidden");
  }
  globalThis.App = { copyPageUrl, toggleMobileMenu };
})();
//# sourceMappingURL=bundle.js.map
