window.renderHome = function() {
    const state = window.STATE || {};
    // Получаем текущего ребёнка
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    const introduced = state.products?.introduced || [];
    const diary = state.diary || [];
    const totalIntroduced = introduced.length;

    // Точный возраст через formatAge (из utils.js)
    let ageText = 'Возраст не указан';
    if (baby.birthDate && typeof window.formatAge === 'function') {
        ageText = window.formatAge(baby.birthDate);
    } else if (baby.birthDate) {
        // fallback
        const birth = new Date(baby.birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        months = Math.max(0, months);
        ageText = months + ' мес.';
    }

    const allProducts = window.PRODUCTS || [];
    const totalProducts = allProducts.length;
    const progressPercent = totalProducts > 0 ? Math.min(100, (totalIntroduced / totalProducts) * 100) : 0;

    const recentEntries = diary.slice(-3).reverse();
    let recentHtml = '';
    if (recentEntries.length === 0) {
        recentHtml = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <h3>Нет записей</h3>
                <p>Добавьте первый прикорм в дневник</p>
            </div>
        `;
    } else {
        recentHtml = recentEntries.map(entry => `
            <div class="diary-entry">
                <span class="diary-entry-icon">${entry.emoji || '🍽️'}</span>
                <div class="diary-entry-content">
                    <div class="diary-entry-header">
                        <strong>${entry.productName || 'Продукт'}</strong>
                        <span>${entry.date || ''}</span>
                    </div>
                    <div class="diary-entry-meta">
                        ${entry.amount || ''}
                        ${entry.reaction ? '⚠️ ' + entry.reaction : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    const avatarEmoji = baby.sex === 'male' ? '👦' : baby.sex === 'female' ? '👧' : '👶';

    return `
        <div class="screen active">
            <div class="page-header">
                <h1>🌸 Прикорм</h1>
                <button class="icon-button" data-action="toggleTheme">🌓</button>
            </div>

            <div class="baby-profile-card" id="babyCard">
                <div class="baby-avatar">${avatarEmoji}</div>
                <div>
                    <strong id="babyName">${baby.name || 'Малыш'}</strong>
                    <div class="muted" id="babyAge">${ageText}</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <div class="progress-card">
                <div class="header">
                    <span>📊 Прогресс введения</span>
                    <span id="progressCount">${totalIntroduced} / ${totalProducts}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressFill" style="width:${Math.round(progressPercent)}%;"></div>
                </div>
            </div>

            <div class="quick-actions">
                <div class="quick-action" data-action="navigate" data-screen="today">
                    <span>📅</span>
                    <strong>План на сегодня</strong>
                    <small>Что дать малышу</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="diary">
                    <span>📖</span>
                    <strong>Дневник</strong>
                    <small>Записать прикорм</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="products">
                    <span>🥑</span>
                    <strong>Продукты</strong>
                    <small>Выбрать новый</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="recipes">
                    <span>🍲</span>
                    <strong>Рецепты</strong>
                    <small>Идеи для блюд</small>
                </div>
            </div>

            <div class="section-heading">
                <span>🕒 Последние записи</span>
                <button class="icon-button" data-action="navigate" data-screen="diary">→</button>
            </div>
            <div id="recentEntries">
                ${recentHtml}
            </div>
        </div>
    `;
};
// ============================================================
// ПРИВЕТСТВЕННЫЙ БАННЕР НА ГЛАВНОЙ
// ============================================================

function showWelcomeBanner() {
    // Проверяем, есть ли уже баннер
    if (document.querySelector('.welcome-banner')) return;

    var state = window.STATE || {};
    var children = Array.isArray(state.children) ? state.children : [];
    var child = null;

    // Находим активного ребёнка
    if (state.currentChildId) {
        child = children.find(c => c.id === state.currentChildId);
    }
    if (!child && children.length > 0) {
        child = children[0];
    }
    if (!child) return;

    var name = child.name || 'Малыш';
    var birthDate = child.birthDate;
    var ageText = '';

    if (birthDate) {
        var age = calculateAge(birthDate);
        var months = age.months;
        var days = age.days;
        if (months > 0) {
            ageText = months + ' ' + getMonthDeclension(months);
            if (days > 0) {
                ageText += ' ' + days + ' ' + getDayDeclension(days);
            }
        } else if (days > 0) {
            ageText = days + ' ' + getDayDeclension(days);
        } else {
            ageText = 'только родился';
        }
    }

    // Приветственные фразы
    var greetings = [
        'Доброе утро, ',
        'Привет, ',
        'Здравствуй, ',
        'Солнышко, '
    ];
    var greeting = greetings[Math.floor(Math.random() * greetings.length)];

    var wishes = [
        '🌱 Сегодня новый вкус ждёт тебя!',
        '🌸 Пусть день будет вкусным и радостным!',
        '🥄 Готовы к новым открытиям?',
        '🍎 Пришло время попробовать что-то новое!',
        '💛 Мы рядом на каждом шагу!'
    ];
    var wish = wishes[Math.floor(Math.random() * wishes.length)];

    // Создаём баннер
    var banner = document.createElement('div');
    banner.className = 'welcome-banner';
    banner.innerHTML = `
        <div class="welcome-banner-icon">🌸</div>
        <div class="welcome-banner-content">
            <div class="welcome-banner-greeting">${greeting}${name}!</div>
            <div class="welcome-banner-age">${ageText ? ageText : ''}</div>
            <div class="welcome-banner-wish">${wish}</div>
        </div>
        <button class="welcome-banner-close" aria-label="Закрыть">✕</button>
    `;

    // Добавляем в начало #app-content
    var appContent = document.getElementById('app-content');
    if (appContent) {
        appContent.prepend(banner);
        // Активируем анимацию после добавления
        requestAnimationFrame(function() {
            banner.classList.add('visible');
        });
    }

    // Закрытие по кнопке
    var closeBtn = banner.querySelector('.welcome-banner-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeWelcomeBanner(banner);
        });
    }

    // Автоматическое закрытие через 5 секунд
    setTimeout(function() {
        if (banner && banner.parentNode) {
            closeWelcomeBanner(banner);
        }
    }, 5000);

    // Клик по баннеру не закрывает (только кнопка)
}

function closeWelcomeBanner(banner) {
    if (!banner) return;
    banner.classList.remove('visible');
    banner.classList.add('hiding');
    setTimeout(function() {
        if (banner.parentNode) {
            banner.parentNode.removeChild(banner);
        }
    }, 400);
}

function getMonthDeclension(n) {
    var lastDigit = n % 10;
    var lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'месяцев';
    if (lastDigit === 1) return 'месяц';
    if (lastDigit >= 2 && lastDigit <= 4) return 'месяца';
    return 'месяцев';
}

function getDayDeclension(n) {
    var lastDigit = n % 10;
    var lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
}

// Экспортируем функцию для вызова из app.js
window.showWelcomeBanner = showWelcomeBanner;