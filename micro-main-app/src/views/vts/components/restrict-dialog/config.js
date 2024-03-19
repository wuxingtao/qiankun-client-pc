var abnormalType = {
    10: { // 疫情
        name: '疫情',
        icon: 'restrict-yq',
        class: 'restrict-yq',
    },
    20: { // 台风天气
        name: '台风天气',
        icon: 'restrict-wind',
        class: 'restrict-tf',
    },
    30: { // 雨雪天气
        name: '雨雪天气',
        icon: 'restrict-snow',
        class: 'restrict-tf',
    },
    40: { // 汛期影响
        name: '汛期影响',
        icon: 'restrict-rain',
        class: 'restrict-xq',
    },
    50: { // 假期影响
        name: '假期影响',
        icon: 'restrict-holiday',
        class: 'restrict-jq',
    },
    60: { // 春运期间
        name: '春运期间',
        icon: 'restrict-cy',
        class: 'restrict-jq',
    },
    70: { // 国际大型会议
        name: '国际大型会议',
        icon: 'restrict-gjdxhy',
        class: 'restrict-tf',
    },
    80: { // 其他
        name: '其他',
        icon: 'restrict-other',
        class: 'restrict-yq',
    }
}

export {
    abnormalType
}