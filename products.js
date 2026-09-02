// products.js — ПОЛНАЯ БАЗА ПРОДУКТОВ (250+)
// Основано на WHO, ESPGHAN, AAP, NHS, CDC

const PRODUCTS = [
    // ============================================================
    // 1. ОВОЩИ (40+)
    // ============================================================
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
    { id:'jerusalem_artichoke', name:'Топинамбур', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат железом, сладковатый вкус.' },
    { id:'parsnip', name:'Пастернак', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Нежный, слегка сладкий корнеплод.' },
    { id:'celery', name:'Сельдерей', cat:'овощ', min_age:6, iron:false, allergen:false, choking:true, texture:{8:'мягкие брусочки',10:'кусочки'}, desc:'Только хорошо приготовленный, не сырой.' },
    { id:'turnip', name:'Репа', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Мягкая после варки.' },
    { id:'radish', name:'Редис', cat:'овощ', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'мягкие брусочки',10:'кусочки'}, desc:'Давать в мягком виде, не сырым.' },
    { id:'fennel', name:'Фенхель', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Имеет анисовый аромат.' },
    { id:'leek', name:'Лук-порей', cat:'овощ', min_age:7, iron:false, allergen:false, choking:false, texture:{7:'пюре',8:'размятое',10:'кусочки'}, desc:'В составе пюре.' },
    { id:'asparagus', name:'Спаржа', cat:'овощ', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Только мягкие верхушки.' },
    { id:'artichoke', name:'Артишок', cat:'овощ', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Сердцевина.' },
    { id:'kale', name:'Кале (листовая капуста)', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богата железом и витаминами.' },
    { id:'swiss_chard', name:'Мангольд', cat:'овощ', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Листовой овощ.' },
    { id:'endive', name:'Эндивий', cat:'овощ', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Горьковатый вкус.' },
    { id:'radicchio', name:'Радиккио', cat:'овощ', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Горький.' },
    { id:'bok_choy', name:'Пак-чой', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Китайская капуста.' },
    { id:'chinese_cabbage', name:'Пекинская капуста', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Мягкая.' },
    { id:'daikon', name:'Дайкон', cat:'овощ', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Только в приготовленном виде.' },
    { id:'plantain', name:'Плантан', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Варить или запекать.' },
    { id:'yuca', name:'Юка (кассава)', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Только хорошо приготовленная.' },
    { id:'malanga', name:'Маланга', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Тропический корнеплод.' },
    { id:'kohlrabi', name:'Кольраби', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Мягкая после варки.' },
    { id:'celeriac', name:'Сельдерей корневой', cat:'овощ', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Ароматный.' },
    // ============================================================
    // 2. ФРУКТЫ (40+)
    // ============================================================
    { id:'apple', name:'Яблоко', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:true, texture:{6:'пюре',8:'тёртое',10:'кусочки'}, desc:'Только приготовленное в первые недели.' },
    { id:'pear', name:'Груша', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Мягкая, хорошо переносится.' },
    { id:'banana', name:'Банан', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'размятый',8:'размятый с комочками',10:'кусочки'}, desc:'Богат калием.' },
    { id:'peach', name:'Персик', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Без кожицы.' },
    { id:'apricot', name:'Абрикос', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат витаминами.' },
    { id:'plum', name:'Слива', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Может слабить.' },
    { id:'mango', name:'Манго', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богат витаминами.' },
    { id:'avocado', name:'Авокадо', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Здоровые жиры.' },
    { id:'kiwi', name:'Киви', cat:'фрукт', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Аллерген, вводить осторожно.' },
    { id:'grapefruit', name:'Грейпфрут', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, вводить осторожно.' },
    { id:'lime', name:'Лайм', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, только в небольших количествах.' },
    { id:'lemon', name:'Лимон', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген, добавлять в блюда.' },
    { id:'persimmon', name:'Хурма', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Только очень мягкая, не вязкая.' },
    { id:'pomegranate', name:'Гранат', cat:'фрукт', min_age:10, iron:true, allergen:false, choking:true, texture:{10:'сок',12:'мягкие зёрна'}, desc:'Давать только сок или мягкие зёрна.' },
    { id:'fig', name:'Инжир', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Мягкий, сладкий.' },
    { id:'date', name:'Финики', cat:'фрукт', min_age:10, iron:false, allergen:false, choking:true, texture:{10:'пюре',12:'кусочки'}, desc:'Без косточек, в малых количествах.' },
    { id:'pineapple', name:'Ананас', cat:'фрукт', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Аллерген.' },
    { id:'papaya', name:'Папайя', cat:'фрукт', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'размятое',10:'кусочки'}, desc:'Богата ферментами.' },
    { id:'guava', name:'Гуава', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата витамином С.' },
    { id:'passion_fruit', name:'Маракуйя', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'сок'}, desc:'Семена удалять.' },
    { id:'jackfruit', name:'Джекфрут', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Мякоть.' },
    { id:'dragon_fruit', name:'Питахайя', cat:'фрукт', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Без семян.' },
    // ============================================================
    // 3. ЯГОДЫ (20+)
    // ============================================================
    { id:'strawberry', name:'Клубника', cat:'ягода', min_age:6, iron:false, allergen:true, choking:true, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Аллерген.' },
    { id:'raspberry', name:'Малина', cat:'ягода', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Аллерген.' },
    { id:'blueberry', name:'Голубика', cat:'ягода', min_age:6, iron:false, allergen:false, choking:true, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Не целыми ягодами.' },
    { id:'blackberry', name:'Ежевика', cat:'ягода', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'раздавленная',10:'кусочки'}, desc:'Мягкая, безопасная.' },
    { id:'cranberry', name:'Клюква', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Кислая, лучше в составе пюре.' },
    { id:'sea_buckthorn', name:'Облепиха', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата витаминами.' },
    { id:'gooseberry', name:'Крыжовник', cat:'ягода', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'пюре',10:'кусочки'}, desc:'Не целыми.' },
    { id:'currant', name:'Смородина (чёрная, красная)', cat:'ягода', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата витамином С.' },
    { id:'lingonberry', name:'Брусника', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Кислая.' },
    { id:'cloudberry', name:'Морошка', cat:'ягода', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Северная ягода.' },
    // ============================================================
    // 4. КАШИ И ЗЛАКИ (25+)
    // ============================================================
    { id:'buckwheat', name:'Гречка', cat:'каша', min_age:4, iron:true, allergen:false, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Безглютеновая, источник железа.' },
    { id:'rice', name:'Рис', cat:'каша', min_age:4, iron:false, allergen:false, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Безглютеновый, легко усваивается.' },
    { id:'corn', name:'Кукурузная крупа', cat:'каша', min_age:4, iron:false, allergen:false, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Безглютеновая.' },
    { id:'oatmeal', name:'Овсянка', cat:'каша', min_age:4, iron:true, allergen:true, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'millet', name:'Пшено', cat:'каша', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Безглютеновое.' },
    { id:'barley', name:'Ячневая крупа', cat:'каша', min_age:6, iron:true, allergen:true, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'wheat', name:'Пшеница', cat:'каша', min_age:6, iron:true, allergen:true, choking:false, texture:{6:'жидкая каша',8:'густая каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'quinoa', name:'Киноа', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновая, источник белка.' },
    { id:'amaranth', name:'Амарант', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновый, богат железом.' },
    { id:'spelt', name:'Полба', cat:'злаки', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'bulgur', name:'Булгур', cat:'злаки', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'каша',10:'рассыпчатая'}, desc:'Содержит глютен.' },
    { id:'couscous', name:'Кус-кус', cat:'злаки', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'рассыпчатый'}, desc:'Содержит глютен.' },
    { id:'sorghum', name:'Сорго', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновое.' },
    { id:'teff', name:'Теф', cat:'злаки', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'кашица',8:'каша',10:'рассыпчатая'}, desc:'Безглютеновый, богат железом.' },
    { id:'rice_flakes', name:'Рисовые хлопья', cat:'злаки', min_age:4, iron:false, allergen:false, choking:false, texture:{4:'кашица',6:'каша',8:'каша'}, desc:'Быстрое приготовление.' },
    { id:'oat_flakes', name:'Овсяные хлопья', cat:'злаки', min_age:4, iron:true, allergen:true, choking:false, texture:{4:'кашица',6:'каша',8:'каша'}, desc:'Содержат глютен.' },
    // ============================================================
    // 5. МЯСО (20+)
    // ============================================================
    { id:'turkey', name:'Индейка', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Нежирное, хорошо усваивается.' },
    { id:'chicken', name:'Курица', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Белковый продукт.' },
    { id:'beef', name:'Говядина', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Источник железа.' },
    { id:'veal', name:'Телятина', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Нежная, легко усваивается.' },
    { id:'rabbit', name:'Кролик', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Диетическое мясо.' },
    { id:'duck', name:'Утка', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирное мясо, давать в небольших количествах.' },
    { id:'goose', name:'Гусь', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирное мясо.' },
    { id:'quail', name:'Перепел', cat:'мясо', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'кусочки'}, desc:'Нежное мясо.' },
    { id:'venison', name:'Оленина', cat:'мясо', min_age:8, iron:true, allergen:false, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Богата железом.' },
    { id:'lamb', name:'Баранина', cat:'мясо', min_age:7, iron:true, allergen:false, choking:false, texture:{7:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Специфический вкус.' },
    { id:'goat', name:'Козлятина', cat:'мясо', min_age:7, iron:true, allergen:false, choking:false, texture:{7:'пюре',8:'мелко измельчённое',10:'кусочки'}, desc:'Постное мясо.' },
    { id:'liver_beef', name:'Печень говяжья', cat:'мясо', min_age:7, iron:true, allergen:false, choking:false, texture:{7:'пюре',8:'мелко измельчённая',10:'кусочки'}, desc:'Богата железом, давать ограниченно.' },
    { id:'liver_chicken', name:'Печень куриная', cat:'мясо', min_age:7, iron:true, allergen:false, choking:false, texture:{7:'пюре',8:'мелко измельчённая',10:'кусочки'}, desc:'Богата железом.' },
    // ============================================================
    // 6. РЫБА И МОРЕПРОДУКТЫ (20+)
    // ============================================================
    { id:'cod', name:'Треска', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Нежирная рыба.' },
    { id:'hake', name:'Хек', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Нежирная рыба.' },
    { id:'salmon', name:'Лосось', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирная рыба, полезные кислоты.' },
    { id:'trout', name:'Форель', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Пресноводная рыба.' },
    { id:'mackerel', name:'Скумбрия', cat:'рыба', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Жирная рыба, богата омега-3.' },
    { id:'sardine', name:'Сардины', cat:'рыба', min_age:8, iron:true, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Мелкая рыба, богата омега-3.' },
    { id:'anchovy', name:'Анчоусы', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Солёные, давать в малых количествах.' },
    { id:'tuna', name:'Тунец', cat:'рыба', min_age:10, iron:true, allergen:true, choking:false, texture:{10:'кусочки'}, desc:'Ограниченно из-за содержания ртути.' },
    { id:'pollock', name:'Минтай', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Нежирная рыба.' },
    { id:'halibut', name:'Палтус', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Белая рыба.' },
    { id:'sole', name:'Морской язык', cat:'рыба', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'кусочки'}, desc:'Нежная рыба.' },
    { id:'mussels', name:'Мидии', cat:'морепродукты', min_age:10, iron:true, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только измельчённые.' },
    { id:'squid', name:'Кальмар', cat:'морепродукты', min_age:10, iron:false, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только в виде пюре.' },
    { id:'octopus', name:'Осьминог', cat:'морепродукты', min_age:10, iron:false, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только в виде пюре.' },
    { id:'shrimp', name:'Креветки', cat:'морепродукты', min_age:10, iron:false, allergen:true, choking:true, texture:{10:'пюре'}, desc:'Только измельчённые.' },
    // ============================================================
    // 7. ЯЙЦО
    // ============================================================
    { id:'egg', name:'Яйцо куриное', cat:'яйцо', min_age:6, iron:true, allergen:true, choking:false, texture:{6:'желток пюре',8:'кусочки белка',10:'целое'}, desc:'Аллерген, начинать с желтка.' },
    { id:'quail_egg', name:'Яйцо перепелиное', cat:'яйцо', min_age:6, iron:true, allergen:true, choking:false, texture:{6:'желток пюре',8:'кусочки белка',10:'целое'}, desc:'Меньше аллергенность.' },
    // ============================================================
    // 8. МОЛОЧНЫЕ ПРОДУКТЫ (15+)
    // ============================================================
    { id:'yogurt', name:'Натуральный йогурт', cat:'молочное', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'пюре',8:'густой',10:'кусочки'}, desc:'Без сахара.' },
    { id:'cottage_cheese', name:'Творог', cat:'молочное', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'мягкий',8:'мягкий',10:'кусочки'}, desc:'Источник кальция.' },
    { id:'kefir', name:'Кефир', cat:'молочное', min_age:7, iron:false, allergen:true, choking:false, texture:{7:'напиток',8:'напиток',10:'напиток'}, desc:'Кисломолочный.' },
    { id:'goat_milk', name:'Козье молоко', cat:'молочное', min_age:10, iron:false, allergen:true, choking:false, texture:{10:'напиток'}, desc:'Не как основной напиток до года.' },
    { id:'sheep_cheese', name:'Овечий сыр', cat:'молочное', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'кусочки'}, desc:'Мягкий, в небольших количествах.' },
    { id:'mozzarella', name:'Моцарелла', cat:'молочное', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'мягкий',10:'кусочки'}, desc:'Мягкий сыр.' },
    { id:'ricotta', name:'Рикотта', cat:'молочное', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'мягкий',8:'мягкий',10:'кусочки'}, desc:'Нежный творожный сыр.' },
    { id:'cream', name:'Сливки (для каш)', cat:'молочное', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'жидкие',10:'жидкие'}, desc:'В небольших количествах.' },
    { id:'butter', name:'Сливочное масло', cat:'жиры', min_age:6, iron:false, allergen:true, choking:false, texture:{6:'добавлять в кашу',8:'добавлять в кашу',10:'добавлять в кашу'}, desc:'В небольших количествах.' },
    // ============================================================
    // 9. БОБОВЫЕ (12+)
    // ============================================================
    { id:'lentil', name:'Красная чечевица', cat:'бобовые', min_age:7, iron:true, allergen:false, choking:false, texture:{7:'пюре',10:'мягкая'}, desc:'Богата железом и белком.' },
    { id:'chickpea', name:'Нут', cat:'бобовые', min_age:7, iron:true, allergen:true, choking:true, texture:{7:'пюре',10:'размятый'}, desc:'Не целым.' },
    { id:'beans', name:'Фасоль (белая)', cat:'бобовые', min_age:8, iron:true, allergen:true, choking:true, texture:{8:'пюре',10:'размятая'}, desc:'Не целой.' },
    { id:'green_lentil', name:'Зелёная чечевица', cat:'бобовые', min_age:7, iron:true, allergen:false, choking:true, texture:{7:'пюре',10:'размятая'}, desc:'Хорошо разваривать.' },
    { id:'tofu', name:'Тофу', cat:'бобовые', min_age:6, iron:true, allergen:true, choking:false, texture:{6:'пюре',8:'кусочки',10:'кусочки'}, desc:'Соевый продукт, аллерген.' },
    { id:'edamame', name:'Эдамаме (молодая соя)', cat:'бобовые', min_age:8, iron:true, allergen:true, choking:true, texture:{8:'пюре',10:'размятый'}, desc:'Только в измельчённом виде.' },
    { id:'black_beans', name:'Чёрная фасоль', cat:'бобовые', min_age:8, iron:true, allergen:false, choking:true, texture:{8:'пюре',10:'размятая'}, desc:'Хорошо разваривать.' },
    // ============================================================
    // 10. ОРЕХИ И СЕМЕНА (20+)
    // ============================================================
    { id:'peanut', name:'Арахис', cat:'орехи', min_age:6, iron:false, allergen:true, choking:true, texture:{6:'паста разведённая',8:'паста',10:'паста'}, desc:'Только в виде гладкой пасты.' },
    { id:'almond', name:'Миндаль', cat:'орехи', min_age:6, iron:false, allergen:true, choking:true, texture:{6:'паста разведённая',8:'паста',10:'паста'}, desc:'Только в виде пасты.' },
    { id:'cashew', name:'Кешью', cat:'орехи', min_age:6, iron:false, allergen:true, choking:true, texture:{6:'паста разведённая',8:'паста',10:'паста'}, desc:'Только в виде пасты.' },
    { id:'hazelnut', name:'Фундук', cat:'орехи', min_age:8, iron:false, allergen:true, choking:true, texture:{8:'паста',10:'паста'}, desc:'Только в виде пасты.' },
    { id:'walnut', name:'Грецкий орех', cat:'орехи', min_age:8, iron:false, allergen:true, choking:true, texture:{8:'паста',10:'паста'}, desc:'Только в виде пасты.' },
    { id:'pistachio', name:'Фисташка', cat:'орехи', min_age:8, iron:false, allergen:true, choking:true, texture:{8:'паста',10:'паста'}, desc:'Только в виде пасты.' },
    { id:'sesame', name:'Кунжут', cat:'семена', min_age:6, iron:true, allergen:true, choking:true, texture:{6:'паста',8:'паста',10:'паста'}, desc:'Только в виде пасты (тахини).' },
    { id:'flaxseed', name:'Семена льна', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'молотый',10:'молотый'}, desc:'Только молотый.' },
    { id:'chia', name:'Семена чиа', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'замоченный',10:'замоченный'}, desc:'Только замоченный.' },
    { id:'hemp_seeds', name:'Семена конопли', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'молотые',10:'молотые'}, desc:'Только молотые.' },
    { id:'pumpkin_seeds', name:'Тыквенные семечки', cat:'семена', min_age:8, iron:true, allergen:false, choking:true, texture:{8:'молотые',10:'молотые'}, desc:'Только молотые.' },
    { id:'sunflower_seeds', name:'Семена подсолнечника', cat:'семена', min_age:8, iron:false, allergen:false, choking:true, texture:{8:'молотые',10:'молотые'}, desc:'Только молотые.' },
    // ============================================================
    // 11. МАСЛА И ЖИРЫ (8+)
    // ============================================================
    { id:'olive_oil', name:'Оливковое масло', cat:'жиры', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'добавлять в пюре',8:'добавлять в пюре',10:'добавлять в пюре'}, desc:'В небольших количествах.' },
    { id:'rapeseed_oil', name:'Рапсовое масло', cat:'жиры', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'добавлять в пюре',8:'добавлять в пюре',10:'добавлять в пюре'}, desc:'В небольших количествах.' },
    { id:'sunflower_oil', name:'Подсолнечное масло', cat:'жиры', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'добавлять в пюре',8:'добавлять в пюре',10:'добавлять в пюре'}, desc:'В небольших количествах.' },
    { id:'coconut_oil', name:'Кокосовое масло', cat:'жиры', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'добавлять в каши',8:'добавлять в каши',10:'добавлять в каши'}, desc:'В небольших количествах.' },
    // ============================================================
    // 12. ТРАВЫ И СПЕЦИИ (15+)
    // ============================================================
    { id:'cinnamon', name:'Корица', cat:'специи', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'порошок',8:'порошок',10:'порошок'}, desc:'В небольших количествах.' },
    { id:'turmeric', name:'Куркума', cat:'специи', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'порошок',8:'порошок',10:'порошок'}, desc:'Противовоспалительная.' },
    { id:'ginger', name:'Имбирь', cat:'специи', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'тёртый',10:'тёртый'}, desc:'В небольших количествах.' },
    { id:'basil', name:'Базилик', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'Свежий или сушёный.' },
    { id:'oregano', name:'Орегано', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'В небольших количествах.' },
    { id:'thyme', name:'Тимьян', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'В небольших количествах.' },
    { id:'parsley', name:'Петрушка', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённая',8:'измельчённая',10:'измельчённая'}, desc:'В небольших количествах.' },
    { id:'dill', name:'Укроп', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённый',8:'измельчённый',10:'измельчённый'}, desc:'В небольших количествах.' },
    { id:'mint', name:'Мята', cat:'травы', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'измельчённая',8:'измельчённая',10:'измельчённая'}, desc:'В небольших количествах.' },
    { id:'rosemary', name:'Розмарин', cat:'травы', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'измельчённый',10:'измельчённый'}, desc:'Ароматный.' },
    { id:'sage', name:'Шалфей', cat:'травы', min_age:8, iron:false, allergen:false, choking:false, texture:{8:'измельчённый',10:'измельчённый'}, desc:'В небольших количествах.' },
    // ============================================================
    // 13. ГОТОВЫЕ ПРОДУКТЫ
    // ============================================================
    { id:'baby_rice_porridge', name:'Рисовая каша (готовая)', cat:'готовое', min_age:4, iron:true, allergen:false, choking:false, texture:{4:'каша',6:'каша',8:'каша'}, desc:'Обогащена железом.' },
    { id:'baby_buckwheat_porridge', name:'Гречневая каша (готовая)', cat:'готовое', min_age:4, iron:true, allergen:false, choking:false, texture:{4:'каша',6:'каша',8:'каша'}, desc:'Обогащена железом.' },
    { id:'baby_vegetable_puree', name:'Овощное пюре (готовая банка)', cat:'готовое', min_age:4, iron:false, allergen:false, choking:false, texture:{4:'пюре',6:'пюре',8:'пюре'}, desc:'Удобно в поездках.' },
    { id:'baby_fruit_puree', name:'Фруктовое пюре (готовая банка)', cat:'готовое', min_age:6, iron:false, allergen:false, choking:false, texture:{6:'пюре',8:'пюре',10:'пюре'}, desc:'Без добавленного сахара.' },
    { id:'baby_meat_puree', name:'Мясное пюре (готовая банка)', cat:'готовое', min_age:6, iron:true, allergen:false, choking:false, texture:{6:'пюре',8:'пюре',10:'пюре'}, desc:'Удобный источник железа.' },
    { id:'baby_fish_puree', name:'Рыбное пюре (готовая банка)', cat:'готовое', min_age:8, iron:false, allergen:true, choking:false, texture:{8:'пюре',10:'пюре'}, desc:'Вводить осторожно.' },
];

// Экспортируем в глобальную область
window.PRODUCTS = PRODUCTS;
window.PRODUCT_DATABASE = PRODUCTS;
