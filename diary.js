/* ============================================================
   diary.js
   Дневник прикорма
   ============================================================ */

/*
   ВАЖНО:
   Дневник НЕ хранит отдельную копию базы продуктов.

   Он получает продукт из products.js
   и сохраняет только факт употребления + данные конкретного
   приёма пищи.

   Это позволяет записывать:
   🥕 приготовила сама
   🛒 купила готовое
   🏷 бренд
   📦 продукт
   🥣 форму
   ⚖️ количество
   ⭐ понравилось
   ⚠️ реакцию
*/


/* ============================================================
   ТИП ИСТОЧНИКА
   ============================================================ */

const FOOD_SOURCE = {

    HOMEMADE: "homemade",

    STORE: "store"
};


/* ============================================================
   ТИП ПРИЁМА ПИЩИ
   ============================================================ */

const MEAL_TYPES = {

    BREAKFAST: "breakfast",

    LUNCH: "lunch",

    DINNER: "dinner",

    SNACK: "snack",

    OTHER: "other"
};


/* ============================================================
   ПОЛУЧЕНИЕ ПРОДУКТА
   ============================================================ */

function diaryGetProduct(productId) {

    if (
        typeof getProductById === "function"
    ) {

        return getProductById(
            productId
        );
    }

    if (
        typeof PRODUCT_DATABASE !==
        "undefined"
    ) {

        return PRODUCT_DATABASE.find(
            product =>
                product.id === productId
        ) || null;
    }

    return null;
}


/* ============================================================
   ДАТА
   ============================================================ */

function diaryToday() {

    return new Date()
        .toISOString()
        .slice(0, 10);
}


/* ============================================================
   СОЗДАНИЕ ЗАПИСИ
   ============================================================ */

function createDiaryEntry(data = {}) {

    const product =
        diaryGetProduct(
            data.productId
        );


    const entry = {

        id:
            data.id ||
            `diary_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 7)}`,

        date:
            data.date ||
            diaryToday(),

        createdAt:
            data.createdAt ||
            new Date()
                .toISOString(),


        /* ------------------------------------------------------
           ПРОДУКТ
           ------------------------------------------------------ */

        productId:
            data.productId ||
            null,

        productName:
            data.productName ||
            product?.name ||
            "",


        /* ------------------------------------------------------
           ИСТОЧНИК
           ------------------------------------------------------ */

        source:
            data.source ||
            FOOD_SOURCE.HOMEMADE,


        /* ------------------------------------------------------
           КУПЛЕННЫЙ ПРОДУКТ
           ------------------------------------------------------ */

        brand:
            data.brand ||
            "",

        productTitle:
            data.productTitle ||
            "",

        packageSize:
            data.packageSize ||
            "",

        packageUnit:
            data.packageUnit ||
            "г",


        /* ------------------------------------------------------
           ЭТИКЕТКА
           ------------------------------------------------------ */

        labelPhoto:
            data.labelPhoto ||
            "",

        ingredients:
            data.ingredients ||
            "",


        /* ------------------------------------------------------
           ДОМАШНЕЕ ПРИГОТОВЛЕНИЕ
           ------------------------------------------------------ */

        preparation:
            data.preparation ||
            "",


        /* ------------------------------------------------------
           ФОРМА
           ------------------------------------------------------ */

        servingForm:
            data.servingForm ||
            "",


        /* ------------------------------------------------------
           КОЛИЧЕСТВО
           ------------------------------------------------------ */

        amount:
            data.amount ??
            null,

        unit:
            data.unit ||
            "г",


        /* ------------------------------------------------------
           ПРИЁМ ПИЩИ
           ------------------------------------------------------ */

        mealType:
            data.mealType ||
            MEAL_TYPES.OTHER,


        time:
            data.time ||
            "",


        /* ------------------------------------------------------
           ОТНОШЕНИЕ К ЕДЕ
           ------------------------------------------------------ */

        appetite:
            data.appetite ||
            null,

        liked:
            data.liked ??
            null,


        /* ------------------------------------------------------
           РЕАКЦИЯ
           ------------------------------------------------------ */

        reaction:
            data.reaction ||
            null,

        reactionSymptoms:
            Array.isArray(
                data.reactionSymptoms
            )
                ? data.reactionSymptoms
                : [],


        /* ------------------------------------------------------
           ЗАМЕТКА
           ------------------------------------------------------ */

        notes:
            data.notes ||
            "",


        /* ------------------------------------------------------
           ДОПОЛНИТЕЛЬНО
           ------------------------------------------------------ */

        isNewProduct:
            Boolean(
                data.isNewProduct
            ),

        isCompleted:
            data.isCompleted ??
            true
    };


    return entry;
}


/* ============================================================
   ДОБАВИТЬ В ДНЕВНИК
   ============================================================ */

