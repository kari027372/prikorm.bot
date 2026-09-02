/* ============================================================
   updater.js
   Управление обновлениями приложения
   ============================================================ */

const VERSION_STORAGE_KEY = 'prikorm_app_version';

function getAppVersion() {
    return APP_CONFIG.app.version;
}

function getSavedVersion() {
    return localStorage.getItem(VERSION_STORAGE_KEY) || '0.0.0';
}

function saveVersion(version) {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
}

function checkForUpdate() {
    const current = getAppVersion();
    const saved = getSavedVersion();
    return current !== saved;
}

function showUpdateDialog() {
    const current = getAppVersion();
    const saved = getSavedVersion();

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

    document.getElementById('update-now').addEventListener('click', function() {
        overlay.remove();
        performUpdate();
    });

    document.getElementById('update-later').addEventListener('click', function() {
        saveVersion(getAppVersion());
        overlay.remove();
    });
}

function performUpdate() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) {
        createProgressScreen();
    } else {
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

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress > 100) progress = 100;

        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = Math.round(progress) + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                saveVersion(getAppVersion());
                location.reload(true);
            }, 500);
        }
    }, 200);
}

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

function initUpdater() {
    if (checkForUpdate()) {
        if (!sessionStorage.getItem('update_dialog_shown')) {
            sessionStorage.setItem('update_dialog_shown', 'true');
            showUpdateDialog();
        }
    } else {
        saveVersion(getAppVersion());
    }
}

window.getAppVersion = getAppVersion;
window.checkForUpdate = checkForUpdate;
window.initUpdater = initUpdater;