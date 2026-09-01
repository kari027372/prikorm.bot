/* ============================================================
   utils.js
   Общие функции приложения
   ============================================================ */


/* ============================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================================ */

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}


function safeString(value) {
    return value == null ? "" : String(value);
}


/* ============================================================
   ВОЗРАСТ
   ============================================================ */

function calcAge(birthDate) {

    if (!birthDate) {
        return {
            months: 0,
            days: 0,
            totalDays: 0
        };
    }

    const birth = new Date(birthDate);
    const today = new Date();

    if (Number.isNaN(birth.getTime())) {
        return {
            months: 0,
            days: 0,
            totalDays: 0
        };
    }

    let months =
        (today.getFullYear() - birth.getFullYear()) * 12 +
        (today.getMonth() - birth.getMonth());

    if (today.getDate() < birth.getDate()) {
        months--;
    }

    months = Math.max(0, months);

    const monthStart = new Date(birth);

    monthStart.setMonth(
        birth.getMonth() + months
    );

    const days = Math.max(
        0,
        Math.floor(
            (
                today.getTime() -
                monthStart.getTime()
            ) /
            86400000
        )
    );

    const totalDays = Math.max(
        0,
        Math.floor(
            (
                today.getTime() -
                birth.getTime()
            ) /
            86400000
        )
    );

    return {
        months,
        days,
        totalDays
    };
}


/* ============================================================
   МИНИМАЛЬНЫЙ ВОЗРАСТ ПО ТИПУ ПИТАНИЯ
   ============================================================ */

function getMinAge(feedingType) {

    if (
        typeof CONFIG !== "undefined" &&
        CONFIG.minAgeByFeeding
    ) {

        return (
            CONFIG.minAgeByFeeding[
                feedingType
            ] ?? 6
        );
    }

    return 6;
}


/* ============================================================
   ЭТАП ПРИКОРМА
   ============================================================ */

function getStage(days) {

    const safeDays =
        Math.max(
            0,
            Number(days) || 0
        );


    if (
        typeof CONFIG === "undefined" ||
        !CONFIG.stages
    ) {

        return {
            id: "знакомство",
            label: "Знакомство",
            days: 1,
            meals: 1
        };
    }


    const stages =
        Object.entries(
            CONFIG.stages
        );


    let current =
        stages[0]?.[1];


    stages.forEach(
        ([id, stage]) => {

            if (
                safeDays >=
                Number(stage.days || 0)
            ) {

                current = {
                    ...stage,
                    id
                };
            }
        }
    );


    return current;
}


/* ============================================================
   ДНИ ПРИКОРМА
   ============================================================ */

function getPrikormDays(profileData) {

    const p =
        profileData ||
        (
            typeof profile !== "undefined"
                ? profile
                : null
        );


    if (!p) {
        return 0;
    }


    const start =
        p.prikorm_start_date ||
        p.prikormStartDate;


    if (!start) {
        return 0;
    }


    const startDate =
        new Date(start);

    const today =
        new Date();


    if (
        Number.isNaN(
            startDate.getTime()
        )
    ) {

        return 0;
    }


    return Math.max(
        0,
        Math.floor(
            (
                today.getTime() -
                startDate.getTime()
            ) /
            86400000
        ) + 1
    );
}


/* ============================================================
   СТАДИЯ ТЕКСТУР
   ============================================================ */

function getTextureStage(
    ageMonths,
    prikormDays = 0
) {

    const age =
        Number(ageMonths) || 0;


    if (age < 6) {

        return {
            id: "puree",
            title: "Однородная текстура",
            description:
                "Текстура подбирается индивидуально с учётом готовности ребёнка."
        };
    }


    if (age < 8) {

        return {
            id: "thick_puree",
            title: "Более густая текстура",
            description:
                "Постепенно можно переходить к более густой и неоднородной пище."
        };
    }


    if (age < 10) {

        return {
            id: "mashed",
            title: "Мягкая размятая пища",
            description:
                "Можно постепенно расширять текстуры и мягкие кусочки."
        };
    }


    return {
        id: "family_adapted",
        title: "Разнообразные текстуры",
        description:
            "Пища может становиться более разнообразной по форме и текстуре."
    };
}


/* ============================================================
   ПОЛУЧЕНИЕ ВСЕХ ПРОДУКТОВ
   ============================================================ */

function getProductsList() {

    if (
        typeof getAllProducts ===
        "function"
    ) {

        return getAllProducts();
    }


    if (
        typeof PRODUCT_DATABASE !==
        "undefined"
    ) {

        return safeArray(
            PRODUCT_DATABASE
        );
    }


    if (
        typeof PRODUCTS !==
        "undefined"
    ) {

        return safeArray(
            PRODUCTS
        );
    }


    return [];
}


/* ============================================================
   ПРОДУКТ ПО ID
   ============================================================ */

