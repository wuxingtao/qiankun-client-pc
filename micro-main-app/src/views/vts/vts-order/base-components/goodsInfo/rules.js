import { fetchIsContraban } from '@/services/api/vts/index'
import { Regular } from '@/views/vts/utils'
export default {
    data () {
        return {
            goodsVolumeRulesFlag: false
        }
    },
    computed: {
        goodsName () {
            return {
                required: true,
                validator: this.validFetchIsContraban,
                trigger: 'change'
            }

        },
        packageType () {
            return {
                required: true,
                validator: this.validpackageType,
                trigger: 'change'
            }
        },
        goodsWeight () {
            return {
                required: true,
                validator: this.validGoodsWeight,
                trigger: 'change'
            }
        },
        goodsVolume () {
            return {
                required: this.goodsVolumeRulesFlag,
                validator: this.validGoodsVolume,
                trigger: 'change'
            }
        }
    },
    methods: {
        // 校验是否禁止托运物
        async validFetchIsContraban (rule, val, cb) {
            console.log(val, '托寄物')
            if (val === '' || val == undefined) cb(new Error('请输入货物名称'))
            try {
                let _res = await fetchIsContraban({ contrabandName: val, queryMode: '1' })
                let _contraban = _res.data
                if ((_contraban && _contraban.length === 0) || (_contraban && +_contraban[0]['landable'] === 10)) {
                    cb()
                } else if (+_res.code == 0) {
                    cb(new Error('该商品禁止托运'))
                } else {
                    cb(new Error('托寄物校验失败，请重新输入校验'))
                }
            } catch (error) {
                cb(new Error('托寄物校验失败，请重新输入'))
            }
        },
        validGoodsWeight (rule, val, cb) {
            console.log(val);
            let { carMinWeight, carMaxWeight } = this.carInfo
            if (val === '' || val == undefined) cb(new Error('请输入货物重量'))
            if (!Regular.currency.test(val)) cb(new Error('仅支持数字及保留俩位小数'))
            let min = ''
            let max = ''
            if (carMinWeight && carMaxWeight) {
                min = carMinWeight / 1000
                max = carMaxWeight / 1000
                if (val < min || val > max) {
                    cb(new Error(`请填写范围${min}~${max}`))
                } else {
                    cb()
                }
            } else {
                cb()
            }
        },
        validGoodsVolume (rule, val, cb) {
            console.log(val, this.carInfo, '体积');
            if (val === '' || val == undefined) {
                // this.goodsVolumeRulesFlag = false
                cb()
            }
            if (!Regular.currency.test(val)) {
                // this.goodsVolumeRulesFlag = true
                cb(new Error('仅支持数字及保留俩位小数'))
            }
            let { carMinCubage, carCubage } = this.carInfo
            if (carMinCubage || (carCubage && val)) {
                // this.goodsVolumeRulesFlag = true
                if (val > carCubage || val < carMinCubage) {
                    cb(new Error(`请填写范围${carMinCubage}~${carCubage}`))
                } else {
                    cb()
                }
            } else {
                cb()
            }
        },
        validpackageType (rule, val, cb) {
            if (this.packageTypeDisabled || val) {
                cb()
            } else {
                cb(new Error(`请选择包装类型`))
            }
        }
    }
}