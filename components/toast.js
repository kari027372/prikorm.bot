// components/toast.js
(function() {
    'use strict';

    let container = document.getElementById('toast-root');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-root';
        document.body.appendChild(container);
    }

    window.showToast = function(message, type = 'info', duration = 3000) {
        if (!message) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('visible'));

        const timeout = setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
        }, duration);

        return {
            close: function() {
                clearTimeout(timeout);
                toast.classList.remove('visible');
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
            }
        };
    };

    window.toast = {
        success: (msg, dur) => window.showToast(msg, 'success', dur),
        error: (msg, dur) => window.showToast(msg, 'error', dur),
        warning: (msg, dur) => window.showToast(msg, 'warning', dur),
        info: (msg, dur) => window.showToast(msg, 'info', dur)
    };

    console.log('✅ toast.js загружен');
})();