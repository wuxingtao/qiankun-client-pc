<template>
  <section class="goods-info page-style1">
    <el-form class="goodsInfo"
             ref="goodsInfo"
             :model="goodsInfo"
             label-position="top"
             label-width="88px"
             :validate-on-rule-change="false">
      <div class="title">
        <img src="../../../../../assets/image/vts/goodsInfo.png"
             class="title-icon" />货物信息
      </div>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="货物名称"
                        prop="goodsName"
                        :rules="goodsName">
            <el-select v-model="goodsInfo.goodsName"
                       popper-class="vts-reset-selectJJ-JJ"
                       filterable
                       remote
                       clearable
                       reserve-keyword
                       placeholder="请输入货物名称"
                       :remote-method="searchGoodsInfo"
                       @change="searchGoodsChange"
                       @blur="customGoodsName"
                       @clear="clearGoodsName"
                       :loading="loadingGoods">
              <el-option v-for="(item,index) in options"
                         :value="item"
                         :key="index">
                <span style="float: left;margin-right:40px"
                      v-html="highLightHtml(item.tagNames)">{{ item.tagNames }}</span>
                <span style="float: right">{{ item.goodsName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="包装类型"
                        prop="packageType"
                        :rules="packageType">
            <el-select v-model="goodsInfo.packageType"
                       @change="changePackage"
                       placeholder="请选择包装类型"
                       :disabled="packageTypeDisabled">
              <el-option v-for="(item,index) in packList"
                         :key="index"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="总重量(吨)"
                        prop="goodsWeight"
                        :rules="goodsWeight">
            <el-input :placeholder="cpGoodsWeight"
                      v-model="goodsInfo.goodsWeight"
                      clearable>
            </el-input>

          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="总体积(方)"
                        prop="goodsVolume"
                        :rules="goodsVolume">
            <el-input :placeholder="cpGoodsVolume"
                      v-model="goodsInfo.goodsVolume"
                      clearable
                      onkeypress="return (/^\d*(\.\d{1,1})?$/)">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </section>
</template>

<script>
  import { getGoodsInfoList, goodsInfoConfig } from '@/services/api/vts/index'
  import rules from "./rules.js"
  import bus from "../../bus.js";
  import { setTimeout } from 'timers';
  export default {
    mixins: [rules],
    props: {
      isAgianOrder: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        goodsInfo: {
          goodsName: '',
          packageType: '',
          goodsWeight: '',
          goodsVolume: ''
        },
        searchVal: '', // 输入的关键词
        loadingGoods: false, // 搜索货物的loading
        goodsClass: [], // 搜索货物返回的包装类型
        options: [], // 货物搜索options
        carInfo: {}
      }
    },
    watch: {
      // 监听再来一单
      // isAgianOrder: {
      //   hander (val) {
      //     console.log('货物信息监听再来一单');
      //     this.setGoodsInfo()
      //   },
      //   deep: true,
      //   immediate: true
      // },
      // isAgianOrder (val) {
      //   if (val) {
      //     console.log('货物信息监听再来一单');
      //     setTimeout(() => {
      //       this.setGoodsInfo()
      //     }, 500)
      //   }
      // },
      is_isAgianOrder: {
        handler (val) {
          if (val) {
            console.log('货物信息监听再来一单', val);
            this.setGoodsInfo()
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
      // 包装类型的选项
      packList () {
        if (this.goodsClass && Array.isArray(this.goodsClass) && this.goodsClass.length) {
          // let arr = this.lookUpOptions[BASE_PACK_CLASSIFICATION] // 包装分类的列表
          let arr = [
            { value: '1', label: '袋装' },
            { value: '2', label: '吨包' },
            { value: '3', label: '罐装' },
            { value: '4', label: '架子' },
            { value: '5', label: '框装' },
            { value: '6', label: '困扎' },
            { value: '7', label: '笼装' },
            { value: '8', label: '裸装' },
            { value: '9', label: '木箱' },
            { value: '10', label: '泡沫箱' },
            { value: '11', label: '散装' },
            { value: '12', label: '水箱' },
            { value: '13', label: '桶装' },
            { value: '14', label: '托盘' },
            { value: '15', label: '网兜' },
            { value: '16', label: '线盘' },
            { value: '17', label: '压块' },
            { value: '18', label: '纸箱' },
            { value: '19', label: '周转箱' },
          ]
          let tmp = []
          this.goodsClass.forEach(item => { // 搜索货物拿到的包装列表去包装的字典里面匹配相对应的文字和值
            let findObj = arr.find(obj => +obj.value === item.typeCode)
            if (findObj) {
              tmp.push({
                label: findObj.label,
                value: findObj.value
              })
            }
          })
          tmp.push({ // 字典里面是没有其他的，只能手动加
            label: '其他',
            value: '20'
          })
          console.log('packagetmp', tmp)
          return tmp
        } else {
          // 自定义货物或者是没有包装分类的货物，直接使用这8种包装方式 纸箱、筐装、散装、托盘、捆扎、袋装、裸装、其他
          return [{
            label: '纸箱',
            value: '18'
          }, {
            label: '散装',
            value: '11'
          }, {
            label: '托盘',
            value: '14'
          }, {
            label: '捆扎',
            value: '6'
          }, {
            label: '袋装',
            value: '1'
          }, {
            label: '裸装',
            value: '8'
          }, {
            label: '框装',
            value: '5'
          }, {
            label: '其他',
            value: '20'
          }]
        }
      },
      // 总重量
      cpGoodsWeight () {
        let { carMinWeight, carMaxWeight } = this.carInfo
        let min = ''
        let max = ''
        if (carMinWeight && carMaxWeight) {
          min = carMinWeight / 1000
          max = carMaxWeight / 1000
          return `请填写范围${min}~${max}`
        } else {
          return `请输入货物重量`
        }
      },
      // 总体积
      cpGoodsVolume () {
        let { carMinCubage, carCubage } = this.carInfo
        if (carCubage) {
          return `请填写范围${carMinCubage}~${carCubage}`
        } else {
          return `请输入货物重量`
        }
      },
      // 包装类型是否禁用
      packageTypeDisabled () {
        if (this.goodsInfo.goodsName == '' || !this.goodsInfo.goodsName) {
          return true
        } else {
          return false
        }
      }
    },
    created () {
      bus.$on("ReceiveCarInfo", (val) => {
        console.log('-->货物信息bus', this.isAgianOrder, val, JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo')));
        this.carInfo = val
        if (this.isAgianOrder) {
          let sessionObj = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
          this.goodsInfo.goodsWeight = sessionObj.goodsWeight / 1000
          this.goodsInfo.goodsVolume = sessionObj.goodsVolume
        } else {
          this.goodsInfo.goodsWeight = ''
          this.goodsInfo.goodsVolume = ''
        }
      });
    },
    beforeDestroy () {
      console.log('清除bug-货物');
      bus.$off('ReceiveCarInfo')
    },
    methods: {
      // 高亮显示
      highLightHtml (tag) {
        let textArr = tag.split('') // 将搜索出来的货物，拆成数组
        let tmp = `<span class="select-span">`
        textArr.forEach(item => { // 挨个去匹配关键词
          if (this.searchVal.indexOf(item) !== -1) { // 找到能匹配的上的
            tmp += `<span style="color:#8b60f0">${item}</span>` // 高亮显示
          } else {
            tmp += item
          }
        })
        tmp += `</span>`
        return tmp
      },
      // 托寄物查询信息
      async searchGoodsInfo (val) {
        console.log(val);

        // val = val.substring(0, 10)
        this.searchVal = val
        this.loadingGoods = true
        let parmas = {
          size: 20,
          tags: [{ tag: val }]
        }
        let res = await getGoodsInfoList(parmas)
        this.loadingGoods = false
        this.options = this.formatResult(res.data)
      },
      formatResult (val = []) {
        console.log('搜索返回的接口', val)
        let tmp = []
        val.forEach(item => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(obj => {
              tmp.push({
                tagNames: obj.tag, // 展示和传给后端的关键字
                goodsClass: item.goodsClassification, // 包装
                goodsName: item.goodsName, // 二级分类名
                goodsCode: item.goodsCode, // 传给后端的商品分类编码
                goodsId: item.id
              })
            })
          }
        })
        return tmp
      },
      // 选择搜索出来的货物
      searchGoodsChange (val) {
        console.log(val, this.options, '0000')
        this.goodsInfo.goodsName = val.tagNames
        this.goodsInfo.tagNames = val.goodsName // 货物分类级称
        this.goodsInfo.packageType = ''
        let goods = this.options.find(item => item.tagNames === val.tagNames && item.goodsName === val.goodsName) // 通过关键词找到选择的那一条（如果这里的关键词相同的话，那么有可能会导致选错
        console.log(goods, '===>选择搜索出来的货物')
        if (goods) {
          this.goodsInfo.goodsCode = goods.goodsCode
          this.goodsInfo.goodsClass = this.goodsClass = goods.goodsClass
          this.goodsInfo.goodsId = this.goodsId = goods.goodsId
          // this.goodsId = goods.goodsId
        } else {
          this.goodsInfo.goodsCode = ''
          this.goodsInfo.goodsClass = this.goodsClass = []
          this.goodsInfo.goodsId = this.goodsId = ''
        }
      },
      // 选择包装触发的事件
      changePackage (val) {
        this.goodsInfo.packageType = val
        this.$forceUpdate() // 解决选了包装不显示的问题
      },
      // 清除货物类型
      clearGoodsName () {
        this.options = []
        this.goodsInfo.packageType = ''
      },
      // 失焦之后，保留用户输入
      customGoodsName (val) {
        console.log('失焦val', val, this.searchVal)
        if (this.searchVal) {
          this.searchVal = this.searchVal.substring(0, 10)
        }
        this.goodsInfo.goodsName = this.searchVal
      },
      validForm () {
        return new Promise((resolve, reject) => {
          this.$refs.goodsInfo.validate(valid => {
            if (valid) {
              const data = { ...this.goodsInfo }
              data.goodsWeight *= 1000
              resolve({ ...data })
            } else {
              reject(Error('校验失败'))
              this.$rule.error(this, this.$refs.goodsInfo)
            }
          })
        })
      },
      // 再来一单 货物信息配置
      async setGoodsInfo () {
        let sessionObj = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
        let againPackageType = sessionObj.packageType
        this.goodsInfo.goodsName = sessionObj.goodsName
        this.goodsInfo.goodsWeight = sessionObj.goodsWeight / 1000
        this.goodsInfo.goodsVolume = sessionObj.goodsVolume
        this.goodsClass = await this.getGoodsInfoConfig(sessionObj.goodsId)
        let arr = [
          { value: '1', label: '袋装' },
          { value: '2', label: '吨包' },
          { value: '3', label: '罐装' },
          { value: '4', label: '架子' },
          { value: '5', label: '框装' },
          { value: '6', label: '困扎' },
          { value: '7', label: '笼装' },
          { value: '8', label: '裸装' },
          { value: '9', label: '木箱' },
          { value: '10', label: '泡沫箱' },
          { value: '11', label: '散装' },
          { value: '12', label: '水箱' },
          { value: '13', label: '桶装' },
          { value: '14', label: '托盘' },
          { value: '15', label: '网兜' },
          { value: '16', label: '线盘' },
          { value: '17', label: '压块' },
          { value: '18', label: '纸箱' },
          { value: '19', label: '周转箱' },
        ]
        let _packageType = arr.filter(item => { return (item.value === againPackageType) || (item.label === againPackageType) })
        this.goodsInfo.packageType = (_packageType && _packageType.length && _packageType[0].value) || '20'
      },
      // 切换或者再来一单获取货物包装类型calss
      async getGoodsInfoConfig (id) {
        let res = await goodsInfoConfig({ id: id })
        return res.data.goodsClassification
      },
      // 重置
      reset () {
        this.goodsInfo = {
          goodsName: '',
          packageType: '',
          goodsWeight: '',
          goodsVolume: ''
        }
        this.$refs.goodsInfo.resetFields()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common.scss';
  @import 'index.scss';
</style>