function addFoodToDiary(data = {}) {

    const entry =
        createDiaryEntry(
            data
        );


    if (
        !STATE ||
        !STATE.diary
    ) {

        console.error(
            "STATE.diary не найден"
        );

        return null;
    }


    STATE.diary.push(
        entry
    );


    /* ----------------------------------------------------------
       Если продукт попробовали впервые,
       отмечаем его как введённый.
       ---------------------------------------------------------- */

    if (
        entry.productId &&
        entry.isNewProduct &&
        typeof markProductIntroduced ===
        "function"
    ) {

        const product =
            diaryGetProduct(
                entry.productId
            );

        if (product) {

            markProductIntroduced(
                product
            );
        }
    }


    saveState();

    emitStateChange();


    return entry;
}


/* ============================================================
   ДОБАВИТЬ КУПЛЕННЫЙ ПРОДУКТ
   ============================================================ */

function addStoreFood(data = {}) {

    return addFoodToDiary({

        ...data,

        source:
            FOOD_SOURCE.STORE
    });
}


/* ============================================================
   ДОБАВИТЬ ДОМАШНЮЮ ЕДУ
   ============================================================ */

function addHomemadeFood(data = {}) {

    return addFoodToDiary({

        ...data,

        source:
            FOOD_SOURCE.HOMEMADE
    });
}


/* ============================================================
   ПОЛУЧИТЬ ДНЕВНИК
   ============================================================ */

function getDiary() {

    return Array.isArray(
        STATE?.diary
    )
        ? STATE.diary
        : [];
}


/* ============================================================
   ДНЕВНИК ЗА ДЕНЬ
   ============================================================ */

function getDiaryForDate(date) {

    return getDiary()
        .filter(
            entry =>
                entry.date === date
        );
}


/* ============================================================
   ДНЕВНИК ЗА СЕГОДНЯ
   ============================================================ */

function getTodayDiary() {

    return getDiaryForDate(
        diaryToday()
    );
}


/* ============================================================
   ИСТОРИЯ ПРОДУКТА
   ============================================================ */

function getProductDiary(productId) {

    return getDiary()
        .filter(
            entry =>
                entry.productId ===
                productId
        );
}


/* ============================================================
   ЕЛИ ЛИ ПРОДУКТ
   ============================================================ */

function hasEatenProduct(productId) {

    return getDiary()
        .some(
            entry =>
                entry.productId ===
                productId
        );
}


/* ============================================================
   ПОСЛЕДНИЙ ПРИЁМ ПРОДУКТА
   ============================================================ */

function getLastFoodEntry(productId) {

    const entries =
        getProductDiary(
            productId
        );


    if (!entries.length) {
        return null;
    }


    return entries
        .slice()
        .sort(
            (a, b) =>
                new Date(
                    b.date ||
                    b.createdAt
                ) -
                new Date(
                    a.date ||
                    a.createdAt
                )
        )[0];
}


/* ============================================================
   ИНФОРМАЦИЯ О КУПЛЕННОМ ПРОДУКТЕ
   ============================================================ */

function getStoreFoodInfo(entry) {

    if (!entry) {
        return null;
    }


    return {

        brand:
            entry.brand || "",

        productTitle:
            entry.productTitle ||
            entry.productName ||
            "",

        packageSize:
            entry.packageSize ||
            "",

        packageUnit:
            entry.packageUnit ||
            "г",

        ingredients:
            entry.ingredients ||
            "",

        labelPhoto:
            entry.labelPhoto ||
            ""
    };
}


/* ============================================================
   СОХРАНЁННЫЕ БРЕНДЫ
   ============================================================ */

function getUsedBrands() {

    const brands =
        getDiary()

            .filter(
                entry =>
                    entry.source ===
                    FOOD_SOURCE.STORE
            )

            .map(
                entry =>
                    String(
                        entry.brand ||
                        ""
                    ).trim()
            )

            .filter(Boolean);


    return [
        ...new Set(
            brands
        )
    ];
}


/* ============================================================
   БЫСТРЫЙ ВЫБОР БРЕНДА
   ============================================================ */

function searchBrands(query = "") {

    const q =
        String(query)
            .trim()
            .toLowerCase();


    const brands =
        getUsedBrands();


    if (!q) {
        return brands;
    }


    return brands.filter(
        brand =>
            brand
                .toLowerCase()
                .includes(q)
    );
}


/* ============================================================
   ЛЮБИМЫЕ ПРОДУКТЫ
   ============================================================ */

function getLikedFoods() {

    return getDiary()
        .filter(
            entry =>
                entry.liked === true
        );
}


/* ============================================================
   НЕПОНРАВИВШИЕСЯ
   ============================================================ */

function getDislikedFoods() {

    return getDiary()
        .filter(
            entry =>
                entry.liked === false
        );
}


