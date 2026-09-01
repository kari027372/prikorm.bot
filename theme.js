/* ============================================================
   theme.js
   Управление темой приложения
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
        title: "Малыш",
        icon: "🌈",
        description: "Более мягкое и игровое оформление"
    }
};


/* ============================================================
   ПОЛУЧИТЬ ТЕКУЩУЮ ТЕМУ
   ============================================================ */

function getTheme() {

    try {

        const saved =
            localStorage.getItem(
                THEME_STORAGE_KEY
            );


        if (
            saved &&
            AVAILABLE_THEMES[saved]
        ) {

            return saved;
        }

    } catch (error) {

        console.warn(
            "Не удалось получить тему:",
            error
        );
    }


    return "light";
}


/* ============================================================
   УСТАНОВИТЬ ТЕМУ
   ============================================================ */

function setTheme(
    theme
) {

    /*
       Если передали неизвестную тему —
       используем светлую.
    */

    if (
        !AVAILABLE_THEMES[theme]
    ) {

        theme = "light";
    }


    const body =
        document.body;


    /*
       Сначала убираем все классы тем.
    */

    body.classList.remove(
        "theme-light",
        "theme-dark",
        "theme-kids"
    );


    /*
       Добавляем класс выбранной темы.
    */

    body.classList.add(
        `theme-${theme}`
    );


    /*
       Атрибут тоже полезен:
       CSS, accessibility и будущая
       логика могут использовать его.
    */

    body.dataset.theme =
        theme;


    /*
       Сохраняем выбор.
    */

    try {

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

    } catch (error) {

        console.warn(
            "Не удалось сохранить тему:",
            error
        );
    }


    /*
       Обновляем meta theme-color
       для мобильного браузера / PWA.
    */

    updateThemeColor(
        theme
    );


    /*
       Обновляем кнопки выбора темы,
       если они сейчас находятся на экране.
    */

    updateThemeButtons(
        theme
    );


    /*
       Сообщаем приложению,
       что тема изменилась.
    */

    window.dispatchEvent(
        new CustomEvent(
            "prikorm:themechange",
            {
                detail: {
                    theme
                }
            }
        )
    );


    return theme;
}


/* ============================================================
   META THEME COLOR
   ============================================================ */

function updateThemeColor(
    theme
) {

    let color =
        "#f8f4f0";


    if (
        theme === "dark"
    ) {

        color =
            "#171514";
    }


    if (
        theme === "kids"
    ) {

        color =
            "#fff7f0";
    }


    let meta =
        document.querySelector(
            'meta[name="theme-color"]'
        );


    if (!meta) {

        meta =
            document.createElement(
                "meta"
            );

        meta.name =
            "theme-color";

        document.head.appendChild(
            meta
        );
    }


    meta.content =
        color;
}


/* ============================================================
   СОЗДАТЬ КНОПКИ ТЕМ
   ============================================================ */

function renderThemeButtons(
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    const current =
        getTheme();


    container.innerHTML =
        Object.values(
            AVAILABLE_THEMES
        )
        .map(
            theme => `

                <button
                    type="button"
                    class="theme-option ${
                        current === theme.id
                            ? "active"
                            : ""
                    }"
                    data-action="select-theme"
                    data-theme="${theme.id}">

                    <span
                        class="theme-option-icon">

                        ${theme.icon}

                    </span>


                    <span
                        class="theme-option-content">

                        <strong>
                            ${theme.title}
                        </strong>

                        <small>
                            ${theme.description}
                        </small>

                    </span>


                    <span
                        class="theme-option-check">

                        ${
                            current === theme.id
                                ? "✓"
                                : ""
                        }

                    </span>

                </button>

            `
        )
        .join("");
}


/* ============================================================
   ОБНОВИТЬ КНОПКИ
   ============================================================ */

function updateThemeButtons(
    currentTheme
) {

    document
        .querySelectorAll(
            "[data-action='select-theme']"
        )
        .forEach(
            button => {

                const isActive =
                    button.dataset.theme ===
                    currentTheme;


                button.classList.toggle(
                    "active",
                    isActive
                );


                const check =
                    button.querySelector(
                        ".theme-option-check"
                    );


                if (check) {

                    check.textContent =
                        isActive
                            ? "✓"
                            : "";
                }
            }
        );
}


/* ============================================================
   ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
   ============================================================ */

function toggleTheme() {

    const themes =
        Object.keys(
            AVAILABLE_THEMES
        );


    const current =
        getTheme();


    const currentIndex =
        themes.indexOf(
            current
        );


    const nextIndex =
        (
            currentIndex + 1
        ) %
        themes.length;


    setTheme(
        themes[nextIndex]
    );
}


/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */

function initTheme() {

    const theme =
        getTheme();


    setTheme(
        theme
    );
}


/* ============================================================
   ОБРАБОТЧИК КНОПОК ТЕМЫ
   ============================================================ */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action='select-theme']"
            );


        if (!button) {
            return;
        }


        const theme =
            button.dataset.theme;


        if (
            !AVAILABLE_THEMES[theme]
        ) {

            return;
        }


        setTheme(
            theme
        );


        showToast(
            `Тема «${AVAILABLE_THEMES[theme].title}» включена`,
            "success"
        );
    }
);


/* ============================================================
   EXPORT
   ============================================================ */

window.getTheme =
    getTheme;

window.setTheme =
    setTheme;

window.renderThemeButtons =
    renderThemeButtons;

window.updateThemeButtons =
    updateThemeButtons;

window.toggleTheme =
    toggleTheme;

window.initTheme =
    initTheme;