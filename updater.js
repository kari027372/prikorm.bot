/* ============================================================
   updater.js
   Управление обновлениями приложения
   ============================================================ */

const VERSION_STORAGE_KEY = 'prikorm_app_version';

// Получить текущую версию из config
function getAppVersion() {
    return APP_CONFIG.app.version;
}

// Получить сохранённую версию
function getSavedVersion() {
    return localStorage.getItem(VERSION_STORAGE_KEY) || '0.0.0';
}

// Сохранить версию
function saveVersion(version) {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
}

// Проверить, есть ли обновление
function checkForUpdate() {
    const current = getAppVersion();
    const saved = getSavedVersion();
    return current !== saved;
}

// Показать диалог обновления
function showUpdateDialog() {
    const current = getAppVersion();
    const saved = getSavedVersion();

    // Создаём модальное окно (можно использовать вашу модалку из ui.js)
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'update-modal';
    overlay.innerHTML = `
        <div class="modal-sheet" style="max-width:400px; width:90%;">
            <div style="text-align:center; padding:20px;">
                <div style="font-size:48px;">🔄</div>
                <h2 style="margin:16px 0 8px;">Доступно обновление</h2>
                <p style="color:#555; font-size:16px;">
                    Версия <strong>${saved}</strong> → <strong>${current}</strong>
                </p>
                <p style="color:#777; margin-bottom:20px; font-size:14px;">
                    Установить сейчас или позже?
                </p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button id="update-now" class="primary-button" style="flex:1;">Обновить сейчас</button>
                    <button id="update-later" class="secondary-button" style="flex:1;">Позже</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Обработчики
    document.getElementById('update-now').addEventListener('click', function() {
        overlay.remove();
        performUpdate();
    });

    document.getElementById('update-later').addEventListener('click', function() {
        // Сохраняем новую версию, чтобы не беспокоить до следующего обновления
        saveVersion(getAppVersion());
        overlay.remove();
        // Если хотите, можно перезагрузить, но не обязательно
        // location.reload();
    });
}

// Выполнить обновление с прогрессом
function performUpdate() {
    // Показываем экран загрузки с прогресс-баром
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) {
        // Если нет элемента, создадим временный
        createProgressScreen();
    } else {
        // Превращаем загрузочный экран в прогресс-бар
        loadingScreen.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">Обновление приложения...</div>
            <div style="width:80%; max-width:300px; margin-top:16px; background:#ddd; border-radius:10px; overflow:hidden; height:8px;">
                <div id="progress-fill" style="width:0%; height:100%; background:#d4a373; transition: width 0.3s;"></div>
            </div>
            <div style="margin-top:8px; font-size:14px; color:#888;" id="progress-text">0%</div>
        `;
        loadingScreen.classList.remove('hidden');
        loadingScreen.style.display = 'flex';
    }

    // Имитация прогресса (0 → 100%)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5; // случайный прирост
        if (progress > 100) progress = 100;

        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = Math.round(progress) + '%';

        if (progress >= 100) {
            clearInterval(interval);
            // Завершаем обновление
            setTimeout(() => {
                // Сохраняем новую версию
                saveVersion(getAppVersion());
                // Перезагружаем страницу (можно добавить параметр, чтобы избежать цикла)
                location.reload(true);
            }, 500);
        }
    }, 200);
}

// Создать экран загрузки, если его нет
function createProgressScreen() {
    const div = document.createElement('div');
    div.id = 'loading-screen';
    div.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: #f5f0eb; display:flex; flex-direction:column;
        justify-content:center; align-items:center; z-index:9999;
    `;
    div.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">Обновление приложения...</div>
        <div style="width:80%; max-width:300px; margin-top:16px; background:#ddd; border-radius:10px; overflow:hidden; height:8px;">
            <div id="progress-fill" style="width:0%; height:100%; background:#d4a373;"></div>
        </div>
        <div style="margin-top:8px; font-size:14px; color:#888;" id="progress-text">0%</div>
    `;
    document.body.appendChild(div);
}

// Инициализация проверки обновлений
function initUpdater() {
    // Если версия изменилась и не было согласия – показываем диалог
    if (checkForUpdate()) {
        // Проверяем, не было ли уже показано диалогов в этой сессии
        if (!sessionStorage.getItem('update_dialog_shown')) {
            sessionStorage.setItem('update_dialog_shown', 'true');
            showUpdateDialog();
        }
    } else {
        // Версия совпадает – просто сохраняем (на случай, если пользователь обновился вручную)
        saveVersion(getAppVersion());
    }
}

// Экспортируем
window.getAppVersion = getAppVersion;
window.checkForUpdate = checkForUpdate;
window.initUpdater = initUpdater;