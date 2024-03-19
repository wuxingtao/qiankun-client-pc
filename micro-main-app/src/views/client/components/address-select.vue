<template>
  <div class="address-container">
    <el-form ref='form' :model="formData" :rules="formRules" label-position="top" label-width="88px">
      <el-row>
        <el-col :span="span">
          <el-form-item :error="errorMsgOfdistrict">
            <tabs-cascader :props="tabsCascaderProps" :labelList="formData.districtList" @valueChange="changeDistrict" :fetch-suggestions="getMultiLevelThinkList" @addressLoaded="addressLoaded" ref="cascaderRef"/>
          </el-form-item>
        </el-col>
        <el-col :span="span" v-if="showInput">
          <el-form-item prop="detailAddress">
            <el-autocomplete v-model="formData.detailAddress" size="medium" popper-class="address-autocomplete" clearable :trigger-on-focus="false" :debounce="500" :fetch-suggestions="addressSuggest" @select="selectSuggestAddress" :maxlength="80" placeholder="请输入详细地址" @change="handleDetailAddressChange">
              <template slot-scope="{ item }">
                <div class="title" v-html="item.item.title"> </div>
                <span class="address" v-html="item.item.address"></span>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import Regular from "@utils/regular"
import { splitAddress, getMultiLevelThinkList, getMultiLevelSubList, addressSuggestApi } from "@/services/api/address"
import TabsCascader from './TabsCascader'

