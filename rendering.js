// rendering.js — все функции рендеринга и модальные обработчики

// ============================================================
// МОДАЛЬНЫЕ ОБРАБОТЧИКИ (открытие/закрытие)
// ============================================================

function openModal() {
    if (profile) {
        document.getElementById('inpMother').value = profile.mother_name || '';
        document.getElementById('inpBaby').value = profile.baby_name || '';
        document.getElementById('inpBirth').value = profile.birth_date || '';
        document.getElementById('inpFeeding').value = profile.feeding_type || 'ГВ';
        document.getElementById('inpGender').value = profile.gender || 'Мальчик';
    } else {
        document.getElementById('inpMother').value = '';
        document.getElementById('inpBaby').value = '';
        document.getElementById('inpBirth').value = '';
        document.getElementById('inpFeeding').value = 'ГВ';
        document.getElementById('inpGender').value = 'Мальчик';
    }
    document.getElementById('modal').style.display = 'flex';
}

function saveProfileHandler() {
    const mother = document.getElementById('inpMother').value.trim();
    const baby = document.getElementById('inpBaby').value.trim();
    const birth = document.getElementById('inpBirth').value.trim();
    const feeding = document.getElementById('inpFeeding').value;
    const gender = document.getElementById('inpGender').value;
    if (!mother || !baby || !birth) { alert('Заполните все поля'); return; }
    const parts = birth.split('.');
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        alert('Введите дату в формате ДД.ММ.ГГГГ');
        return;
    }
    const age = calcAge(birth);
    if (!profile) profile = {};
    profile.mother_name = mother;
    profile.baby_name = baby;
    profile.birth_date = birth;
    profile.feeding_type = feeding;
    profile.gender = gender;
    profile.age_months = age.months;
    profile.age_days = age.days;
    profile.prematurity = profile.prematurity || 'Доношенный';
    profile.feeding_strategy = profile.feeding_strategy || 'Комбинированный';
    profile.introduced_foods = profile.introduced_foods || [];
    profile.excluded_foods = profile.excluded_foods || [];
    profile.allergies = profile.allergies || [];
    profile.food_history = profile.food_history || [];
    profile.prikorm_started = profile.prikorm_started || false;
    profile.prikorm_start_date = profile.prikorm_start_date || '';
    profile.active_product = profile.active_product || null;
    profile.observation_start = profile.observation_start || null;
    profile.observation_days = profile.observation_days || 2;
    profile.loved_foods = profile.loved_foods || [];
    profile.disliked_foods = profile.disliked_foods || [];
    profile.readiness_score = profile.readiness_score || 0;
    profile.readiness_passed = profile.readiness_passed || false;
    profile.water_log = profile.water_log || [];
    profile.notes = profile.notes || [];
    saveProfile();
    document.getElementById('modal').style.display = 'none';
    render();
}

function openReadinessModal() {
    document.querySelectorAll('.readiness-question').forEach(q => {
        q.dataset.answer = '';
        q.querySelectorAll('.readiness-answer').forEach(b => b.classList.remove('active'));
    });
    document.getElementById('readinessResult').style.display = 'none';
    document.getElementById('readinessSubmit').style.display = 'none';
    document.getElementById('readinessModal').style.display = 'flex';
}

function openDiaryModal() {
    document.getElementById('diaryProduct').value = '';
    document.getElementById('diaryDate').value = new Date().toLocaleDateString('ru-RU');
    document.getElementById('diaryReaction').value = 'Всё хорошо';
    document.getElementById('diaryNotes').value = '';
    document.getElementById('diaryModal').style.display = 'flex';
}

function saveDiaryHandler() {
    const product = document.getElementById('diaryProduct').value.trim();
    const date = document.getElementById('diaryDate').value.trim();
    const reaction = document.getElementById('diaryReaction').value;
    const notes = document.getElementById('diaryNotes').value.trim();
    if (!product || !date) { alert('Заполните продукт и дату'); return; }
    if (!profile) return;
    if (!profile.food_history) profile.food_history = [];
    profile.food_history.push({ product, date, reaction, notes });
    if (!profile.introduced_foods.includes(product)) {
        profile.introduced_foods.push(product);
        profile.active_product = product;
        const info = PRODUCTS.find(p => p.name === product);
        profile.observation_days = (info && info.allergen) ? 3 : 2;
        profile.observation_start = date;
    }
    saveProfile();
    document.getElementById('diaryModal').style.display = 'none';
    render();
}

