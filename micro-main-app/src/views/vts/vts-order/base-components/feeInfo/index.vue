<template>
  <section class="fee-info page-style1">
    <el-form class="formInfo"
             :model="feeInfo"
             label-position="top"
             label-width="88px"
             ref="feeInfo">
      <div class="title">
        <img src="../../../../../assets/image/vts/fee.png"
             class="title-icon" />增值服务
      </div>
      <el-row :gutter="16">

        <el-col :span="6">
          <el-form-item label="货物价值(万元)"
                        prop="goodsValueFee"
                        :rules="goodsValueFee">
            <el-input placeholder="请填写范围0~1000"
                      v-model="feeInfo.goodsValueFee"
                      clearable>
            </el-input>
            <!-- <p class="valuation"
               v-if="valuationFee">保价费：<span class="light">{{valuationFee}} 元</span></p> -->
            <p class="valuation"
               v-if="valuationFee"><span class="light">
                <tip-normal :msg='valuationFee' />
              </span></p>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="装货服务"
                        prop="loadService">
            <el-select v-model="feeInfo.loadService"
                       filterable
                       placeholder="请选择"
                       @change="loadServiceChange"
                       :disabled="cpLoadService">
              <el-option v-for="item in loadServiceOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
            <!-- <span class="serveTip"
                  v-if="cpLoadService">{{cpLoadServiceText}}</span> -->
            <span class="serveTip"
                  v-if="cpLoadService">
              <tip-normal :msg='cpLoadServiceText' />
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="卸货服务"
                        prop="unloadService">
            <el-select v-model="feeInfo.unloadService"
                       filterable
                       placeholder="请选择"
                       @change="unloadServiceChange"
                       :disabled="cpUnloadService">
              <el-option v-for="item in unloadServiceOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
            <!-- <span class="serveTip"
                  v-if="cpUnloadService">{{cpUnloadServiceText}}</span> -->
            <span class="serveTip"
                  v-if="cpUnloadService">
              <tip-normal :msg='cpUnloadServiceText' />
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="回单服务"
                        prop="receiptType">
            <el-select v-model="feeInfo.receiptType"
                       filterable
                       placeholder="请选择">
              <el-option v-for="item in whetherReceiptOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </section>
</template>

