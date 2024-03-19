import { fetchInternalPhoneNumber } from '@/services/api/vts/index'
import { Regular } from '@/views/vts/utils'
export default {
    computed: {
        orderAddresserName () {
            return {
                required: true,
                validator: this.validorderAddresserName,
                trigger: 'change'
            }
        },
        orderAddresserPhone () {
            return {
                required: true,
                validator: this.validFetchInternalPhoneNumber,
                trigger: 'change'
            }

        },
        loadingTime () {
            return {
                required: true,
                message: '请选择装货时间',
                trigger: 'change'
            }
        },
        startDetailedAddress () {
            return {
                required: true,
                validator: this.validorderAddresser,
                trigger: 'change'
            }
            // return {
            //     required: true,
            //     message: '请输入寄方地址信息',
            //     trigger: 'change'
            // }
        },
        orderContactName () {
            return {
                required: true,
                validator: this.validorderAddresserName,
                trigger: 'change'
            }
        },
        orderContactPhone () {
            return {
                required: true,
                validator: this.validFetchInternalPhoneNumber,
                trigger: 'change'
            }
        },
        requireArrivalTime () {
            return {
                required: true,
                validator: this.validrequireArrivalTime,
                trigger: 'change'
            }
        },
        endDetailedAddress () {
            return {
                required: true,
                validator: this.validorderEndAddresser,
                trigger: 'change'
            }
            // return {
            //     required: true,
            //     message: '请输入收方地址信息',
            //     trigger: 'change'
            // }
        }
    },
    methods: {
        // 校验是否内部员工手机号
        async validFetchInternalPhoneNumber (rule, val, cb) {
            console.log(val, '联系方式校验')
            let regular = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
            if (val === '') cb(new Error('请填写11位手机号'))
            if (!regular.test(val)) cb(new Error('请填写正确的手机号'))
            let _res = await fetchInternalPhoneNumber({ phone: val })
            let _inside = _res.data.inside
            if (_inside) {
                cb(new Error('该手机号是内部员工手机号'))
            } else {
                cb()
            }
        },
        // 姓名校验
        validorderAddresserName (rule, value, callback) {
            console.log(value, 'value')
            if (value) {
                if (/^(?![0-9]+$)[\u4E00-\u9FFFa-zA-Z0-9]{2,10}$/.test(value)) {
                    callback()
                } else {
                    callback(Error('请输入2-10位合法的名称'))
                }
            } else {
                callback(Error('请输入姓名'))
            }
        },
        // 地址校验
        validorderAddresser (rule, value, callback) {
            callback()
            // console.log(this.$refs.startDetailedAddress.errorMsgOfdistrict, value, this.userFormInfo.startAddress, '-->寄件');
            // let { detailAddress, districtList } = this.userFormInfo.startAddress
            // if (districtList.length && detailAddress) {
            //     callback()
            // } else {
            //     if (this.$refs.startDetailedAddress.errorMsgOfdistrict) {
            //         callback(Error(this.$refs.startDetailedAddress.errorMsgOfdistrict))
            //     } else {
            //         callback(Error())
            //     }
            // }
        },
        validorderEndAddresser (rule, value, callback) {
            callback()
            // let { detailAddress, districtList } = this.userFormInfo.endAddress
            // if (districtList.length && detailAddress) {
            //     callback()
            // } else {
            //     if (this.$refs.endDetailedAddress.errorMsgOfdistrict) {
            //         callback(Error(this.$refs.endDetailedAddress.errorMsgOfdistrict))
            //     } else {
            //         callback(Error('请输入收件地址信息'))
            //     }
            // }
        },
        validrequireArrivalTime (rule, value, callback) {
            console.log(this.cpForReceiverPicker, value, '=======');

            if (this.cpForReceiverPicker || value) {
                callback()
            } else {
                callback(Error('请选择期望到货时间'))
            }
        }
    }
}