function openActionSheet() {
    document.getElementById('actionSheet').style.display = 'flex';
}

function openFeedingModal() {
    document.getElementById('feedingProduct').value = '';
    document.getElementById('feedingDate').value = new Date().toLocaleDateString('ru-RU');
    document.getElementById('feedingReaction').value = 'Всё хорошо';
    document.getElementById('feedingNotes').value = '';
    document.querySelectorAll('.prep-method').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-option').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.source-option').forEach(b => b.classList.remove('active'));
    document.getElementById('storeFields').style.display = 'none';
    renderRecentProducts();
    document.getElementById('feedingModal').style.display = 'flex';
}

function saveFeedingHandler() {
    const product = document.getElementById('feedingProduct').value.trim();
    const date = document.getElementById('feedingDate').value.trim();
    const reaction = document.getElementById('feedingReaction').value;
    const notes = document.getElementById('feedingNotes').value.trim();
    if (!product || !date) { alert('Заполните продукт и дату'); return; }
    if (!profile) return;

    const prepMethod = document.querySelector('.prep-method.active')?.dataset.method || 'Не указано';
    const form = document.querySelector('.form-option.active')?.dataset.form || 'Не указано';
    const amount = document.querySelector('.amount-option.active')?.dataset.amount || 'Не указано';
    const source = document.querySelector('.source-option.active')?.dataset.source || 'home';
    const storeBrand = document.getElementById('storeBrand').value.trim();
    const storeName = document.getElementById('storeName').value.trim();

    if (!profile.food_history) profile.food_history = [];
    profile.food_history.push({
        product, date, reaction, notes,
        prepMethod, form, amount, source,
        storeBrand: source === 'store' ? storeBrand : '',
        storeName: source === 'store' ? storeName : '',
        timestamp: new Date().toISOString()
    });

    if (!profile.introduced_foods.includes(product)) {
        profile.introduced_foods.push(product);
        profile.active_product = product;
        const info = PRODUCTS.find(p => p.name === product);
        profile.observation_days = (info && info.allergen) ? 3 : 2;
        profile.observation_start = date;
    }

    saveProfile();
    document.getElementById('feedingModal').style.display = 'none';
    render();
}

// ============================================================
// РЕНДЕРИНГ ЭКРАНОВ
// ============================================================

