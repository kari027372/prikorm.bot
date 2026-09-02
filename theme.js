/* ============================================================
   theme.js
   Управление темами приложения (светлая, тёмная, детская)
   ============================================================ */

const THEME_STORAGE_KEY = "prikorm_theme";

const AVAILABLE_THEMES = {
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
        title: "Детская",
        icon: "🌈",
        description: "Более мягкое и игровое оформление"
    }
};

function getTheme() {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
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

    // Удаляем все классы тем
    document.body.classList.remove("theme-light", "theme-dark", "theme-kids");
    // Добавляем класс выбранной темы
    document.body.classList.add(`theme-${theme}`);
    // Сохраняем выбор
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn("Не удалось сохранить тему:", error);
    }

    // Обновляем meta theme-color для мобильных браузеров
    updateThemeColor(theme);

    // Обновляем кнопки выбора темы (если они есть на экране)
    updateThemeButtons(theme);

    // Сообщаем приложению об изменении темы
    window.dispatchEvent(new CustomEvent("prikorm:themechange", { detail: { theme } }));

    return theme;
}

function updateThemeColor(theme) {
    let color = "#f5f0eb"; // светлая
    if (theme === "dark") {
        color = "#1a1a1a";
    } else if (theme === "kids") {
        color = "#fff7f0";
    }
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
    }
    meta.content = color;
}

function renderThemeButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const current = getTheme();
    container.innerHTML = Object.values(AVAILABLE_THEMES).map(theme => `
        <button type="button" class="theme-option ${current === theme.id ? 'active' : ''}" data-action="select-theme" data-theme="${theme.id}">
            <span class="theme-option-icon">${theme.icon}</span>
            <span class="theme-option-content">
                <strong>${theme.title}</strong>
                <small>${theme.description}</small>
            </span>
            <span class="theme-option-check">${current === theme.id ? '✓' : ''}</span>
        </button>
    `).join("");
}

function updateThemeButtons(currentTheme) {
    document.querySelectorAll('[data-action="select-theme"]').forEach(button => {
        const isActive = button.dataset.theme === currentTheme;
        button.classList.toggle("active", isActive);
        const check = button.querySelector(".theme-option-check");
        if (check) {
            check.textContent = isActive ? "✓" : "";
        }
    });
}

function toggleTheme() {
    const themes = Object.keys(AVAILABLE_THEMES);
    const current = getTheme();
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
}

function initTheme() {
    const theme = getTheme();
    setTheme(theme);
}

// Экспорт
window.getTheme = getTheme;
window.setTheme = setTheme;
window.renderThemeButtons = renderThemeButtons;
window.updateThemeButtons = updateThemeButtons;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;