import { Regular } from '@/views/vts/utils'
export default {
    computed: {
        goodsValueFee () {
            return {
                required: true,
                validator: this.validGoodsValueFee,
                trigger: 'change'
            }

        },
    },
    methods: {
        // 校验货物价值
        async validGoodsValueFee (rule, val, cb) {
            if (val === '' || val == undefined) cb(new Error('请输入货物价值'))
            if (!Regular._currency.test(val)) cb(new Error('仅支持数字及保留一位小数'))
            if (val > 1000) cb(new Error('请填写范围0~1000'))
        }
    }
}