function findProduct(productId) {

    if (
        typeof getProductById ===
        "function"
    ) {

        return getProductById(
            productId
        );
    }


    return getProductsList()
        .find(
            product =>
                product.id ===
                productId
        ) || null;
}


/* ============================================================
   ПОЛУЧЕННЫЕ ПРОДУКТЫ
   ============================================================ */

function getIntroducedIds(profileData) {

    const p =
        profileData ||
        (
            typeof profile !== "undefined"
                ? profile
                : null
        );


    if (!p) {
        return [];
    }


    const values = [

        ...safeArray(
            p.introduced_foods
        ),

        ...safeArray(
            p.introducedFoods
        ),

        ...safeArray(
            p.introduced_products
        )
    ];


    return [
        ...new Set(
            values
                .map(
                    item =>
                        typeof item ===
                        "object"
                            ? item.id
                            : item
                )
                .filter(Boolean)
        )
    ];
}


/* ============================================================
   ИСКЛЮЧЁННЫЕ ПРОДУКТЫ
   ============================================================ */

function getExcludedIds(profileData) {

    const p =
        profileData ||
        (
            typeof profile !== "undefined"
                ? profile
                : null
        );


    if (!p) {
        return [];
    }


    return [
        ...new Set(

            [

                ...safeArray(
                    p.excluded_foods
                ),

                ...safeArray(
                    p.excludedFoods
                )

            ]

            .map(
                item =>
                    typeof item ===
                    "object"
                        ? item.id
                        : item
            )

            .filter(Boolean)
        )
    ];
}


/* ============================================================
   АЛЛЕРГИИ
   ============================================================ */

function getAllergies(profileData) {

    const p =
        profileData ||
        (
            typeof profile !== "undefined"
                ? profile
                : null
        );


    return safeArray(
        p?.allergies
    );
}


/* ============================================================
   ДОСТУПНЫЕ ПРОДУКТЫ
   ============================================================ */

function getAvailableProducts(
    profileData,
    products = getProductsList()
) {

    const p =
        profileData ||
        {};


    const ageData =
        p.birth_date
            ? calcAge(
                p.birth_date
            )
            : {
                months:
                    Number(
                        p.age_months
                    ) || 0
            };


    const age =
        ageData.months;


    const feeding =
        p.feeding_type ||
        p.feedingType;


    const minAge =
        getMinAge(
            feeding
        );


    const introduced =
        new Set(
            getIntroducedIds(p)
        );


    const excluded =
        new Set(
            getExcludedIds(p)
        );


    const allergies =
        new Set(
            getAllergies(p)
                .map(
                    x =>
                        safeString(x)
                            .toLowerCase()
                )
        );


    /*
       ВАЖНО:
       Здесь мы не запрещаем продукт только потому,
       что он потенциально аллергенный.
       Аллергенность отображается через safety.js.
    */

    return safeArray(products)
        .filter(
            product => {

                const productAge =
                    Number(
                        product.min_age
                    );


                if (
                    Number.isFinite(
                        productAge
                    ) &&
                    productAge > age
                ) {

                    return false;
                }


                if (
                    excluded.has(
                        product.id
                    )
                ) {

                    return false;
                }


                const name =
                    safeString(
                        product.name
                    )
                        .toLowerCase();


                /*
                   Если продукт уже введён,
                   он не попадает в список НОВЫХ,
                   но может использоваться
                   для повторения.
                */

                if (
                    introduced.has(
                        product.id
                    )
                ) {

                    return false;
                }


                /*
                   Явно отмеченные аллергии
                   пользователя не рекомендуем
                   как новый продукт.
                */

                if (
                    allergies.has(name)
                ) {

                    return false;
                }


                return true;
            }
        );
}


/* ============================================================
   СЛЕДУЮЩИЙ НОВЫЙ ПРОДУКТ
   ============================================================ */

function getNextProduct(
    profileData,
    products = getProductsList()
) {

    const available =
        getAvailableProducts(
            profileData,
            products
        );


    if (!available.length) {
        return null;
    }


    if (
        typeof scoreProduct ===
        "function"
    ) {

        return rankProducts(
            available,
            {
                prioritizeIron: true
            }
        )[0]?.product || null;
    }


    return available[0];
}


/* ============================================================
   СТАТУС ПРОДУКТА
   ============================================================ */

function getProductStatus(
    profileData,
    productId
) {

    const introduced =
        getIntroducedIds(
            profileData
        );


    const excluded =
        getExcludedIds(
            profileData
        );


    if (
        introduced.includes(
            productId
        )
    ) {

        return "introduced";
    }


    if (
        excluded.includes(
            productId
        )
    ) {

        return "excluded";
    }


    const product =
        findProduct(
            productId
        );


    if (
        product &&
        product.allergen
    ) {

        return "allergen";
    }


    return "new";
}


