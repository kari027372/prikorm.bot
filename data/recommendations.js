/* ============================================================
   recommendations.js
   Умные рекомендации прикорма
   ============================================================ */


/* ============================================================
   НАСТРОЙКИ
   ============================================================ */

const RECOMMENDATION_TYPES = {

    NEXT_PRODUCT: "next_product",

    REPEAT_PRODUCT: "repeat_product",

    VARIETY: "variety",

    IRON: "iron",

    ALLERGEN: "allergen",

    TEXTURE: "texture",

    RECIPE: "recipe",

    PANTRY: "pantry"
};


/* ============================================================
   ПОЛУЧЕНИЕ ДАННЫХ МАЛЫША
   ============================================================ */

function getRecommendationBaby() {

    if (typeof getBaby === "function") {

        return getBaby();
    }

    return STATE?.baby || {};
}


/* ============================================================
   ВОЗРАСТ
   ============================================================ */

function getBabyAgeMonths() {

    const baby =
        getRecommendationBaby();

    if (!baby.birthDate) {
        return null;
    }

    const birth =
        new Date(baby.birthDate);

    const today =
        new Date();

    let months =
        (today.getFullYear() -
            birth.getFullYear()) * 12;

    months +=
        today.getMonth() -
        birth.getMonth();

    if (
        today.getDate() <
        birth.getDate()
    ) {

        months--;
    }

    return Math.max(
        0,
        months
    );
}


/* ============================================================
   ВВЕДЁННЫЕ ПРОДУКТЫ
   ============================================================ */

function getIntroducedProductIds() {

    const introduced =
        STATE?.products?.introduced || [];

    return introduced
        .map(
            item =>
                typeof item === "object"
                    ? item.id
                    : item
        )
        .filter(Boolean);
}


/* ============================================================
   ПОЛУЧЕНИЕ ИСТОРИИ
   ============================================================ */

function getFoodHistory() {

    return Array.isArray(
        STATE?.diary
    )
        ? STATE.diary
        : [];
}


/* ============================================================
   БЫЛ ЛИ ПРОДУКТ НЕДАВНО
   ============================================================ */

function wasProductEatenRecently(
    productId,
    days = 3
) {

    const history =
        getFoodHistory();

    const limit =
        Date.now() -
        days * 24 * 60 * 60 * 1000;

    return history.some(
        entry => {

            if (
                entry.productId !==
                productId
            ) {
                return false;
            }

            const date =
                new Date(
                    entry.date ||
                    entry.createdAt
                )
                    .getTime();

            return date >= limit;
        }
    );
}


/* ============================================================
   КОГДА ПРОДУКТ ЕЛИ ПОСЛЕДНИЙ РАЗ
   ============================================================ */

function getLastProductDate(
    productId
) {

    const history =
        getFoodHistory();

    const dates =
        history

            .filter(
                entry =>
                    entry.productId ===
                    productId
            )

            .map(
                entry =>
                    new Date(
                        entry.date ||
                        entry.createdAt
                    ).getTime()
            )

            .filter(
                Number.isFinite
            );

    if (!dates.length) {
        return null;
    }

    return new Date(
        Math.max(...dates)
    );
}


/* ============================================================
   ДАВНО НЕ БЫЛО
   ============================================================ */

function getProductsNotEatenRecently(
    products,
    days = 7
) {

    return products.filter(
        product =>
            !wasProductEatenRecently(
                product.id,
                days
            )
    );
}


/* ============================================================
   ПОДХОД
   ============================================================ */

function getBabyApproach() {

    const baby =
        getRecommendationBaby();

    return (
        baby.approach ||
        STATE?.settings?.approach ||
        "mixed"
    );
}


/* ============================================================
   БАЗОВЫЕ КАНДИДАТЫ
   ============================================================ */

function getRecommendationCandidates() {

    const age =
        getBabyAgeMonths();

    let products =
        typeof getAllProducts === "function"
            ? getAllProducts()
            : PRODUCT_DATABASE || [];


    /*
       Возраст используется как фильтр базы,
       а не как самостоятельное медицинское
       решение.
    */

    if (age !== null) {

        products =
            products.filter(
                product =>
                    Number(
                        product.min_age || 0
                    ) <= age
            );
    }


    const introduced =
        new Set(
            getIntroducedProductIds()
        );


    return products.filter(
        product =>
            !introduced.has(
                product.id
            )
    );
}