export default {
  components: {
    TabsCascader,
  },
  props: {
    fullAddress: { type: String },
    // 类型[poly:兼容模式]
    type:{
      type:String,
      default: ()=>''
    },
    showInput: {
      type: Boolean,
      default: true
    }
  },
  data () {
    const checkEmoji = async (rule, value, callback) => {
      if (Regular.emoji.test(value)||/[ ]/.test(value)) {
        return callback('详细地址不支持空格和特殊字符')
      }
      callback()
    }
    let that = this
    return {
      errorMsgOfdistrict:'',
      formData: {
        districtList: [],
        detailAddress: ""
      },
      formRules: {
        // districtList:[{ required: true, message: "地址不能为空", trigger: "change" }],
        detailAddress: [
          { required: true, message: "详细地址不能为空", trigger: "blur" },
          { min: 5,  message: '最少需填写5个字', trigger: 'blur' },
          // { pattern: /[^@#&*%]+/, message: "详细地址不可包含特殊字符", trigger: "blur" },
          { validator: checkEmoji, trigger: "blur" },],
      },
      tabsCascaderProps: {
        type: that.type,
        lazy: true,
        async lazyLoad (node, resolve) {
          const { value, level } = node
          const resultNodes = await that.getAddressChildNodes(value, level)
          if (!resultNodes) {
            resolve([])
            return
          }
          let nodes = resultNodes.filter(n => n.label)
          for (let node of resultNodes.filter(n => !n.label)) {
            let tempNodes = await that.getAddressChildNodes(node.value, level)
            tempNodes = tempNodes.map(m => Object.assign({ parentOption: node }, m))
            nodes.push(...tempNodes)
          }
          resolve(nodes)
        }
      },
    }
  },
  computed: {
    span() {
      return this.showInput === true ? 12 : 24
    }
  },
  watch: {
    formData: {
      deep: true,
      handler: function () {
        const fullAddress = this.formData.districtList.join('') + this.formData.detailAddress
        // console.log('addressItem:update:fullAddress :>> ', fullAddress)
        this.$emit('update:fullAddress', fullAddress)
      }
    }
  },
  methods: {
    isDistrictEmpty () {
      return !this.formData.districtList || this.formData.districtList.length < 1
    },
    async getAddressChildNodes (addressId, level) {
      const res = await getMultiLevelSubList(addressId)
      if (res.data && res.data.districtList) {
        const nodes = res.data.districtList.map(item => ({
          value: item.districtID,
          label: item.districtName,
          leaf: level >= 2
        }))
        return nodes
      }
    },
    async getMultiLevelThinkList (keyWord, callback) {
      const res = await getMultiLevelThinkList(keyWord)
      if (res.code === 0) {
        let list = res.data.districtList.filter(f => !['province', 'city'].includes(f.districtLevel))
        list = list.map(m => m.districtName.split('-')).filter(f => f.length === 3)
        const nodes = list.map(m => ({ labelList: m, displayText: m.join(' / ') }))
        callback(nodes)
      }
    },
    async validateForm (hideErrorMsg) {
      this.errorMsgOfdistrict=''
      if (!this.formData.districtList || this.formData.districtList.filter(d=>d).length < 3) {
        !hideErrorMsg&& (this.errorMsgOfdistrict='省市区不能为空')
        return
      }
      try{
        await this.$refs.form.validate()
      }
      catch{
        if(hideErrorMsg){
          this.$refs.form.clearValidate()
        }
        return
      }
      const fullAddress = this.formData.districtList.join('') + this.formData.detailAddress
      if (this.showInput === true) {
        if (fullAddress.trim().length < 11) {
          !hideErrorMsg && (this.errorMsgOfdistrict = '地址长度不能小于11位')
          return
        }
      }
      return true
    },
    async handleDetailAddressChange () {
      try{
        await this.$refs.form.validate()
        await this.fillTheAddress(this.formData.detailAddress)
      }
      catch{
        this.addressChange ()
        return
      }
    },
    async addressChange () {
      // const flag= await  this.validateForm ()
      // console.log('flag :>> ', flag)
      // this.$emit(flag?'change':'invalid-change')
      await  this.validateForm ()
      this.$emit('change')
    },
    changeDistrict (selectedOptions) {
      this.formData.districtList = selectedOptions.map(o => o.label)
      this.addressChange()
    },
    addressSuggest (queryString, cb) {
      if (!queryString) {
        return
      }
      let district = ''
      let sepecialDistrict = ["东莞市", "中山市", "三沙市", "儋州市", "嘉峪关市","潜江市","仙桃市","神农架林区","天门市"]
      let districtList = this.formData.districtList
      if (districtList.length > 2) {
        if (sepecialDistrict.includes(districtList[1])) {
          district = districtList[0] + districtList[1]
        } else {
          district = districtList[2]
        }
        district = (district+'').replace(/\s/g, "")
      }
      let keyword = queryString.replace(/\s/g, "")
      let params = {
        keyword,
        region: district,
        'page_index': 1,
        'page_size': 20,
        'region_fix': district ? 1 : 0,
      }
      addressSuggestApi(params).then(res => {
        if (res.data && res.data.data) {
          let results = res.data.data.map(item => {
            let fomatedItem = {
              address: item.address.replace(new RegExp(`(${keyword})`, 'ig'), "<span style='color:#8365f6'>$1</span>"),
              title: item.title.replace(new RegExp(`(${keyword})`, 'ig'), "<span style='color:#8365f6'>$1</span>")
            }
            return { value: item.address + item.title, item: Object.assign(item, fomatedItem) }
          })
          cb(results)
        } else {
          cb([])
        }
      })
    },
    async selectSuggestAddress (addressInfo) {
      const item = addressInfo.item
      const districtList= [this.$trim(item.province, '市'), item.city, item.district]
      if(districtList.filter(f=>f).length<3){
        await  this.splitTheAddress(addressInfo.value)
      }else{
        this.formData.districtList = districtList
        let districtText = districtList.join('')
        if (item.province.endsWith('市')) {
          districtText = item.city + item.district
        }
        this.formData.detailAddress = addressInfo.value.replace(districtText, '')
      }

      this.$nextTick(() => {
        this.addressChange()
        this.validateForm()
      })
    },
    async fillTheAddress (address, callback, districtList) {
      if (!address) {
        this.clear()
        this.addressChange()
        return
      }
      districtList = districtList && Array.from(new Set(districtList)) || []
      const flag = districtList.filter(d => d).length > 2
      if (address.length < 13 || flag) {
        if (flag) {
          this.formData.districtList = districtList
          this.formData.detailAddress = address.replace(districtList.join(''), '')
        } else {
          this.formData.detailAddress = address
        }
        callback && (await callback())
        this.addressChange()
        return
      }
      this.formData.detailAddress = address
      await this.splitTheAddress(address,callback)
      this.addressChange()
    },
    /**
       * 填充地址信息 - 地址簿 (兼容重复省市区)
       * @param address 详细地址 不含省市区
       * @param callback
       * @param districtList
       * @returns {Promise<void>}
       */
    async fillTheAddressNew(address, callback, districtList=[]){
      if (!address) {
        this.clear()
        this.addressChange()
        return
      }
      // const flag = districtList.filter(d => d).length > 2
      this.formData.detailAddress = address
      if(districtList.length > 0){
        this.formData.districtList = districtList
      }
      callback && (await callback())
      this.addressChange()

    },
    async splitTheAddress(address,callback){
      let res = await splitAddress(address)
      if (res.code === 0) {
        const data = res.data.result
        const districtList = [data.province, data.city, data.zone, data.street].filter(f=>f).slice(0,3)
        if (this.formData.districtList.join('') !== districtList.join('')) {
          this.formData.districtList = districtList
        }
        this.formData.detailAddress = address.replace(this.formData.districtList.join(''), '')
        callback && (await callback())
      }
    },
    clear () {
      this.formData.districtList = []
      this.formData.detailAddress = ''
    },
    addressLoaded(){
      this.$refs.cascaderRef.displayText = this.formData.districtList[0] + this.formData.districtList[1] + this.formData.districtList[2]
    }
  }
}
</script>

<style lang="scss">
  .address-autocomplete {
    height: unset;
    min-height: 54px;
    font-size: 12px;
    color: #999999;
    ul li{
      line-height: 1;
      padding: 14px 20px;
    }
    .title {
      line-height: 1;
      font-size: 14px !important;
      color: #333333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-bottom: 6px;
    }
  }
</style>
<style lang="scss" scoped>
  /deep/{
    .el-form-item {
      margin-bottom: 0 !important;
    }
    .el-form-item__content {
      padding-bottom: 0 !important;
      .el-autocomplete {
        width: 100% !important;
      }
    }
  }
</style>