/* ============================================================
   АКТИВНЫЙ СТАТУС ПРОДУКТА
   ============================================================ */

function activeProductStatus(
    profileData,
    productId
) {

    return getProductStatus(
        profileData,
        productId
    );
}


/* ============================================================
   БЕЗОПАСНОСТЬ
   ============================================================ */

function getSafetyWarning(
    product
) {

    if (
        typeof product ===
        "string"
    ) {

        product =
            getProductsList()
                .find(
                    item =>
                        item.name ===
                        product
                );
    }


    if (!product) {
        return null;
    }


    if (
        typeof getProductWarning ===
        "function"
    ) {

        return getProductWarning(
            product
        );
    }


    return null;
}


/* ============================================================
   ПЛАН НА ДЕНЬ
   ============================================================ */

function generateDailyPlan(
    profileData,
    products = getProductsList()
) {

    const p =
        profileData ||
        {};


    const stage =
        getStage(
            getPrikormDays(p)
        );


    let recommendations = [];


    if (
        typeof getTodayRecommendations ===
        "function"
    ) {

        recommendations =
            getTodayRecommendations();
    }


    /*
       Если новый движок рекомендаций
       ещё не доступен — используем
       базовый подбор.
    */

    if (
        !recommendations.length
    ) {

        const next =
            getNextProduct(
                p,
                products
            );


        if (next) {

            recommendations.push({

                type:
                    "next_product",

                product:
                    next,

                reasons: [
                    "Подходит для знакомства"
                ]
            });
        }
    }


    const meals =
        Math.max(
            1,
            Number(
                stage?.meals
            ) || 1
        );


    return {

        date:
            new Date()
                .toISOString()
                .slice(0, 10),

        stage:

            stage?.id ||
            "знакомство",

        meals,

        recommendations
    };
}


/* ============================================================
   ДНИК ПРИКОРМА — УНИВЕРСАЛЬНАЯ ПРОВЕРКА
   ============================================================ */

function isProductIntroduced(
    productId
) {

    if (
        typeof hasEatenProduct ===
        "function"
    ) {

        return hasEatenProduct(
            productId
        );
    }


    return false;
}


/* ============================================================
   ФОРМАТИРОВАНИЕ ДАТЫ
   ============================================================ */

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "";
    }


    return d.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long"
        }
    );
}


/* ============================================================
   UUID
   ============================================================ */

function createId(
    prefix = "item"
) {

    return (

        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)

    );
}


/* ============================================================
   МИГРАЦИЯ СТАРОЙ СИСТЕМЫ
   ============================================================ */

function migrateData() {

    const oldKey =
        "prikorm_app_v2";

    const newKey =
        "prikorm_app_v3";


    const oldData =
        localStorage.getItem(
            oldKey
        );


    const newData =
        localStorage.getItem(
            newKey
        );


    if (
        !oldData ||
        newData
    ) {

        return false;
    }


    try {

        const parsed =
            JSON.parse(
                oldData
            );


        if (
            !Array.isArray(
                parsed.loved_foods
            )
        ) {

            parsed.loved_foods = [];
        }


        if (
            !Array.isArray(
                parsed.disliked_foods
            )
        ) {

            parsed.disliked_foods = [];
        }


        if (
            !Array.isArray(
                parsed.water_log
            )
        ) {

            parsed.water_log = [];
        }


        if (
            !Array.isArray(
                parsed.notes
            )
        ) {

            parsed.notes = [];
        }


        if (
            !Array.isArray(
                parsed.diary
            )
        ) {

            parsed.diary = [];
        }


        localStorage.setItem(
            newKey,
            JSON.stringify(
                parsed
            )
        );


        console.log(
            "✅ Старые данные перенесены"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Ошибка миграции:",
            error
        );


        return false;
    }
}


/* ============================================================
   GLOBAL
   ============================================================ */

window.safeArray =
    safeArray;

window.safeString =
    safeString;

window.calcAge =
    calcAge;

window.getMinAge =
    getMinAge;

window.getStage =
    getStage;

window.getPrikormDays =
    getPrikormDays;

window.getTextureStage =
    getTextureStage;

window.getProductsList =
    getProductsList;

window.findProduct =
    findProduct;

window.getIntroducedIds =
    getIntroducedIds;

window.getExcludedIds =
    getExcludedIds;

window.getAllergies =
    getAllergies;

window.getAvailableProducts =
    getAvailableProducts;

window.getNextProduct =
    getNextProduct;

window.getProductStatus =
    getProductStatus;

window.activeProductStatus =
    activeProductStatus;

window.getSafetyWarning =
    getSafetyWarning;

window.generateDailyPlan =
    generateDailyPlan;

window.isProductIntroduced =
    isProductIntroduced;

window.formatDate =
    formatDate;

window.createId =
    createId;

window.migrateData =
    migrateData;