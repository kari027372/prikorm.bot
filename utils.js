// utils.js

// Расчёт возраста в месяцах и днях
function calcAge(birthDate) {
  const now = new Date();
  const birth = new Date(birthDate);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  return { months, days };
}

// Минимальный возраст для начала прикорма по типу вскармливания
function getMinAge(feedingType) {
  return CONFIG.minAgeByFeeding[feedingType] || 6;
}

// Определение этапа по количеству дней прикорма
function getStage(days) {
  const stages = CONFIG.stages;
  let result = 'подготовка';
  for (const [key, val] of Object.entries(stages)) {
    if (days >= val.days) result = key;
  }
  return result;
}

// Получение дней прикорма из профиля
function getPrikormDays(profile) {
  if (!profile || !profile.start_date) return 0;
  const start = new Date(profile.start_date);
  const now = new Date();
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Определение текстуры по возрасту и дням
function getTextureStage(ageMonths, prikormDays) {
  if (ageMonths < 6) return 'пюре';
  if (ageMonths < 8) return 'густое пюре';
  if (ageMonths < 10) return 'мелкие кусочки';
  return 'кусочки';
}

// Список доступных продуктов (с учётом возраста и введённых)
function getAvailableProducts(profile, products) {
  const age = calcAge(profile.birth_date).months;
  return products.filter(p => p.min_age <= age);
}

// Предложение следующего продукта (первый не введённый из доступных)
function getNextProduct(profile, products) {
  const introduced = profile.introduced_products || [];
  const available = getAvailableProducts(profile, products);
  for (const p of available) {
    if (!introduced.includes(p.name)) return p;
  }
  return null;
}

// Генерация плана на день (заглушка)
function generateDailyPlan(profile, products) {
  return { breakfast: 'Кабачок', lunch: 'Гречка', dinner: 'Яблоко' };
}

// Статус продукта (введён / в процессе / не вводился)
function getProductStatus(profile, productName) {
  const introduced = profile.introduced_products || [];
  if (introduced.includes(productName)) return 'введён';
  const current = profile.current_product;
  if (current === productName) return 'в процессе';
  return 'не вводился';
}

// Статус активного продукта
function activeProductStatus(profile) {
  return profile.current_product || null;
}

// Правила безопасности (из вашего файла)
function getSafetyWarning(productName) {
  return SAFETY_RULES[productName] || null;
}

// Миграция данных (если не реализована)
function migrateData() {
  // уже есть в app.js
}