function render() {
    if (!profile || !profile.baby_name) {
        document.getElementById('screen-onboarding').classList.add('active');
        document.getElementById('screens-container').style.display = 'none';
        document.getElementById('bottomNav').style.display = 'none';
        return;
    }
    document.getElementById('screen-onboarding').classList.remove('active');
    document.getElementById('screens-container').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';

    const age = calcAge(profile.birth_date);
    profile.age_months = age.months;
    profile.age_days = age.days;
    saveProfile();

    const feeding = profile.feeding_type || 'ГВ';
    const prikormDays = getPrikormDays(profile);
    const stage = getStage(prikormDays);
    const texture = getTextureStage(age.months, prikormDays);

    document.getElementById('greeting').textContent = `👋 ${profile.mother_name || 'мама'}`;

    document.getElementById('motherName').textContent = profile.mother_name || 'мама';
    document.getElementById('babyInfo').textContent = `👶 ${profile.baby_name} — ${age.months} мес. ${age.days} дн. (${feeding})`;
    document.getElementById('stageInfo').innerHTML = `📌 Этап: <span class="stage-badge">${stage}</span>`;

    // Активный продукт
    const activeContent = document.getElementById('activeContent');
    const activeStatus = activeProductStatus(profile);
    if (activeStatus) {
        const { product, passed, left, finished } = activeStatus;
        const days = profile.observation_days || 2;
        const progress = Math.min(100, (passed / days) * 100);
        activeContent.innerHTML = `
            <div><strong>${product}</strong></div>
            <div style="font-size:14px; color:#7a6e66;">День ${passed + 1} из ${days}</div>
            <div class="progress-bar"><div class="fill" style="width:${progress}%;"></div></div>
            ${finished ? '<div style="font-size:13px; color:#2d7a5a;">✅ Наблюдение завершено</div>' : `<div style="font-size:13px; color:#b0a69e;">Осталось ${left} дн.</div>`}
        `;
    } else {
        activeContent.innerHTML = `<span class="sub">Нет активного продукта</span>`;
    }

    // Рекомендация
    const recContent = document.getElementById('recommendContent');
    const nextProduct = getNextProduct(profile, PRODUCTS);
    if (nextProduct) {
        const tags = [];
        if (nextProduct.iron) tags.push('🩸 железо');
        if (nextProduct.allergen) tags.push('⚠️ аллерген');
        if (nextProduct.choking) tags.push('🚫 риск удушья');
        const textureLabel = nextProduct.texture[age.months >= 10 ? 10 : age.months >= 8 ? 8 : 6] || 'пюре';
        recContent.innerHTML = `
            <div><strong>${nextProduct.name}</strong> ${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</div>
            <div style="font-size:14px; color:#7a6e66; margin-top:4px;">${nextProduct.desc || ''}</div>
            <div style="font-size:13px; color:#b0a69e;">Текстура: ${textureLabel}</div>
        `;
    } else {
        recContent.innerHTML = `<span class="sub">🌸 Все подходящие продукты уже введены!</span>`;
    }

    // План на сегодня
    const planEl = document.getElementById('todayPlan');
    const dailyPlan = generateDailyPlan(profile, PRODUCTS);
    if (dailyPlan.length > 0) {
        planEl.innerHTML = `
            <div style="font-size:14px; color:#7a6e66; margin-bottom:6px;">🍼 ${feeding} — основное питание</div>
            ${dailyPlan.map(meal => `
                <div class="plan-item">
                    <span class="time">${meal.time}</span>
                    <span class="food">${meal.foods.join(' + ')} ${meal.isNew ? '<span class="new-badge">🆕</span>' : ''}</span>
                    <span class="desc">${meal.description}</span>
                </div>
            `).join('')}
            <div style="margin-top:8px;font-size:13px;color:#b0a69e;">💧 Предлагайте воду из чашки во время еды.</div>
        `;
    } else {
        planEl.innerHTML = `<span class="sub">План формируется...</span>`;
    }

    // Текстура
    document.getElementById('textureContent').innerHTML = `
        <div style="font-size:14px; color:#7a6e66;">Сейчас: <strong>${texture}</strong></div>
        <div style="font-size:13px; color:#b0a69e; margin-top:4px;">Переход к более сложной текстуре по мере роста навыков.</div>
    `;

    // Полный план
    const planFull = document.getElementById('planContent');
    const stageDesc = STAGE_TIPS[stage] || '';
    const nextProducts = getAvailableProducts(profile, PRODUCTS).slice(0, 5);
    planFull.innerHTML = `
        <div style="font-size:14px; color:#7a6e66;">Этап: <strong>${stage}</strong></div>
        <div style="font-size:14px; margin:8px 0;">${stageDesc}</div>
        <div style="font-size:13px; color:#b0a69e;">🍼 ${feeding} — продолжает быть важным источником питания.</div>
        ${nextProducts.length > 0 ? `
            <div style="margin-top:8px; font-weight:500;">Следующие продукты для введения:</div>
            ${nextProducts.map(p => `<div class="plan-item"><span class="food">${p.name}</span><span class="desc">${p.texture[age.months >= 10 ? 10 : age.months >= 8 ? 8 : 6] || 'пюре'}</span></div>`).join('')}
        ` : '<div class="sub">Все продукты введены.</div>'}
        <div style="margin-top:8px;font-size:13px;color:#b0a69e;">💧 Вода предлагается во время еды.</div>
    `;

    renderProducts();
    renderDiary();
    renderRecipes();
    renderProfile();
    renderWeek();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    const age = profile.age_months || 0;
    const search = document.getElementById('productSearch').value.toLowerCase().trim();
    const category = document.getElementById('categoryFilter').value;

    let products = PRODUCTS.filter(p => p.min_age <= age && p.min_age < 999);
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search));
    if (category !== 'all') products = products.filter(p => p.cat === category);

    if (products.length === 0) {
        grid.innerHTML = '<span class="sub" style="grid-column:1/-1;">Нет продуктов для этого возраста</span>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const status = getProductStatus(profile, p.name);
        const tags = [];
        if (p.iron) tags.push('🩸');
        if (p.allergen) tags.push('⚠️');
        if (p.choking) tags.push('🚫');
        const statusLabels = {
            'introduced': '✅ введён',
            'loved': '❤️ любит',
            'disliked': '😐 не нравится',
            'excluded': '🚫 исключён',
            'allergy': '⚠️ аллергия',
            'new': 'рекомендуется'
        };
        const textureLabel = p.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || '—';
        const isIntroduced = profile.introduced_foods && profile.introduced_foods.includes(p.name);
        const isLoved = profile.loved_foods && profile.loved_foods.includes(p.name);
        const isDisliked = profile.disliked_foods && profile.disliked_foods.includes(p.name);
        const isExcluded = profile.excluded_foods && profile.excluded_foods.includes(p.name);
        const isAllergy = profile.allergies && profile.allergies.includes(p.name);

        let buttons = '';
        if (!isIntroduced && !isExcluded && !isAllergy) {
            buttons = `<button class="btn btn-sm btn-outline introduce-btn" data-product="${p.name}">➕ Ввести</button>`;
        }
        if (isIntroduced && !isLoved && !isDisliked) {
            buttons = `
                <button class="btn btn-sm btn-outline love-btn" data-product="${p.name}">❤️ Любит</button>
                <button class="btn btn-sm btn-outline dislike-btn" data-product="${p.name}">😐 Не нравится</button>
            `;
        }
        if (isIntroduced && (isLoved || isDisliked)) {
            buttons = `<span class="tag">${isLoved ? '❤️ любит' : '😐 не нравится'}</span>`;
        }
        if (isExcluded) {
            buttons = `<span class="tag tag-status">🚫 исключён</span>`;
        }
        if (isAllergy) {
            buttons = `<span class="tag tag-allergen">⚠️ аллергия</span>`;
        }

        return `
            <div class="product-card" data-product="${p.name}">
                <div class="name" style="cursor:pointer;">${p.name}</div>
                <div class="meta">
                    ${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}
                    <span class="tag tag-status">${statusLabels[status] || status}</span>
                </div>
                <div style="font-size:12px; color:#b0a69e; margin-top:4px;">${textureLabel}</div>
                <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
                    ${buttons}
                    ${!isExcluded && !isAllergy && isIntroduced ? `<button class="btn btn-sm btn-outline exclude-btn" data-product="${p.name}">🚫 Исключить</button>` : ''}
                    <button class="btn btn-sm btn-outline detail-btn" data-product="${p.name}">📖 Подробнее</button>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.introduce-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.introduced_foods) profile.introduced_foods = [];
            if (!profile.introduced_foods.includes(product)) {
                profile.introduced_foods.push(product);
                profile.active_product = product;
                const info = PRODUCTS.find(p => p.name === product);
                profile.observation_days = (info && info.allergen) ? 3 : 2;
                profile.observation_start = new Date().toLocaleDateString('ru-RU');
                if (!profile.food_history) profile.food_history = [];
                profile.food_history.push({
                    product: product,
                    date: new Date().toLocaleDateString('ru-RU'),
                    reaction: 'Всё хорошо',
                    notes: 'Введён через список продуктов'
                });
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.love-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.loved_foods) profile.loved_foods = [];
            if (!profile.loved_foods.includes(product)) {
                profile.loved_foods.push(product);
                if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                    profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
                }
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.dislike-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.disliked_foods) profile.disliked_foods = [];
            if (!profile.disliked_foods.includes(product)) {
                profile.disliked_foods.push(product);
                if (profile.loved_foods && profile.loved_foods.includes(product)) {
                    profile.loved_foods = profile.loved_foods.filter(p => p !== product);
                }
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.exclude-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (confirm(`Исключить ${product} из рациона?`)) {
                if (!profile.excluded_foods) profile.excluded_foods = [];
                if (!profile.excluded_foods.includes(product)) {
                    profile.excluded_foods.push(product);
                    if (profile.introduced_foods && profile.introduced_foods.includes(product)) {
                        profile.introduced_foods = profile.introduced_foods.filter(p => p !== product);
                    }
                    if (profile.loved_foods && profile.loved_foods.includes(product)) {
                        profile.loved_foods = profile.loved_foods.filter(p => p !== product);
                    }
                    if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                        profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
                    }
                    saveProfile();
                    render();
                }
            }
        });
    });

    grid.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.dataset.product;
            showProductCard(productName);
        });
    });
    grid.querySelectorAll('.product-card .name').forEach(el => {
        el.addEventListener('click', function() {
            const productName = this.closest('.product-card').dataset.product;
            showProductCard(productName);
        });
    });
}

function showProductCard(productName) {
    const product = PRODUCTS.find(p => p.name === productName);
    if (!product) return;
    const container = document.getElementById('productCardContent');
    const status = getProductStatus(profile, productName);
    const statusEmoji = {
        'introduced': '✅ Знаком',
        'loved': '❤️ Любит',
        'disliked': '😐 Не нравится',
        'excluded': '🚫 Исключён',
        'allergy': '⚠️ Аллергия',
        'new': '🟡 Новый'
    };
    const tags = [];
    if (product.iron) tags.push('🩸 Источник железа');
    if (product.allergen) tags.push('⚠️ Аллерген');
    if (product.choking) tags.push('🚫 Риск удушья');
    const textureLabel = product.texture[profile.age_months >= 10 ? 10 : profile.age_months >= 8 ? 8 : 6] || 'пюре';

    container.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:48px;">🥦</div>
            <h2 style="font-size:22px; margin:4px 0;">${product.name}</h2>
            <div style="font-size:16px; color:#7a6e66;">${statusEmoji[status] || 'Не пробовали'}</div>
        </div>
        <div style="margin:12px 0;">
            ${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}
        </div>
        <div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>Категория:</strong> ${product.cat}</div>
        <div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>Минимальный возраст:</strong> ${product.min_age}+ мес.</div>
        <div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>Текстура:</strong> ${textureLabel}</div>
        <div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>Описание:</strong> ${product.desc || '—'}</div>
        ${product.texture[6] ? `<div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>6 мес:</strong> ${product.texture[6]}</div>` : ''}
        ${product.texture[8] ? `<div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>8 мес:</strong> ${product.texture[8]}</div>` : ''}
        ${product.texture[10] ? `<div style="font-size:14px; color:#555; margin-bottom:6px;"><strong>10 мес:</strong> ${product.texture[10]}</div>` : ''}
        ${getSafetyWarning(productName) ? `<div style="margin-top:8px; padding:8px; background:#fff3e0; border-radius:8px; font-size:14px;"><strong>⚠️ Безопасность:</strong> ${getSafetyWarning(productName)}</div>` : ''}
        <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:6px;">
            <button class="btn btn-sm btn-outline" id="productCardIntroduce" data-product="${productName}">➕ Ввести</button>
            <button class="btn btn-sm btn-outline" id="productCardLove" data-product="${productName}">❤️ Любит</button>
            <button class="btn btn-sm btn-outline" id="productCardDislike" data-product="${productName}">😐 Не нравится</button>
            <button class="btn btn-sm btn-outline" id="productCardExclude" data-product="${productName}">🚫 Исключить</button>
        </div>
    `;
    document.getElementById('productCardModal').style.display = 'flex';

    document.getElementById('productCardIntroduce')?.addEventListener('click', function() {
        const product = this.dataset.product;
        if (!profile.introduced_foods) profile.introduced_foods = [];
        if (!profile.introduced_foods.includes(product)) {
            profile.introduced_foods.push(product);
            profile.active_product = product;
            const info = PRODUCTS.find(p => p.name === product);
            profile.observation_days = (info && info.allergen) ? 3 : 2;
            profile.observation_start = new Date().toLocaleDateString('ru-RU');
            if (!profile.food_history) profile.food_history = [];
            profile.food_history.push({ product, date: new Date().toLocaleDateString('ru-RU'), reaction: 'Всё хорошо', notes: '' });
            saveProfile();
            document.getElementById('productCardModal').style.display = 'none';
            render();
        } else {
            alert('Продукт уже введён.');
        }
    });
    document.getElementById('productCardLove')?.addEventListener('click', function() {
        const product = this.dataset.product;
        if (!profile.loved_foods) profile.loved_foods = [];
        if (!profile.loved_foods.includes(product)) {
            profile.loved_foods.push(product);
            if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
            }
            saveProfile();
            document.getElementById('productCardModal').style.display = 'none';
            render();
        }
    });
    document.getElementById('productCardDislike')?.addEventListener('click', function() {
        const product = this.dataset.product;
        if (!profile.disliked_foods) profile.disliked_foods = [];
        if (!profile.disliked_foods.includes(product)) {
            profile.disliked_foods.push(product);
            if (profile.loved_foods && profile.loved_foods.includes(product)) {
                profile.loved_foods = profile.loved_foods.filter(p => p !== product);
            }
            saveProfile();
            document.getElementById('productCardModal').style.display = 'none';
            render();
        }
    });
    document.getElementById('productCardExclude')?.addEventListener('click', function() {
        const product = this.dataset.product;
        if (confirm(`Исключить ${product} из рациона?`)) {
            if (!profile.excluded_foods) profile.excluded_foods = [];
            if (!profile.excluded_foods.includes(product)) {
                profile.excluded_foods.push(product);
                if (profile.introduced_foods && profile.introduced_foods.includes(product)) {
                    profile.introduced_foods = profile.introduced_foods.filter(p => p !== product);
                }
                if (profile.loved_foods && profile.loved_foods.includes(product)) {
                    profile.loved_foods = profile.loved_foods.filter(p => p !== product);
                }
                if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                    profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
                }
                saveProfile();
                document.getElementById('productCardModal').style.display = 'none';
                render();
            }
        }
    });
}

