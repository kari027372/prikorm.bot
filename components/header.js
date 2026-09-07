// components/header.js – KENORA 2.0 (SVG вместо эмодзи, сохранена структура)
(function() {
  'use strict';

  window.renderHeader = function(title, backScreen, rightIcon, rightAction) {
    let backButton = backScreen ?
      `<button class="icon-button" data-action="navigate" data-screen="${backScreen}">
        <svg viewBox="0 0 24 24" width="24" height="24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>` :
      '';

    let rightButton = rightIcon ?
      `<button class="icon-button" data-action="${rightAction || 'navigate'}" data-screen="${rightAction || ''}">
        ${rightIcon}
      </button>` :
      '';

    return `
      <div class="page-header">
        <div class="header-left">${backButton}</div>
        <h1 class="header-title">${title || 'Прикорм'}</h1>
        <div class="header-right">${rightButton}</div>
      </div>
    `;
  };

  console.log('✅ header.js загружен');
})();