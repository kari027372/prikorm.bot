// components/header.js
(function() {
    'use strict';

    window.renderHeader = function(title, backScreen, rightIcon, rightAction) {
        let backButton = backScreen ? `<button class="icon-button" data-action="navigate" data-screen="${backScreen}">‹</button>` : '';
        let rightButton = rightIcon ? `<button class="icon-button" data-action="${rightAction || 'navigate'}" data-screen="${rightAction || ''}">${rightIcon}</button>` : '';
        return `
            <div class="page-header">
                ${backButton}
                <h1>${title || 'Прикорм'}</h1>
                ${rightButton}
            </div>
        `;
    };

    console.log('✅ header.js загружен');
})();