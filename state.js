// state.js — управление профилем
const STORAGE_KEY = 'prikorm_app_v3';
let profile = null;

function loadProfile() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) profile = JSON.parse(raw);
        else profile = null;
    } catch (e) { profile = null; }
}
function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
function resetProfile() {
    localStorage.removeItem(STORAGE_KEY);
    profile = null;
    location.reload();
}

function migrateData() {
    const oldKey = 'prikorm_app_v2';
    const newKey = 'prikorm_app_v3';
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    if (oldData && !newData) {
        try {
            const parsed = JSON.parse(oldData);
            if (!parsed.loved_foods) parsed.loved_foods = [];
            if (!parsed.disliked_foods) parsed.disliked_foods = [];
            if (!parsed.readiness_score) parsed.readiness_score = 0;
            if (!parsed.readiness_passed) parsed.readiness_passed = false;
            if (!parsed.water_log) parsed.water_log = [];
            if (!parsed.notes) parsed.notes = [];
            localStorage.setItem(newKey, JSON.stringify(parsed));
            console.log('✅ Данные перенесены из старой версии');
        } catch (e) {
            console.log('❌ Ошибка миграции:', e);
        }
    }
}