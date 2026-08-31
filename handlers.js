// handlers.js — все обработчики событий
function setupEventListeners() {
    document.getElementById('startBtn')?.addEventListener('click', openModal);
    document.getElementById('editProfileBtn')?.addEventListener('click', openModal);
    document.getElementById('saveBtn')?.addEventListener('click', saveProfileHandler);

    // Закрытие модалок
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    });
    document.getElementById('closeProductCard')?.addEventListener('click', function() {
        document.getElementById('productCardModal').style.display = 'none';
    });

    // Дневник
    document.getElementById('addDiaryBtn')?.addEventListener('click', openDiaryModal);
    document.getElementById('saveDiaryBtn')?.addEventListener('click', saveDiaryHandler);

    // Сброс
    document.getElementById('resetData')?.addEventListener('click', function() {
        if (confirm('Удалить все данные?')) resetProfile();
    });

    // Навигация
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
            const target = document.getElementById('screen-' + tabName);
            if (target) target.classList.add('active');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            render();
        });
    });

    // Фильтры и поиск
    document.getElementById('categoryFilter')?.addEventListener('change', render);
    document.getElementById('productSearch')?.addEventListener('input', render);
    document.getElementById('recipeAgeFilter')?.addEventListener('change', renderRecipes);
    document.getElementById('recipeSearch')?.addEventListener('input', renderRecipes);

    // Опросник готовности
    document.getElementById('readinessBtn')?.addEventListener('click', openReadinessModal);
    document.getElementById('readinessBtnProfile')?.addEventListener('click', openReadinessModal);

    document.querySelectorAll('.readiness-answer').forEach(btn => {
        btn.addEventListener('click', function() {
            const q = this.closest('.readiness-question');
            q.dataset.answer = this.dataset.answer;
            q.querySelectorAll('.readiness-answer').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const allQuestions = document.querySelectorAll('.readiness-question');
            let allAnswered = true;
            allQuestions.forEach(q => { if (!q.dataset.answer) allAnswered = false; });
            if (allAnswered) document.getElementById('readinessSubmit').style.display = 'block';
        });
    });

    document.getElementById('readinessSubmit')?.addEventListener('click', function() {
        const questions = document.querySelectorAll('.readiness-question');
        let score = 0;
        questions.forEach(q => { if (q.dataset.answer === 'yes') score++; });
        if (!profile) profile = {};
        profile.readiness_score = score;
        profile.readiness_passed = score >= 4;
        profile.readiness_date = new Date().toLocaleDateString('ru-RU');
        saveProfile();
        const resultDiv = document.getElementById('readinessResult');
        resultDiv.style.display = 'block';
        const verdict = score >= 4 ? '🟢 Готовность высокая! Можно начинать прикорм.' : '🟡 Признаков пока недостаточно. Попробуйте позже.';
        resultDiv.innerHTML = `<div class="card"><p><strong>Результат: ${score}/5</strong></p><p>${verdict}</p></div>`;
        document.getElementById('readinessSubmit').style.display = 'none';
        setTimeout(() => { document.getElementById('readinessModal').style.display = 'none'; render(); }, 2000);
    });

    // Action Sheet
    document.getElementById('addActionBtn')?.addEventListener('click', openActionSheet);
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            document.getElementById('actionSheet').style.display = 'none';
            if (action === 'feeding') openFeedingModal();
            else if (action === 'water') {
                if (!profile) return;
                if (!profile.water_log) profile.water_log = [];
                profile.water_log.push({ date: new Date().toLocaleDateString('ru-RU'), type: 'предложила' });
                saveProfile();
                render();
                alert('💧 Запись о воде добавлена.');
            } else if (action === 'note') {
                const note = prompt('📝 Введите заметку:');
                if (note && profile) {
                    if (!profile.notes) profile.notes = [];
                    profile.notes.push({ date: new Date().toLocaleDateString('ru-RU'), text: note });
                    saveProfile();
                    render();
                }
            } else {
                alert('Функция будет добавлена позже.');
            }
        });
    });
    document.getElementById('closeActionSheet')?.addEventListener('click', function() {
        document.getElementById('actionSheet').style.display = 'none';
    });

    // Поиск продукта в модалке кормления
    document.getElementById('feedingProduct')?.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        const recentContainer = document.getElementById('recentProducts');
        if (query.length < 2) { renderRecentProducts(); return; }
        const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(query)).slice(0, 10);
        recentContainer.innerHTML = matches.map(p => `
            <button class="btn btn-sm btn-outline product-suggestion" data-product="${p.name}">${p.name}</button>
        `).join('');
        recentContainer.querySelectorAll('.product-suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('feedingProduct').value = this.dataset.product;
                renderRecentProducts();
            });
        });
    });

    function renderRecentProducts() {
        const recentContainer = document.getElementById('recentProducts');
        const introduced = profile?.introduced_foods || [];
        const recent = introduced.slice(-5).reverse();
        if (recent.length === 0) { recentContainer.innerHTML = '<span style="font-size:13px; color:#b0a69e;">Недавних продуктов нет</span>'; return; }
        recentContainer.innerHTML = recent.map(p => `
            <button class="btn btn-sm btn-outline product-suggestion" data-product="${p}">${p}</button>
        `).join('');
        recentContainer.querySelectorAll('.product-suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('feedingProduct').value = this.dataset.product;
                renderRecentProducts();
            });
        });
    }

    // Выбор способа, формы, количества, источника
    document.querySelectorAll('.prep-method').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.prep-method').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.form-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.form-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.amount-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.source-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.source-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.source === 'store') {
                document.getElementById('storeFields').style.display = 'block';
            } else {
                document.getElementById('storeFields').style.display = 'none';
            }
        });
    });

    // Сохранение кормления
    document.getElementById('saveFeedingBtn')?.addEventListener('click', saveFeedingHandler);

    // План (неделя)
    let weekOffset = 0;
    document.getElementById('prevWeek')?.addEventListener('click', function() { weekOffset--; renderWeek(); });
    document.getElementById('nextWeek')?.addEventListener('click', function() { weekOffset++; renderWeek(); });

    // Синхронизация
    document.getElementById('syncFromBot')?.addEventListener('click', function() {
        alert('Синхронизация с ботом будет доступна позже.');
    });
}