/* ============================================================
   ОЦЕНКА КАНДИДАТА
   ============================================================ */

function scoreProduct(
    product,
    options = {}
) {

    let score = 0;

    const reasons = [];


    /* ----------------------------------------------------------
       Новый продукт
       ---------------------------------------------------------- */

    if (
        !getIntroducedProductIds()
            .includes(product.id)
    ) {

        score += 20;

        reasons.push(
            "Новый продукт для знакомства"
        );
    }


    /* ----------------------------------------------------------
       Разнообразие
       ---------------------------------------------------------- */

    if (
        !wasProductEatenRecently(
            product.id,
            7
        )
    ) {

        score += 10;

        reasons.push(
            "Давно не встречался в рационе"
        );
    }


    /* ----------------------------------------------------------
       Железо
       ---------------------------------------------------------- */

    if (
        options.prioritizeIron &&
        product.iron
    ) {

        score += 20;

        reasons.push(
            "Источник железа"
        );
    }


    /* ----------------------------------------------------------
       Аллерген
       ---------------------------------------------------------- */

    if (
        options.prioritizeAllergens &&
        product.allergen
    ) {

        score += 10;

        reasons.push(
            "Потенциальный аллерген"
        );
    }


    /* ----------------------------------------------------------
       BLW
       ---------------------------------------------------------- */

    if (
        getBabyApproach() === "blw" &&
        typeof supportsBLW === "function" &&
        supportsBLW(product)
    ) {

        score += 10;

        reasons.push(
            "Подходит для BLW-формата"
        );
    }


    /* ----------------------------------------------------------
       ПЮРЕ
       ---------------------------------------------------------- */

    if (
        getBabyApproach() === "puree" &&
        typeof supportsPuree === "function" &&
        supportsPuree(product)
    ) {

        score += 10;

        reasons.push(
            "Можно использовать в формате пюре"
        );
    }


    /* ----------------------------------------------------------
       Риск
       ---------------------------------------------------------- */

    if (
        typeof getChokingRisk === "function"
    ) {

        const risk =
            getChokingRisk(product);

        if (
            risk.level?.id === "high"
        ) {

            score -= 5;

            reasons.push(
                "Требует особого внимания к форме подачи"
            );
        }
    }


    return {

        score,

        reasons
    };
}


/* ============================================================
   ЛУЧШИЕ КАНДИДАТЫ
   ============================================================ */

function rankProducts(
    products,
    options = {}
) {

    return products

        .map(
            product => {

                const scoring =
                    scoreProduct(
                        product,
                        options
                    );

                return {

                    product,

                    score:
                        scoring.score,

                    reasons:
                        scoring.reasons
                };
            }
        )

        .sort(
            (a, b) =>
                b.score -
                a.score
        );
}


/* ============================================================
   СЛЕДУЮЩИЙ ПРОДУКТ
   ============================================================ */

function getNextProductRecommendation() {

    const candidates =
        getRecommendationCandidates();

    if (!candidates.length) {

        return null;
    }

    const ranked =
        rankProducts(
            candidates,
            {
                prioritizeIron: true
            }
        );

    return {

        type:
            RECOMMENDATION_TYPES
                .NEXT_PRODUCT,

        product:
            ranked[0].product,

        score:
            ranked[0].score,

        reasons:
            ranked[0].reasons
    };
}


/* ============================================================
   ИДЕИ ДЛЯ РАЗНООБРАЗИЯ
   ============================================================ */

function getVarietyRecommendations(
    limit = 5
) {

    const candidates =
        getRecommendationCandidates();


    const ranked =
        rankProducts(
            candidates,
            {}
        );


    return ranked
        .slice(0, limit)
        .map(
            item => ({

                type:
                    RECOMMENDATION_TYPES
                        .VARIETY,

                product:
                    item.product,

                score:
                    item.score,

                reasons:
                    item.reasons
            })
        );
}


/* ============================================================
   ЖЕЛЕЗО
   ============================================================ */

