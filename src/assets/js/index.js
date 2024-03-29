
function copyPageUrl() {
    const ta = document.createElement("textarea");
    ta.value = window.location.href;
    ta.setAttribute(`readonly`, ``);
    ta.style.position = `absolute`;
    ta.style.left = `-9999px`;
    document.body.appendChild(ta);            
    ta.select();
    ta.setSelectionRange(0, 99999)
    document.execCommand("copy");
    document.body.removeChild(ta);
}

function toggleMobileMenu() {
    const menu = document.querySelector(`#mobile-nav-menu`);
    menu.classList.toggle(`hidden`);
}

function onLoadInit() {
    const html = document.querySelector(`html`);
    const body = document.querySelector(`body`);
    const darkModeIcon1 = document.querySelector(`#dark-mode-icon1`);
    const darkModeIcon2 = document.querySelector(`#dark-mode-icon2`);

    if(localStorage.getItem(`darkMode`) === null) { 
        localStorage.setItem(`darkMode`, false);
    }
    const darkMode = localStorage.getItem(`darkMode`);

    if(darkMode === `true`) {
        html.classList.add("dark");
        body.classList.add("body-pattern-dark");
        body.classList.remove("body-pattern");
        darkModeIcon1.classList.add("fa-moon");
        darkModeIcon1.classList.remove("fa-sun");
        darkModeIcon2.classList.add("fa-moon");
        darkModeIcon2.classList.remove("fa-sun");
    }
    else {
        html.classList.remove("dark");
        body.classList.remove("body-pattern-dark");
        body.classList.add("body-pattern");        
        darkModeIcon1.classList.remove("fa-moon");
        darkModeIcon1.classList.add("fa-sun");
        darkModeIcon2.classList.remove("fa-moon");
        darkModeIcon2.classList.add("fa-sun");
    }
}

function toggleDarkMode() {
    const html = document.querySelector(`html`);
    html.classList.toggle("dark");
    const darkModeIcon1 = document.querySelector(`#dark-mode-icon1`);
    const darkModeIcon2 = document.querySelector(`#dark-mode-icon2`);
    darkModeIcon1.classList.toggle(`fa-moon`);
    darkModeIcon1.classList.toggle(`fa-sun`);
    darkModeIcon2.classList.toggle(`fa-moon`);
    darkModeIcon2.classList.toggle(`fa-sun`);
    const body = document.querySelector(`body`);
    body.classList.toggle("body-pattern");
    body.classList.toggle("body-pattern-dark");
    localStorage.setItem(`darkMode`, html.classList.contains(`dark`));
}

globalThis.App = { copyPageUrl, toggleMobileMenu, onLoadInit, toggleDarkMode };