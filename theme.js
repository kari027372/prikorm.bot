// ================================================================
// theme.js — управление темами (светлая, ночная, детская)
// ================================================================

const THEME_KEY = 'prikorm_theme';

// Получить текущую тему
function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

// Установить тему и применить классы к body
function setTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-kids');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else if (theme === 'kids') document.body.classList.add('theme-kids');
    localStorage.setItem(THEME_KEY, theme);
}

// Применить сохранённую тему при загрузке
function applyTheme() {
    const theme = getTheme();
    setTheme(theme);
}

// Рендерить кнопки выбора темы в указанном контейнере
function renderThemeButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const currentTheme = getTheme();
    const themes = [
        { id: 'light', label: 'Светлая', emoji: '☀️' },
        { id: 'dark', label: 'Ночная', emoji: '🌙' },
        { id: 'kids', label: 'Детская', emoji: '🎈' }
    ];
    
    // Удаляем старые кнопки, если они уже были добавлены
    const oldThemeBlock = container.querySelector('.theme-selector');
    if (oldThemeBlock) oldThemeBlock.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'theme-selector';
    wrapper.style.cssText = 'margin-top:16px; border-top:1px solid var(--border); padding-top:12px;';
    
    const label = document.createElement('div');
    label.style.cssText = 'font-weight:500; margin-bottom:6px; color:var(--text-secondary);';
    label.textContent = 'Выберите тему:';
    wrapper.appendChild(label);

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap;';
    
    themes.forEach(t => {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-outline theme-btn ${currentTheme === t.id ? 'active' : ''}`;
        btn.dataset.theme = t.id;
        btn.textContent = `${t.emoji} ${t.label}`;
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
            // Обновляем активное состояние всех кнопок
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Можно вызвать перерисовку профиля, если она нужна
            if (typeof renderProfile === 'function') renderProfile();
        });
        btnGroup.appendChild(btn);
    });
    
    wrapper.appendChild(btnGroup);
    container.appendChild(wrapper);
}

// Автоматически применить тему при загрузке страницы
document.addEventListener('DOMContentLoaded', applyTheme);