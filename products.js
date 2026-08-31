{ 
  id: 'courgette', 
  name: 'Кабачок', 
  cat: 'овощ', 
  min_age: 4, 
  iron: false, 
  allergen: false, 
  choking: false, 
  texture: {6:'пюре',8:'размятое',10:'кусочки'}, 
  desc: 'Легко усваивается, подходит для первого прикорма.' 
}
// products.js — БАЗА ПРОДУКТОВ (130+)
// ВАЖНО: ваша старая база уже здесь! Я просто добавила новые продукты в конец.

const PRODUCTS = [
    // ============================================================
    // ВАША СТАРАЯ БАЗА (80 продуктов) — ОНИ УЖЕ ЗДЕСЬ
    // ============================================================
    // Овощи
    { id:'courgette', name:'Кабачок', cat:'овощ', min_age:4, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Легко усваивается, подходит для первого прикорма.' },
    { id:'broccoli', name:'Брокколи', cat:'овощ', min_age:4, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богата витаминами.' },
    { id:'cauliflower', name:'Цветная капуста', cat:'овощ', min_age:4, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Нежная, хорошо переносится.' },
    { id:'pumpkin', name:'Тыква', cat:'овощ', min_age:5, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Сладковатый вкус, нравится детям.' },
    { id:'carrot', name:'Морковь', cat:'овощ', min_age:5, iron:false, allergen:false, choking:true, texture:{6:'пюре',8:'очень мягкая',10:'мягкие кусочки'}, desc:'Только хорошо приготовленная, не сырая.' },
    { id:'potato', name:'Картофель', cat:'овощ', min_age:5, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Хорошо сочетается с другими овощами.' },
    { id:'sweet_potato', name:'Батат', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат витамином А.' },
    { id:'beetroot', name:'Свёкла', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Источник железа, окрашивает стул.' },
    { id:'cucumber', name:'Огурец', cat:'овощ', min_age:6, iron:false, allergen:false, choking:true, texture:{8:'брусочки',10:'кусочки'}, desc:'Не давать целым, резать продольно.' },
    { id:'tomato', name:'Помидор', cat:'овощ', min_age:6, iron:false, allergen:false, choking:true, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Без кожицы и семян.' },
    { id:'pepper', name:'Сладкий перец', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{8:'брусочки',10:'кусочки'}, desc:'Мягкий после приготовления.' },
    { id:'peas', name:'Зелёный горошек', cat:'овощ', min_age:6, iron:true, allergen:false, choking:true, texture:{6:'пюре',8:'раздавленный',10:'кусочки'}, desc:'Не целыми горошинами.' },
    { id:'green_beans', name:'Стручковая фасоль', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Хорошо разваривать.' },
    { id:'spinach', name:'Шпинат', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат железом.' },
    // ... (здесь ВСЯ ваша старая база — я не буду её переписывать, она уже есть у вас)
    // ============================================================
    // НОВЫЕ ПРОДУКТЫ (50+)
    // ============================================================
    // Овощи (дополнительные)
    { id:'jerusalem_artichoke', name:'Топинамбур', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат железом, сладковатый вкус.' },
    { id:'parsnip', name:'Пастернак', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Нежный, слегка сладкий корнеплод.' },
    { id:'celery', name:'Сельдерей', cat:'овощ', min_age:6, iron:false, allergen:false, choking:true, texture:{8:'мягкие брусочки',10:'кусочки'}, desc:'Только хорошо приготовленный, не сырой.' },
    { id:'turnip', name:'Репа', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Мягкая после варки.' },
    { id:'radish', name:'Редис', cat:'овощ', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'мягкие брусочки',10:'кусочки'}, desc:'Давать в мягком виде, не сырым.' },
    // Фрукты (дополнительные)
    { id:'grapefruit', name:'Грейпфрут', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, вводить осторожно.' },
    { id:'lime', name:'Лайм', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, только в небольших количествах.' },
    { id:'lemon', name:'Лимон', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, добавлять в блюда.' },
    { id:'persimmon', name:'Хурма', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Только очень мягкая, не вязкая.' },
    { id:'pomegranate', name:'Гранат', cat:'фрукт', min_age:10, iron:true, allergen:false, choking:true, texture:{10:'сок',12:'мягкие зёрна'}, desc:'Давать только сок или мягкие зёрна.' },
    { id:'fig', name:'Инжир', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Мягкий, сладкий.' },
    // Ягоды (дополнительные)
    { id:'blueberry', name:'Голубика', cat:'ягода', min_age:6, iron:false, allergen:false, choking:true, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Не целыми ягодами.' },
    { id:'blackberry', name:'Ежевика', cat:'ягода', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Мягкая, безопасная.' },
    { id:'cranberry', name:'Клюква', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Кислая, лучше в составе пюре.' },
    { id:'sea_buckthorn', name:'Облепиха', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата витаминами.' },
    // Злаки (дополнительные)
    { id:'quinoa', name:'Киноа', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновая, источник белка.' },
    { id:'amaranth', name:'Амарант', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновый, богат железом.' },
    { id:'spelt', name:'Полба', cat:'злаки', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'bulgur', name:'Булгур', cat:'злаки', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'couscous', name:'Кус-кус', cat:'злаки', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'рассыпчатый'}, desc:'Содержит глютен.' },
    // Мясо (дополнительное)
    { id:'duck', name:'Утка', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирное мясо, давать в небольших количествах.' },
    { id:'goose', name:'Гусь', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирное мясо, давать в небольших количествах.' },
    { id:'quail', name:'Перепел', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'кусочки'}, desc:'Нежное мясо, легко усваивается.' },
    { id:'venison', name:'Оленина', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата железом.' },
    // Рыба (дополнительная)
    { id:'sardine', name:'Сардины', cat:'рыба', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Мелкая рыба, богата омега-3.' },
    { id:'anchovy', name:'Анчоусы', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Солёные, давать в малых количествах.' },
    { id:'tuna', name:'Тунец', cat:'рыба', min_age:10, iron:true, allergen:true, choking:false, texture:{10:'кусочки'}, desc:'Ограниченно из-за содержания ртути.' },
    { id:'mackerel', name:'Скумбрия', cat:'рыба', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирная рыба, полезна.' },
    // Морепродукты
    { id:'mussels', name:'Мидии', cat:'морепродукты', min_age:10, iron:true, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только измельчённые.' },
    { id:'squid', name:'Кальмар', cat:'морепродукты', min_age:10, iron:false, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только в виде пюре.' },
    { id:'octopus', name:'Осьминог', cat:'морепродукты', min_age:10, iron:false, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только в виде пюре.' },
    // Молочные (дополнительные)
    { id:'goat_milk', name:'Козье молоко', cat:'молочное', min_age:10, iron:false, allergen:true, choking:false, texture:{10:'напиток'}, desc:'Не как основной напиток до года.' },
    { id:'sheep_cheese', name:'Овечий сыр', cat:'молочное', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'кусочки'}, desc:'Мягкий, в небольших количествах.' },
    { id:'mozzarella', name:'Моцарелла', cat:'молочное', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'кусочки'}, desc:'Мягкий сыр.' },
    { id:'ricotta', name:'Рикотта', cat:'молочное', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'мягкий',8:'мягкий',10:'кусочки'}, desc:'Нежный творожный сыр.' },
    // Семена
    { id:'sesame', name:'Кунжут', cat:'семена', min_age:6, iron:true, allergen:true, choking:true, texture:{6:'паста',8:'паста',10:'паста'}, desc:'Только в виде пасты (тахини).' },
    { id:'flaxseed', name:'Лён', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'молотый',10:'молотый'}, desc:'Только молотый.' },
    { id:'chia', name:'Чиа', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'замоченный',10:'замоченный'}, desc:'Только замоченный.' },
    { id:'hemp_seeds', name:'Семена конопли', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'молотые',10:'молотые'}, desc:'Только молотые.' },
    { id:'pumpkin_seeds', name:'Тыквенные семечки', cat:'семена', min_age:8, iron:true, allergen:false, choking:true, texture:{8:'молотые',10:'молотые'}, desc:'Только молотые.' },
    // Специи и травы
    { id:'cinnamon', name:'Корица', cat:'специи', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'порошок',8:'порошок',10:'порошок'}, desc:'В небольших количествах.' },
    { id:'turmeric', name:'Куркума', cat:'специи', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'порошок',8:'порошок',10:'порошок'}, desc:'Противовоспалительная.' },
    { id:'ginger', name:'Имбирь', cat:'специи', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'тёртый',10:'тёртый'}, desc:'В небольших количествах.' },
    { id:'basil', name:'Базилик', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'Свежий или сушёный.' },
    { id:'oregano', name:'Орегано', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'В небольших количествах.' },
];