/* ============================================================
   РЕАКЦИИ
   ============================================================ */

function getDiaryReactions() {

    return getDiary()
        .filter(
            entry =>
                entry.reaction ||
                (
                    Array.isArray(
                        entry.reactionSymptoms
                    ) &&
                    entry.reactionSymptoms
                        .length > 0
                )
        );
}


/* ============================================================
   УДАЛЕНИЕ ЗАПИСИ
   ============================================================ */

function deleteDiaryEntry(entryId) {

    if (!STATE?.diary) {
        return false;
    }


    const before =
        STATE.diary.length;


    STATE.diary =
        STATE.diary.filter(
            entry =>
                entry.id !==
                entryId
        );


    const changed =
        STATE.diary.length !==
        before;


    if (changed) {

        saveState();

        emitStateChange();
    }


    return changed;
}


/* ============================================================
   РЕДАКТИРОВАНИЕ
   ============================================================ */

function updateDiaryEntry(
    entryId,
    updates = {}
) {

    const entry =
        getDiary()
            .find(
                item =>
                    item.id ===
                    entryId
            );


    if (!entry) {
        return null;
    }


    Object.assign(
        entry,
        updates
    );


    saveState();

    emitStateChange();


    return entry;
}


/* ============================================================
   СТАТИСТИКА
   ============================================================ */

function getDiaryStats() {

    const diary =
        getDiary();


    const uniqueProducts =
        new Set(
            diary
                .map(
                    entry =>
                        entry.productId
                )
                .filter(Boolean)
        );


    const storeEntries =
        diary.filter(
            entry =>
                entry.source ===
                FOOD_SOURCE.STORE
        );


    const homemadeEntries =
        diary.filter(
            entry =>
                entry.source ===
                FOOD_SOURCE.HOMEMADE
        );


    const liked =
        diary.filter(
            entry =>
                entry.liked === true
        );


    return {

        totalEntries:
            diary.length,

        uniqueProducts:
            uniqueProducts.size,

        storeEntries:
            storeEntries.length,

        homemadeEntries:
            homemadeEntries.length,

        liked:
            liked.length,

        reactions:
            getDiaryReactions()
                .length
    };
}


/* ============================================================
   ФОРМАТ ДЛЯ КАРТОЧКИ ДНЕВНИКА
   ============================================================ */

function getDiaryCard(entry) {

    if (!entry) {
        return null;
    }


    const product =
        diaryGetProduct(
            entry.productId
        );


    const isStore =
        entry.source ===
        FOOD_SOURCE.STORE;


    return {

        id:
            entry.id,

        date:
            entry.date,

        name:
            entry.productName ||
            product?.name ||
            "Продукт",


        source:
            isStore
                ? "Куплено"
                : "Приготовлено дома",


        brand:
            isStore
                ? entry.brand || ""
                : "",


        servingForm:
            entry.servingForm ||
            "",


        amount:
            entry.amount ??
            null,


        unit:
            entry.unit ||
            "",


        liked:
            entry.liked,


        hasReaction:
            Boolean(
                entry.reaction ||
                (
                    entry.reactionSymptoms &&
                    entry.reactionSymptoms.length
                )
            ),


        notes:
            entry.notes ||
            "",


        actions: [

            {
                id: "edit",
                label: "Изменить"
            },

            {
                id: "repeat",
                label: "Повторить"
            },

            {
                id: "delete",
                label: "Удалить"
            }
        ]
    };
}


/* ============================================================
   GLOBAL
   ============================================================ */

window.FOOD_SOURCE =
    FOOD_SOURCE;

window.MEAL_TYPES =
    MEAL_TYPES;

window.createDiaryEntry =
    createDiaryEntry;

window.addFoodToDiary =
    addFoodToDiary;

window.addStoreFood =
    addStoreFood;

window.addHomemadeFood =
    addHomemadeFood;

window.getDiary =
    getDiary;

window.getDiaryForDate =
    getDiaryForDate;

window.getTodayDiary =
    getTodayDiary;

window.getProductDiary =
    getProductDiary;

window.hasEatenProduct =
    hasEatenProduct;

window.getLastFoodEntry =
    getLastFoodEntry;

window.getStoreFoodInfo =
    getStoreFoodInfo;

window.getUsedBrands =
    getUsedBrands;

window.searchBrands =
    searchBrands;

window.getLikedFoods =
    getLikedFoods;

window.getDislikedFoods =
    getDislikedFoods;

window.getDiaryReactions =
    getDiaryReactions;

window.deleteDiaryEntry =
    deleteDiaryEntry;

window.updateDiaryEntry =
    updateDiaryEntry;

window.getDiaryStats =
    getDiaryStats;

window.getDiaryCard =
    getDiaryCard;