function renderDiary() {
    const list = document.getElementById('diaryList');
    const history = profile.food_history || [];
    if (history.length === 0) {
        list.innerHTML = '<span class="sub">Пока нет записей</span>';
        return;
    }
    list.innerHTML = history.slice().reverse().map(item => `
        <div class="diary-item">
            <div class="top"><span class="product">${item.product}</span><span class="date">${item.date}</span></div>
            <div class="reaction">${item.reaction || 'Реакция не указана'} ${item.notes ? '📝 ' + item.notes : ''}</div>
        </div>
    `).join('');
}

function renderRecipes() {
    const grid = document.getElementById('recipeGrid');
    const age = profile.age_months || 0;
    const search = document.getElementById('recipeSearch').value.toLowerCase().trim();
    const filter = document.getElementById('recipeAgeFilter').value;

    let recipes = RECIPES.filter(r => r.age <= age);
    if (search) recipes = recipes.filter(r => r.name.toLowerCase().includes(search));
    if (filter !== 'all') recipes = recipes.filter(r => r.age >= parseInt(filter));

    if (recipes.length === 0) {
        grid.innerHTML = '<span class="sub" style="grid-column:1/-1;">Нет рецептов для этого возраста</span>';
        return;
    }

    grid.innerHTML = recipes.map(r => `
        <div class="recipe-card">
            <div class="name">${r.name}</div>
            <div class="meta">Возраст: ${r.age}+ мес | ${r.texture} | ${r.approach.join(', ')}</div>
            <div class="prep"><strong>Ингредиенты:</strong> ${r.ingredients.join(', ')}</div>
            <div class="prep"><strong>Приготовление:</strong> ${r.prep}</div>
            ${r.storage ? `<div class="prep"><strong>Хранение:</strong> ${r.storage}</div>` : ''}
            ${r.allergens && r.allergens.length ? `<div class="prep"><strong>⚠️ Аллергены:</strong> ${r.allergens.join(', ')}</div>` : ''}
            ${r.iron ? '<div class="prep">🩸 Источник железа</div>' : ''}
        </div>
    `).join('');
}