function getIronRecommendations(
    limit = 5
) {

    const candidates =
        getRecommendationCandidates()
            .filter(
                product =>
                    product.iron === true
            );


    const ranked =
        rankProducts(
            candidates,
            {
                prioritizeIron: true
            }
        );


    return ranked
        .slice(0, limit)
        .map(
            item => ({

                type:
                    RECOMMENDATION_TYPES
                        .IRON,

                product:
                    item.product,

                score:
                    item.score,

                reasons:
                    item.reasons
            })
        );
}


/* ============================================================
   АЛЛЕРГЕНЫ
   ============================================================ */

function getAllergenRecommendations(
    limit = 5
) {

    const candidates =
        getRecommendationCandidates()
            .filter(
                product =>
                    product.allergen === true
            );


    return rankProducts(
        candidates,
        {
            prioritizeAllergens: true
        }
    )

        .slice(0, limit)

        .map(
            item => ({

                type:
                    RECOMMENDATION_TYPES
                        .ALLERGEN,

                product:
                    item.product,

                score:
                    item.score,

                reasons:
                    item.reasons
            })
        );
}


/* ============================================================
   ПРОДУКТЫ, КОТОРЫЕ ДАВНО НЕ ЕЛИ
   ============================================================ */

function getRepeatRecommendations(
    limit = 5
) {

    const introduced =
        getIntroducedProductIds();


    const products =
        introduced
            .map(
                id =>
                    typeof getProductById ===
                    "function"
                        ? getProductById(id)
                        : null
            )
            .filter(Boolean);


    const oldProducts =
        getProductsNotEatenRecently(
            products,
            7
        );


    return oldProducts

        .map(
            product => ({

                product,

                lastDate:
                    getLastProductDate(
                        product.id
                    )
            })
        )

        .sort(
            (a, b) => {

                const aTime =
                    a.lastDate
                        ? a.lastDate.getTime()
                        : 0;

                const bTime =
                    b.lastDate
                        ? b.lastDate.getTime()
                        : 0;

                return aTime - bTime;
            }
        )

        .slice(0, limit)

        .map(
            item => ({

                type:
                    RECOMMENDATION_TYPES
                        .REPEAT_PRODUCT,

                product:
                    item.product,

                lastDate:
                    item.lastDate,

                reasons: [
                    "Давно не было в рационе"
                ]
            })
        );
}


/* ============================================================
   ПРОДУКТЫ ИЗ ДОМА
   ============================================================ */

function getPantryRecommendations(
    limit = 5
) {

    const pantry =
        STATE?.pantry || [];


    const products =
        pantry

            .map(
                item =>
                    typeof getProductById ===
                    "function"
                        ? getProductById(
                            item.id
                        )
                        : null
            )

            .filter(Boolean);


    return products

        .slice(0, limit)

        .map(
            product => ({

                type:
                    RECOMMENDATION_TYPES
                        .PANTRY,

                product,

                reasons: [
                    "Есть дома"
                ]
            })
        );
}


/* ============================================================
   РЕКОМЕНДАЦИЯ НА СЕГОДНЯ
   ============================================================ */

function getTodayRecommendations() {

    const result = [];


    /* Новый продукт */

    const next =
        getNextProductRecommendation();

    if (next) {

        result.push(next);
    }


    /* Железо */

    const iron =
        getIronRecommendations(2);

    result.push(
        ...iron
    );


    /* Разнообразие */

    const variety =
        getVarietyRecommendations(2);

    result.push(
        ...variety
    );


    /* Продукты, которые давно не ели */

    const repeat =
        getRepeatRecommendations(2);

    result.push(
        ...repeat
    );


    /*
       Удаляем повторения
    */

    const unique = [];

    const used =
        new Set();


    result.forEach(
        recommendation => {

            const id =
                recommendation
                    .product
                    ?.id;

            if (
                !id ||
                used.has(id)
            ) {
                return;
            }

            used.add(id);

            unique.push(
                recommendation
            );
        }
    );


    return unique;
}


/* ============================================================
   ГЛАВНАЯ РЕКОМЕНДАЦИЯ
   ============================================================ */

