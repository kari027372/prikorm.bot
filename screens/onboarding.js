function finishOnboarding() {
    // Собираем данные
    const childData = {
        name: tempData.name || '',
        birthDate: tempData.birthDate || '',
        sex: tempData.sex || '',
        feedingType: tempData.feedingType || '',
        feedingStarted: (tempData.feedingStarted === 'Да'),
        feedingStartDate: tempData.feedingStartDate || '',
        approach: tempData.approach || 'mixed',
        readiness: STATE.onboarding.readiness || {},
        notes: '',
        photo: ''
    };

    // Добавляем ребёнка через новую функцию
    if (typeof window.addChild === 'function') {
        window.addChild(childData);
    } else {
        // fallback (для старых версий)
        STATE.children = STATE.children || [];
        STATE.children.push({ id: 'child_' + Date.now(), ...childData });
        STATE.currentChildId = STATE.children[0].id;
    }

    STATE.onboardingCompleted = true;
    if (typeof window.saveState === 'function') window.saveState();
    if (typeof window.render === 'function') window.render('home');
}