function renderProfile() {
    document.getElementById('profileName').textContent = profile.baby_name || '—';
    const age = calcAge(profile.birth_date);
    document.getElementById('profileAge').textContent = `${age.months} мес. ${age.days} дн.`;
    const readinessText = profile.readiness_passed ? `✅ Пройден (${profile.readiness_score}/5)` : '❌ Не пройден';
    const fields = [
        ['Мама', profile.mother_name || '—'],
        ['Дата рождения', profile.birth_date || '—'],
        ['Пол', profile.gender || '—'],
        ['Вес', profile.current_weight ? profile.current_weight + ' г' : '—'],
        ['Рост', profile.current_length ? profile.current_length + ' см' : '—'],
        ['Тип вскармливания', profile.feeding_type || '—'],
        ['Недоношенность', profile.prematurity || 'Доношенный'],
        ['Прикорм начат', profile.prikorm_started ? `Да (с ${profile.prikorm_start_date || '—'})` : 'Нет'],
        ['Стратегия', profile.feeding_strategy || 'Комбинированный'],
        ['Введено продуктов', (profile.introduced_foods || []).length],
        ['Аллергий', (profile.allergies || []).length],
        ['Готовность', readinessText]
    ];
    document.getElementById('profileFields').innerHTML = fields.map(([label, value]) => `
        <div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>
    `).join('');
    // Если есть функция рендеринга тем, вызываем
    if (typeof renderThemeButtons === 'function') {
        renderThemeButtons('profileFields');
    }
}