function getMainRecommendation() {

    const recommendations =
        getTodayRecommendations();


    if (!recommendations.length) {

        return {

            type: "empty",

            title:
                "Продолжайте вести дневник",

            description:
                "Когда появятся новые записи, приложение сможет предложить персональные идеи."
        };
    }


    const first =
        recommendations[0];


    return {

        ...first,

        title:
            getRecommendationTitle(
                first
            ),

        description:
            getRecommendationDescription(
                first
            )
    };
}


/* ============================================================
   ЗАГОЛОВОК
   ============================================================ */

function getRecommendationTitle(
    recommendation
) {

    switch (
        recommendation.type
    ) {

        case RECOMMENDATION_TYPES
            .NEXT_PRODUCT:

            return "Можно познакомиться с новым продуктом";


        case RECOMMENDATION_TYPES
            .REPEAT_PRODUCT:

            return "Можно повторить знакомый продукт";


        case RECOMMENDATION_TYPES
            .IRON:

            return "Идея для продукта с железом";


        case RECOMMENDATION_TYPES
            .VARIETY:

            return "Идея для разнообразия";


        case RECOMMENDATION_TYPES
            .ALLERGEN:

            return "Аллергенный продукт";


        case RECOMMENDATION_TYPES
            .PANTRY:

            return "Можно приготовить из того, что есть дома";


        default:

            return "Идея для прикорма";
    }
}


/* ============================================================
   ОПИСАНИЕ
   ============================================================ */

function getRecommendationDescription(
    recommendation
) {

    if (
        !recommendation ||
        !recommendation.product
    ) {

        return "";
    }


    const product =
        recommendation.product;


    if (
        recommendation.reasons &&
        recommendation.reasons.length
    ) {

        return recommendation
            .reasons[0];
    }


    return product.desc || "";
}


/* ============================================================
   РЕКОМЕНДАЦИЯ ДЛЯ КАРТОЧКИ
   ============================================================ */

function getRecommendationCard(
    recommendation
) {

    if (!recommendation) {
        return null;
    }


    const product =
        recommendation.product;


    if (!product) {
        return recommendation;
    }


    const safety =
        typeof getProductWarning ===
        "function"

            ? getProductWarning(product)

            : null;


    return {

        type:
            recommendation.type,

        productId:
            product.id,

        name:
            product.name,

        category:
            product.category ||
            product.cat,

        title:
            getRecommendationTitle(
                recommendation
            ),

        description:
            getRecommendationDescription(
                recommendation
            ),

        reasons:
            recommendation.reasons || [],

        safety,

        actions: [

            {
                id: "view_product",
                label: "Посмотреть продукт"
            },

            {
                id: "add_to_plan",
                label: "Добавить в план"
            },

            {
                id: "mark_introduced",
                label: "Попробовали"
            }
        ]
    };
}


/* ============================================================
   ПОЛНАЯ ЛЕНТА РЕКОМЕНДАЦИЙ
   ============================================================ */

function getRecommendationFeed() {

    const recommendations =
        getTodayRecommendations();


    return recommendations
        .map(
            getRecommendationCard
        )
        .filter(Boolean);
}


/* ============================================================
   GLOBAL
   ============================================================ */

window.RECOMMENDATION_TYPES =
    RECOMMENDATION_TYPES;

window.getBabyAgeMonths =
    getBabyAgeMonths;

window.getIntroducedProductIds =
    getIntroducedProductIds;

window.wasProductEatenRecently =
    wasProductEatenRecently;

window.getLastProductDate =
    getLastProductDate;

window.getRecommendationCandidates =
    getRecommendationCandidates;

window.scoreProduct =
    scoreProduct;

window.rankProducts =
    rankProducts;

window.getNextProductRecommendation =
    getNextProductRecommendation;

window.getVarietyRecommendations =
    getVarietyRecommendations;

window.getIronRecommendations =
    getIronRecommendations;

window.getAllergenRecommendations =
    getAllergenRecommendations;

window.getRepeatRecommendations =
    getRepeatRecommendations;

window.getPantryRecommendations =
    getPantryRecommendations;

window.getTodayRecommendations =
    getTodayRecommendations;

window.getMainRecommendation =
    getMainRecommendation;

window.getRecommendationCard =
    getRecommendationCard;

window.getRecommendationFeed =
    getRecommendationFeed;