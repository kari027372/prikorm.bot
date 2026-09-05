// data/products.js
export const PRODUCTS = [
  // === ОВОЩИ ===
  { id: 'veg-1', name: 'Кабачок', emoji: '🥒', category: 'овощи', min_age_months: 4, iron: false, allergen: false, desc: 'Нейтральный вкус, легко усваивается. Начинайте с 1 ч.л. пюре.' },
  { id: 'veg-2', name: 'Цветная капуста', emoji: '🥦', category: 'овощи', min_age_months: 4, iron: false, allergen: false, desc: 'Богата витамином C. Можно давать как монопюре.' },
  { id: 'veg-3', name: 'Брокколи', emoji: '🥦', category: 'овощи', min_age_months: 4, iron: true, allergen: false, desc: 'Источник железа и клетчатки. Хорошо сочетается с картофелем.' },
  { id: 'veg-4', name: 'Картофель', emoji: '🥔', category: 'овощи', min_age_months: 4, iron: false, allergen: false, desc: 'Крахмалистый, даёт сытость. Вводите после кабачка.' },
  { id: 'veg-5', name: 'Морковь', emoji: '🥕', category: 'овощи', min_age_months: 4, iron: false, allergen: false, desc: 'Сладковатая, содержит бета-каротин. Можно с каплей масла.' },
  { id: 'veg-6', name: 'Тыква', emoji: '🎃', category: 'овощи', min_age_months: 4, iron: false, allergen: false, desc: 'Яркий цвет, мягкая текстура. Хорошо для первого прикорма.' },
  { id: 'veg-7', name: 'Свекла', emoji: '🫃', category: 'овощи', min_age_months: 6, iron: true, allergen: false, desc: 'Богата железом, но может слабить. Вводите с 6 мес.' },
  { id: 'veg-8', name: 'Лук репчатый', emoji: '🧅', category: 'овощи', min_age_months: 6, iron: false, allergen: false, desc: 'В варёном виде – для вкуса. Не давайте сырым.' },
  { id: 'veg-9', name: 'Чеснок', emoji: '🧄', category: 'овощи', min_age_months: 8, iron: false, allergen: false, desc: 'Острый, только в малых дозах в блюдах.' },
  { id: 'veg-10', name: 'Баклажан', emoji: '🍆', category: 'овощи', min_age_months: 6, iron: false, allergen: false, desc: 'Мякоть нежная, но может вызывать газообразование.' },
  { id: 'veg-11', name: 'Перец сладкий', emoji: '🫑', category: 'овощи', min_age_months: 8, iron: false, allergen: false, desc: 'Яркий вкус, но может раздражать ЖКТ.' },
  { id: 'veg-12', name: 'Помидор', emoji: '🍅', category: 'овощи', min_age_months: 8, iron: false, allergen: true, desc: 'Кисловатый, возможна аллергия. Вводите осторожно.' },
  { id: 'veg-13', name: 'Огурец', emoji: '🥒', category: 'овощи', min_age_months: 8, iron: false, allergen: false, desc: 'Освежает, но много воды. Давайте кусочками с 8 мес.' },
  { id: 'veg-14', name: 'Зелёный горошек', emoji: '🫛', category: 'овощи', min_age_months: 6, iron: true, allergen: false, desc: 'Богат белком и железом. В пюре или размятый.' },
  { id: 'veg-15', name: 'Шпинат', emoji: '🌿', category: 'овощи', min_age_months: 8, iron: true, allergen: false, desc: 'Много железа, но содержит щавелевую кислоту – не часто.' },

  // === ФРУКТЫ ===
  { id: 'fruit-1', name: 'Яблоко', emoji: '🍏', category: 'фрукты', min_age_months: 4, iron: false, allergen: false, desc: 'Классика. Запекайте или давайте пюре.' },
  { id: 'fruit-2', name: 'Груша', emoji: '🍐', category: 'фрукты', min_age_months: 4, iron: false, allergen: false, desc: 'Сладкая, мягкая. Реже вызывает аллергию.' },
  { id: 'fruit-3', name: 'Банан', emoji: '🍌', category: 'фрукты', min_age_months: 4, iron: false, allergen: false, desc: 'Энергичный, содержит калий. Разомните вилкой.' },
  { id: 'fruit-4', name: 'Авокадо', emoji: '🥑', category: 'фрукты', min_age_months: 4, iron: false, allergen: false, desc: 'Полезные жиры. Консистенция как масло.' },
  { id: 'fruit-5', name: 'Персик', emoji: '🍑', category: 'фрукты', min_age_months: 5, iron: false, allergen: true, desc: 'Сочный, но может вызвать аллергию.' },
  { id: 'fruit-6', name: 'Нектарин', emoji: '🍑', category: 'фрукты', min_age_months: 5, iron: false, allergen: true, desc: 'Аналогично персику.' },
  { id: 'fruit-7', name: 'Абрикос', emoji: '🫐', category: 'фрукты', min_age_months: 6, iron: false, allergen: false, desc: 'Содержит бета-каротин.' },
  { id: 'fruit-8', name: 'Слива', emoji: '🫐', category: 'фрукты', min_age_months: 6, iron: false, allergen: false, desc: 'Может слабить – не давайте много.' },
  { id: 'fruit-9', name: 'Черника', emoji: '🫐', category: 'фрукты', min_age_months: 6, iron: true, allergen: false, desc: 'Ягода, богатая антиоксидантами.' },
  { id: 'fruit-10', name: 'Малина', emoji: '🫐', category: 'фрукты', min_age_months: 8, iron: false, allergen: true, desc: 'Аллергенна, вводите поздно.' },
  { id: 'fruit-11', name: 'Клубника', emoji: '🍓', category: 'фрукты', min_age_months: 8, iron: false, allergen: true, desc: 'Сильный аллерген, отложите до года.' },
  { id: 'fruit-12', name: 'Киви', emoji: '🥝', category: 'фрукты', min_age_months: 8, iron: false, allergen: true, desc: 'Экзотический, может вызвать реакцию.' },

  // === КРУПЫ ===
  { id: 'grain-1', name: 'Рис', emoji: '🍚', category: 'крупы', min_age_months: 4, iron: false, allergen: false, desc: 'Гипоаллергенная каша. Начинайте с рисовой.' },
  { id: 'grain-2', name: 'Гречка', emoji: '🍚', category: 'крупы', min_age_months: 4, iron: true, allergen: false, desc: 'Богата железом, безглютеновая.' },
  { id: 'grain-3', name: 'Кукурузная крупа', emoji: '🌽', category: 'крупы', min_age_months: 5, iron: false, allergen: false, desc: 'Безглютеновая, но грубее риса.' },
  { id: 'grain-4', name: 'Пшеничная крупа', emoji: '🌾', category: 'крупы', min_age_months: 6, iron: false, allergen: true, desc: 'Содержит глютен. Вводите с осторожностью.' },
  { id: 'grain-5', name: 'Овсянка', emoji: '🌾', category: 'крупы', min_age_months: 6, iron: false, allergen: true, desc: 'Глютен, но полезна для ЖКТ.' },
  { id: 'grain-6', name: 'Ячневая крупа', emoji: '🌾', category: 'крупы', min_age_months: 8, iron: false, allergen: true, desc: 'Содержит глютен.' },
  { id: 'grain-7', name: 'Полба', emoji: '🌾', category: 'крупы', min_age_months: 8, iron: false, allergen: true, desc: 'Древняя пшеница, тоже глютен.' },

  // === МЯСО ===
  { id: 'meat-1', name: 'Кролик', emoji: '🐇', category: 'мясо', min_age_months: 6, iron: true, allergen: false, desc: 'Диетическое, гипоаллергенное. Начинайте с 6 мес.' },
  { id: 'meat-2', name: 'Индейка', emoji: '🦃', category: 'мясо', min_age_months: 6, iron: true, allergen: false, desc: 'Белка много, жира мало. Хорошо усваивается.' },
  { id: 'meat-3', name: 'Курица', emoji: '🐔', category: 'мясо', min_age_months: 6, iron: true, allergen: false, desc: 'Популярное мясо, но следите за аллергией на яйца.' },
  { id: 'meat-4', name: 'Говядина', emoji: '🐮', category: 'мясо', min_age_months: 7, iron: true, allergen: false, desc: 'Красное мясо, богато железом.' },
  { id: 'meat-5', name: 'Телятина', emoji: '🐮', category: 'мясо', min_age_months: 7, iron: true, allergen: false, desc: 'Нежнее говядины.' },
  { id: 'meat-6', name: 'Свинина', emoji: '🐷', category: 'мясо', min_age_months: 8, iron: true, allergen: false, desc: 'Жирнее, но давать можно постные части.' },
  { id: 'meat-7', name: 'Баранина', emoji: '🐑', category: 'мясо', min_age_months: 9, iron: true, allergen: false, desc: 'Специфический вкус, не для всех.' },

  // === РЫБА ===
  { id: 'fish-1', name: 'Треска', emoji: '🐟', category: 'рыба', min_age_months: 8, iron: false, allergen: true, desc: 'Нежирная, но аллергенна. Вводите аккуратно.' },
  { id: 'fish-2', name: 'Минтай', emoji: '🐟', category: 'рыба', min_age_months: 8, iron: false, allergen: true, desc: 'Доступная рыба, мало костей.' },
  { id: 'fish-3', name: 'Сёмга', emoji: '🐟', category: 'рыба', min_age_months: 10, iron: false, allergen: true, desc: 'Жирная, содержит Омега-3, но поздно.' },
  { id: 'fish-4', name: 'Форель', emoji: '🐟', category: 'рыба', min_age_months: 10, iron: false, allergen: true, desc: 'Аналогично сёмге.' },
  { id: 'fish-5', name: 'Судак', emoji: '🐟', category: 'рыба', min_age_months: 9, iron: false, allergen: true, desc: 'Нежирная, но аллерген.' },

  // === МОЛОЧНЫЕ ===
  { id: 'dairy-1', name: 'Кефир', emoji: '🥛', category: 'молочные', min_age_months: 8, iron: false, allergen: true, desc: 'Кисломолочный, помогает пищеварению. Начинайте с 8 мес.' },
  { id: 'dairy-2', name: 'Йогурт', emoji: '🥛', category: 'молочные', min_age_months: 8, iron: false, allergen: true, desc: 'Без сахара, натуральный.' },
  { id: 'dairy-3', name: 'Творог', emoji: '🧀', category: 'молочные', min_age_months: 8, iron: false, allergen: true, desc: 'Источник кальция. Вводите после кефира.' },
  { id: 'dairy-4', name: 'Сыр твёрдый', emoji: '🧀', category: 'молочные', min_age_months: 12, iron: false, allergen: true, desc: 'Солёный, только с года.' },
  { id: 'dairy-5', name: 'Сливочное масло', emoji: '🧈', category: 'молочные', min_age_months: 6, iron: false, allergen: true, desc: 'Добавляйте 1-2 г в кашу с 6 мес.' },

  // === АЛЛЕРГЕНЫ (отдельно) ===
  { id: 'allerg-1', name: 'Яйцо', emoji: '🥚', category: 'аллергены', min_age_months: 8, iron: false, allergen: true, desc: 'Белок – сильный аллерген. Начинайте с желтка.' },
  { id: 'allerg-2', name: 'Мёд', emoji: '🍯', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Опасно до года (ботулизм).' },
  { id: 'allerg-3', name: 'Орехи', emoji: '🥜', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Сильный аллерген, кусочки опасны.' },
  { id: 'allerg-4', name: 'Арахис', emoji: '🥜', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Один из самых частых аллергенов.' },
  { id: 'allerg-5', name: 'Соя', emoji: '🫘', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Встречается в соевом соусе и тофу.' },
  { id: 'allerg-6', name: 'Кунжут', emoji: '🫘', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Аллерген, но в малых дозах.' },
  { id: 'allerg-7', name: 'Морепродукты', emoji: '🦐', category: 'аллергены', min_age_months: 12, iron: false, allergen: true, desc: 'Креветки, мидии – только после года.' },
];

// Экспортируем категории для фильтра
export const CATEGORIES = ['овощи', 'фрукты', 'крупы', 'мясо', 'рыба', 'молочные', 'аллергены'];
export const CATEGORY_LABELS = {
  овощи: 'Овощи',
  фрукты: 'Фрукты и ягоды',
  крупы: 'Крупы и злаки',
  мясо: 'Мясо',
  рыба: 'Рыба',
  молочные: 'Молочные продукты',
  аллергены: 'Аллергены (осторожно!)'
};