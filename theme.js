/* ============================================================
   theme.js
   Управление темой приложения
   ============================================================ */

var THEME_STORAGE_KEY = "prikorm_theme";

var AVAILABLE_THEMES = {
    light: {
        id: "light",
        title: "Светлая",
        icon: "☀️",
        description: "Спокойное светлое оформление"
    },
    dark: {
        id: "dark",
        title: "Тёмная",
        icon: "🌙",
        description: "Комфортно для вечернего использования"
    },
    kids: {
        id: "kids",
        title: "Малыш",
        icon: "🌈",
        description: "Более мягкое и игровое оформление"
    }
};

function getTheme() {
    try {
        var saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved && AVAILABLE_THEMES[saved]) {
            return saved;
        }
    } catch (error) {
        console.warn("Не удалось получить тему:", error);
    }
    return "light";
}

function setTheme(theme) {
    if (!AVAILABLE_THEMES[theme]) {
        theme = "light";
    }
    var body = document.body;
    body.classList.remove("theme-light", "theme-dark", "theme-kids");
    body.classList.add("theme-" + theme);
    body.dataset.theme = theme;
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn("Не удалось сохранить тему:", error);
    }
    updateThemeColor(theme);
    updateThemeButtons(theme);
    window.dispatchEvent(new CustomEvent("prikorm:themechange", { detail: { theme: theme } }));
    return theme;
}

function updateThemeColor(theme) {
    var color = "#f8f4f0";
    if (theme === "dark") color = "#171514";
    if (theme === "kids") color = "#fff7f0";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
    }
    meta.content = color;
}

function renderThemeButtons(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var current = getTheme();
    container.innerHTML = Object.values(AVAILABLE_THEMES).map(function(theme) {
        return '<button type="button" class="theme-option ' + (current === theme.id ? "active" : "") + '" data-action="select-theme" data-theme="' + theme.id + '"><span class="theme-option-icon">' + theme.icon + '</span><span class="theme-option-content"><strong>' + theme.title + '</strong><small>' + theme.description + '</small></span><span class="theme-option-check">' + (current === theme.id ? "✓" : "") + '</span></button>';
    }).join("");
}

function updateThemeButtons(currentTheme) {
    document.querySelectorAll("[data-action='select-theme']").forEach(function(button) {
        var isActive = button.dataset.theme === currentTheme;
        button.classList.toggle("active", isActive);
        var check = button.querySelector(".theme-option-check");
        if (check) {
            check.textContent = isActive ? "✓" : "";
        }
    });
}

function toggleTheme() {
    var themes = Object.keys(AVAILABLE_THEMES);
    var current = getTheme();
    var currentIndex = themes.indexOf(current);
    var nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
}

function initTheme() {
    var theme = getTheme();
    setTheme(theme);
}

document.addEventListener("click", function(event) {
    var button = event.target.closest("[data-action='select-theme']");
    if (!button) return;
    var theme = button.dataset.theme;
    if (!AVAILABLE_THEMES[theme]) return;
    setTheme(theme);
    showToast("Тема «" + AVAILABLE_THEMES[theme].title + "» включена", "success");
});

window.getTheme = getTheme;
window.setTheme = setTheme;
window.renderThemeButtons = renderThemeButtons;
window.updateThemeButtons = updateThemeButtons;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;