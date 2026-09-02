// components/modal.js
(function() {
    'use strict';

    window.showModal = function(title, content, onClose) {
        const oldModal = document.querySelector('.modal-overlay');
        if (oldModal) oldModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal-sheet">
                <h3>${title || 'Информация'}</h3>
                <div class="modal-body">${content || ''}</div>
                <button class="primary-button" data-action="closeModal">Закрыть</button>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.classList.add('modal-open');

        const closeModal = function(e) {
            if (e.target === overlay || e.target.closest('[data-action="closeModal"]')) {
                overlay.remove();
                document.body.classList.remove('modal-open');
                if (typeof onClose === 'function') onClose();
            }
        };
        overlay.addEventListener('click', closeModal);
        return overlay;
    };

    window.modal = { show: window.showModal };

    console.log('✅ modal.js загружен');
})();