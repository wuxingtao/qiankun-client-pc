import store from '@/store'
import { queryAddressBook } from '@/services/api/address'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { getRestrict } from '@/services/api/vts'
import dayjs from 'dayjs'
const authorityIds = store.getters.authorityIds
console.log(authorityIds, 'authorityIds');

export default {
    data () {
        return {
            customerCode: getCustomerCode(),
            phone: getPhone(),
        }
    },
    methods: {
        async validRestrict () {
            let { startAddress,
                endAddress,
                loadingTime,
                requireArrivalTime,
                startProvinceCode: provinceCode,
                startCityCode: cityCode,
                startCountyCode: areaCode,
                startTownCode: townCode,
                startTown: town,
                startLat: lat,
                startLng: lon,
                endProvinceCode: endProvinceCode,
                endCityCode: endCityCode,
                endCountyCode: endAreaCode,
                endTownCode: endTownCode,
                endTown: endTown,
                endLat: endLat,
                endLng: endLng
            } = this.userFormInfo // 用户填写的信息
            if (!loadingTime || !requireArrivalTime || !startAddress || !endAddress || !endLat || !endLng || !lat || !lon) return
            let deliveryInfo = {
                province: startAddress.districtList[0],
                provinceCode,
                city: startAddress.districtList[1],
                cityCode,
                area: startAddress.districtList[2],
                areaCode,
                town,
                townCode,
                address: startAddress.detailAddress,
                deliverTime: dayjs(loadingTime).format('YYYY-MM-DD HH:mm:ss'),
                lat,
                lon
            }
            let pickupInfo = {
                province: endAddress.districtList[0],
                provinceCode: endProvinceCode,
                city: endAddress.districtList[1],
                cityCode: endCityCode,
                area: endAddress.districtList[2],
                areaCod: endAreaCode,
                address: endAddress.detailAddress,
                town: endTown,
                townCode: endTownCode,
                preDispatchTime: dayjs(requireArrivalTime).format('YYYY-MM-DD HH:mm:ss'),
                lat: endLat,
                lon: endLng
            }
            let params = {
                requestId: new Date().getTime(),
                customerCode: this.customerCode,
                channelCode: '8', // 渠道编码，ecs自己的字典值，后端根据字典值映射地图的渠道编码
                operationType: '10', // 10下单，20详情
                deliveryInfo,
                pickupInfo,
                serviceType: '240', // 服务方式 common_service_type 官网PC只有普通整车
            }
            let res = await getRestrict(params)
            if (res && res.data && res.data.length && res.data[0].limitType !== '30') {
                this.restrictOptions = {
                    show: true,
                    ...res.data[0]
                }
                this.disableOrder = res.data[0].limitType === '10'
            }
        },
        // 打开地址簿
        showAddressBook (type) {
            type === "send" ? this.addressType = "10" : this.addressType = "20"
            this.visibleOfaddressBook = true
        },
        /**
     * 查询地址薄数据
     * @param {*} addressType 寄方：10，收方：20
     * @param {*} queryString
     * @param {*} pageSize
     */
        async queryContactList (addressType, queryString, pageSize = 50) {
            const params = {
                phone: this.phone,
                customerCode: authorityIds.includes('031') ? this.customerCode : '',
                addressType: addressType,
                page: 1,
                pageSize: pageSize,
                keyword: queryString,
            }
            const res = await queryAddressBook(params)
            if (res.code === 0) {
                return res.data.rows.map((r) =>
                    Object.assign(r, {
                        address: r.province + r.city + r.area + r.address,
                        detailAddress: r.address,
                    })
                )
            }
            return []
        },
    },
    // mounted () {
    //     setTimeout(() => {
    //         console.clear()
    //     }, 3000)
    // }
}