// ============================================================
// ПЛАН (НЕДЕЛЯ)
// ============================================================

let weekOffset = 0;

function renderWeek() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setDate(today.getDate() + weekOffset * 7);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    document.getElementById('weekLabel').textContent = `Неделя ${startOfWeek.toLocaleDateString('ru-RU')} — ${new Date(startOfWeek.getTime() + 6*24*60*60*1000).toLocaleDateString('ru-RU')}`;

    const daysContainer = document.getElementById('weekDays');
    daysContainer.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayStr = day.toLocaleDateString('ru-RU');
        const isToday = day.toDateString() === new Date().toDateString();
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-outline ${isToday ? 'active' : ''}`;
        btn.textContent = `${day.getDate()} ${day.toLocaleString('ru', {weekday:'short'})}`;
        btn.dataset.date = dayStr;
        btn.addEventListener('click', function() {
            renderDailyPlan(dayStr);
            document.querySelectorAll('#weekDays .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        daysContainer.appendChild(btn);
    }
    const todayStr = new Date().toLocaleDateString('ru-RU');
    renderDailyPlan(todayStr);
}

function renderDailyPlan(dateStr) {
    const container = document.getElementById('dailyPlanContent');
    const plan = generateDailyPlan(profile, PRODUCTS);
    if (!plan || plan.length === 0) {
        container.innerHTML = '<span class="sub">На сегодня плана нет. Добавьте кормления!</span>';
        return;
    }
    container.innerHTML = `
        <div style="font-size:14px; font-weight:500; margin-bottom:8px;">${dateStr}</div>
        ${plan.map(meal => `
            <div class="plan-item">
                <span class="time">${meal.time}</span>
                <span class="food">${meal.foods.join(' + ')} ${meal.isNew ? '<span class="new-badge">🆕</span>' : ''}</span>
                <span class="desc">${meal.description}</span>
                <button class="btn btn-sm btn-outline mark-done" data-meal="${meal.time}">✅</button>
            </div>
        `).join('')}
    `;
    container.querySelectorAll('.mark-done').forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = '✅';
            this.disabled = true;
            this.style.opacity = 0.5;
        });
    });
}

// ============================================================
// ДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ НЕДАВНИХ ПРОДУКТОВ В МОДАЛКЕ КОРМЛЕНИЯ
// ============================================================

function renderRecentProducts() {
    const recentContainer = document.getElementById('recentProducts');
    const introduced = profile?.introduced_foods || [];
    const recent = introduced.slice(-5).reverse();
    if (recent.length === 0) {
        recentContainer.innerHTML = '<span style="font-size:13px; color:#b0a69e;">Недавних продуктов нет</span>';
        return;
    }
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