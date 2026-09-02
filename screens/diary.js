// screens/diary.js — экран "Дневник" (рендеринг)
function renderDiary() {
    const diary = [...getDiary()].sort((a, b) => ((b.date || '') + (b.time || '')).localeCompare((a.date || '') + (a.time || '')));
    const stats = getDiaryStats();

    return `
    <div class="screen">
        <div class="page-header"><h1>Дневник</h1><button class="icon-button" data-action="add-diary">➕</button></div>
        <div style="display:flex;gap:16px;background:var(--bg-card);padding:14px;border-radius:var(--radius);margin-bottom:16px;border:1px solid var(--border-color)">
            <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.totalEntries}</div><div style="font-size:12px;color:var(--text-muted)">записей</div></div>
            <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.uniqueProducts}</div><div style="font-size:12px;color:var(--text-muted)">продуктов</div></div>
        </div>
        ${diary.length ? diary.map(e => `
            <div class="diary-entry">
                <div class="diary-entry-icon">${e.source === 'store' ? '🛒' : '🥣'}</div>
                <div class="diary-entry-content">
                    <div class="diary-entry-header"><strong>${e.productName || 'Продукт'}</strong><span>${e.time || ''}</span></div>
                    <div class="diary-entry-meta">${e.amount ? e.amount + ' г' : ''} ${e.preparation || ''} ${e.liked === true ? '❤️' : e.liked === false ? '🤍' : ''}</div>
                </div>
                <button class="icon-button" data-action="edit-diary" data-entry-id="${e.id}">⋯</button>
            </div>
        `).join('') : `
            <div class="empty-state"><div class="empty-icon">📖</div><h3>Дневник пуст</h3><p>Добавьте первый приём пищи.</p></div>
        `}
    </div>`;
}

window.renderDiary = renderDiary;