<script>
  import rules from "./rules.js"
  import bus from "../../bus.js";
  import TipNormal from '@/components/tip-normal'
  import { fetchgetActivating, fetchInsuredCoefficient } from '@/services/api/vts/index'
  export default {
    mixins: [rules],
    components: { TipNormal },
    props: {
      isAgianOrder: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        feeInfo: {
          goodsValueFee: '',
          loadService: '',
          unloadService: '',
          receiptType: '',
          insuredCoefficient: 1
        },
        loadServiceOptions: [
          { value: '10', label: '是' },
          { value: '20', label: '否' }
        ],
        unloadServiceOptions: [
          { value: '10', label: '是' },
          { value: '20', label: '否' }
        ],
        whetherReceiptOptions: [
          { value: '10', label: '回单原件' },
          { value: '20', label: '回单照片' },
          { value: '30', label: '无回单' },
        ],
        MapResolveInfo: {},
        carInfo: {},
        Loading: false,
        UnLoading: false,
        LoadingRemark: '',
        UnloadingRemark: '',
        // insuredCoefficient: 1
      }
    },
    activated () {
      this.getFetchInsuredCoefficient()
    },
    created () {
      bus.$on("MapResolve", (val) => {
        console.log('-->增值服务MapResolvebus', val);
        this.MapResolveInfo = val
        this.getActivating(10)
        this.getActivating(20)
      });
      bus.$on("ReceiveCarInfo", (val) => {
        console.log('-->增值服务ReceiveCarInfobus', val);
        this.carInfo = val
      });
      // this.getFetchInsuredCoefficient()
    },
    beforeDestroy () {
      console.log('清除bus-增值服务');
      bus.$off('MapResolve')
      bus.$off('ReceiveCarInfo')
    },
    watch: {
      cpLoadService (val) {
        if (val) {
          this.feeInfo.loadService = '20'
        } else {
          this.feeInfo.loadService = ''
        }
      },
      cpUnloadService (val) {
        if (val) {
          this.feeInfo.unloadService = '20'
        } else {
          this.feeInfo.unloadService = ''
        }
      },
      is_isAgianOrder: {
        handler (val) {
          if (val) {
            console.log('费用信息监听再来一单', val);
            this.setFeeInfo()
          }
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      // 是否再来一单
      is_isAgianOrder () {
        return this.isAgianOrder
      },
      // 装货服务校验
      cpLoadService () {
        let { carTypeCode } = this.carInfo
        let { start } = this.MapResolveInfo
        let arr = ['1', '2', '3']
        // if (carTypeCode && (+carTypeCode === 1005 || +carTypeCode === 1006)) {
        //   return true
        // }

        if (start && arr.includes(start.feature)) {
          return true
        }
        if (this.Loading) {
          return true
        } else {
          return false
        }
      },
      // 卸货服务校验
      cpUnloadService () {
        let { carTypeCode } = this.carInfo
        let { end } = this.MapResolveInfo
        console.log(end, 'end');
        let arr = ['1', '2', '3']
        // if (carTypeCode && (+carTypeCode === 1005 || +carTypeCode === 1006)) {
        //   return true
        // }

        if (end && arr.includes(end.feature)) {
          return true
        }
        if (this.UnLoading) {
          return true
        } else {
          return false
        }
      },
      // 装货禁用文案
      cpLoadServiceText () {
        let { carTypeCode } = this.carInfo
        let { start } = this.MapResolveInfo
        // if ((carTypeCode && +carTypeCode === 1005) || (carTypeCode && +carTypeCode === 1006)) {
        //   return '平板/高栏车型暂不提供装货服务'
        // }

        if (start && +start.feature === 1) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        } else if (start && +start.feature === 2) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        } else if (start && +start.feature === 3) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        }
        if (this.Loading) {
          return `${this.LoadingRemark}`
        } else {
          return ''
        }
      },
      // 卸货禁用文案
      cpUnloadServiceText () {
        let { carTypeCode } = this.carInfo
        let { end } = this.MapResolveInfo
        // if ((carTypeCode && +carTypeCode === 1005) || (carTypeCode && +carTypeCode === 1006)) {
        //   return '平板/高栏车型暂不提供卸货服务'
        // }
        if (end && +end.feature === 1) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        } else if (end && +end.feature === 2) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        } else if (end && +end.feature === 3) {
          return '当前地区无跨越点部，若需装卸可在备注中说明'
        }
        if (this.UnLoading) {
          return `${this.UnLoadingRemark}`
        } else {
          return ''
        }
      },
      // 保价费
      valuationFee () {
        if (this.feeInfo.goodsValueFee) {
          // console.log(this.feeInfo.goodsValueFee);
          console.log('this.feeInfo', this.feeInfo)
          if (isNaN(this.feeInfo.goodsValueFee)) return false
          return '保价费:' + (((this.feeInfo.goodsValueFee * 10000) * Number(this.feeInfo.insuredCoefficient) / 1000).toFixed(2)) + '元'
        } else {
          return ''
        }
      }
    },
    methods: {
      loadServiceChange (val) {
        console.log(val, this.MapResolveInfo);
        if (this.cpLoadService) {
          this.feeInfo.loadService = '20'
          this.$message.errpr('装货地')
        }

      },
      unloadServiceChange (val) {
        if (this.cpUnloadService) {
          this.feeInfo.loadService = '20'
          this.$message.errpr('卸货地')
        }
      },
      // 查询是否命中禁止装卸
      async getActivating (type) {
        let parmas = null;
        console.log(this.MapResolveInfo, this.carInfo, '查询是否命中禁止装卸');
        let { start, end } = this.MapResolveInfo
        if (start && end && this.carInfo) {
          parmas = {
            carTypeCode: this.carInfo.carTypeCode,
            carLength: this.carInfo.carLength,
            startDistrictCode: start.countyCode,
            startProvinceCode: start.provinceCode,
            startCityCode: start.cityCode,
            endDistrictCode: end.countyCode,
            endProvinceCode: end.provinceCode,
            endCityCode: end.cityCode,
            serviceType: type
          }
        }
        if (!parmas) return
        try {
          let _res = await fetchgetActivating(parmas)
          console.log(_res);
          if (_res.code == 0 && _res.data) {
            if (+type == 10) {
              this.Loading = true
              this.LoadingRemark = _res.data.customerRemark
            } else {
              this.UnLoading = true
              this.UnLoadingRemark = _res.data.customerRemark
            }
          } else {
            if (+type == 10) {
              this.Loading = false
              this.LoadingRemark = ''
            } else {
              this.UnLoading = false
              this.UnLoadingRemark = ''
            }
            // this.Loading = this.UnLoading = false
            // this.LoadingRemark = this.UnLoadingRemark = ''
          }
        } catch (error) {
          this.$message.error('校验装卸服务配置失败，请重新选择车型或地址校验')
        }
      },
      validForm () {
        return new Promise((resolve, reject) => {
          this.$refs.feeInfo.validate(valid => {
            if (valid) {
              const data = { ...this.feeInfo }
              data.goodsValueFee *= 10000
              resolve({ ...data })
            } else {
              reject(Error('校验失败'))
              this.$rule.error(this, this.$refs.feeInfo)
            }
          })
        })
      },
      setFeeInfo () {
        let sessionObj = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
        if (sessionObj) {
          this.feeInfo.goodsValueFee = (sessionObj.goodsValueFee || 0) / 10000
          this.feeInfo.loadService = ''
          this.feeInfo.unloadService = ''
          this.feeInfo.receiptType = sessionObj.receiptType
        }
      },
      // 重置
      reset () {
        let { insuredCoefficient } = this.feeInfo
        // 除了保费系数不重置，其他都重置
        this.feeInfo = {
          goodsValueFee: '',
          loadService: '',
          unloadService: '',
          receiptType: '',
          insuredCoefficient
        }
        this.$refs.feeInfo.resetFields()
      },
      // 获取保费系数
      async getFetchInsuredCoefficient () {
        let { data } = await fetchInsuredCoefficient({ key: 'vts.order.external.insured.coefficient' })
        this.feeInfo.insuredCoefficient = +data
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common.scss';
  @import 'index.scss';
</style>
