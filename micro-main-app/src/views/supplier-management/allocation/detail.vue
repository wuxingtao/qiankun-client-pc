<template>
  <ky-page-container class="page-form-container" :title="`${isModify?'修改':'新增'}`" show-go-back is-form-page v-loading="loading" @back="handleGoBack">
    <section class="allocation-info">
      <el-form ref="form" :model="formData" :rules="formRules" label-position="top" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplierName">
              <el-autocomplete v-model="formData.supplierName" size="medium" clearable :fetch-suggestions="querySearchSupplier" placeholder="请输入供应商" @select="handleSelectSupplier" @change="handleChangeSupplier">
                <template slot-scope="{ item }">
                  {{item.supplierName}}
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="要求到货时间" prop="deliveryTime">
              <el-date-picker class="delivery-time" prefix-icon="iconfont icon-purple_calendar" size="medium" v-model="formData.deliveryTime" :picker-options="pickerOptions" type="datetime" placeholder="请选择要求到货时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收件公司" prop="reveiverCompany" class="reveiver-company-item">
              <div class="address-book" @click="visibleOfAddressBook=true" v-if="customerCode">从地址簿选择</div>
              <el-autocomplete popper-class="company-autocomplete" size="medium" :maxlength="30" clearable v-model.trim="formData.reveiverCompany" :fetch-suggestions="queryReceiverContactList" placeholder="请输入收件公司" @select="handleSelectCompany" @change="handleChangeCompany">
                <template slot-scope="{ item }">
                  <div class="name-phone-wrap">
                    <span v-html="item.contactRaw"></span>
                    <span v-html="item.companyRaw"></span>
                  </div>
                  <div class="address">{{item.address}}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="goods-btn">
        <i style="color:red;padding-right:4px;">*</i>托寄物
        <div @click="handleClickSelectSku" class="btn-goods__select">
          <svg-icon icon-class="icon-goods" />从SKU库选择
        </div>
      </div>
      <ky-table class="allocation-table" :data="tableData" :tableColumns="tableColumns" :max-height="300">
        <template slot="empty">
          <div @click="handleClickSelectSku" class="btn-goods__select">请添加商品信息</div>
        </template>
        <el-table-column fixed label="操作" width="60px">
          <template slot-scope="scope">
            <el-button @click="removeSku(scope.$index, tableData)" type="text" class="btn-text-border">移除</el-button>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" show-overflow-tooltip min-width="418px">
          <template v-slot="{row}">
            <div class="item-main">
              <div class="item-img">
                <el-image :src="row['itemPicture']||defaultImg" :previewSrcList="[row['itemPicture']]" style="width:100%;height:100%">
                  <div slot="placeholder" class="image-slot">
                    加载中<span class="dot">...</span>
                  </div>
                </el-image>
              </div>
              <div class="item-name">
                <div>{{ row["itemName"] }}</div>
                <div style="color: #999999;">{{row["barCode"]}}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <template #end>
          <el-table-column label="发货数量" min-width="285px">
            <template slot-scope="{row}">
              <el-input size="small" v-kyerestrict.positive :maxlength="6" v-model.trim="row['nums']" style="width:141px" placeholder="请输入发货数量"></el-input>
            </template>
          </el-table-column>
        </template>
      </ky-table>
      <el-button round size="medium" @click="handleGoBack">取消</el-button>
      <el-button type="primary" round size="medium" @click="saveData">保存</el-button>
    </section>

    <dialog-address :visible.sync="visibleOfAddressBook" addressType="20" @on-confirm="handleSelectCompany($event)" />
    <dialog-sku :visible.sync="visibleOfSku" :showAddSkuLink="true" @confirm="handleSelectedSku" :supplierName="selectedSupplierName" :skuIdList="skuIdList" />
  </ky-page-container>
</template>

<script>
import dayjs from 'dayjs'
import Regular from '@utils/regular'
import { getPhone, getCustomerCode, getLoginData } from '@/utils/storage'
import uiUtil from '@/utils/uiUtil'
import { copyTheSameProperty } from '@/utils/commonUtil'
import { getLoginCompanyName } from '@utils/clientUtil'
import { queryAddressBook } from '@/services/api/address'
import { getSupplierList, getAllocationList, saveAllocation, modifyAllocation,getCurrentUserSupplierStatus } from '@/services/api/supplier'
import DialogAddress from '@/views/address-book/components/dialog-address'
import DialogSku from '../sku/components/dialog-sku'

const tableColumns = [
  { prop: 'itemSpecs', text: '规格', width: '165', visible: true },
  { prop: 'itemUnit', text: '商品单位', width: '193', visible: true },
]

export default {
  components: {
    DialogAddress,
    DialogSku,
  },
  data () {
    const checkEmoji = async (rule, value, callback) => {
      if (Regular.emoji.test(value) || /[ ]/.test(value)) {
        let fieldName = ''
        switch (rule.field) {
          case 'reveiverCompany':
            fieldName = '收件公司'; break
          case 'supplierName':
            fieldName = '供应商名称'; break
        }
        return callback(`${fieldName}不支持空格和特殊字符`)
      }
      callback()
    }
    const checkDeliveryTime = async (rule, value, callback) => {
      if (dayjs(value).isBefore(dayjs(), 'minute')) {
        return callback('要求到货时间必须大于当前时间')
      }
      callback()
    }
    return {
      // currentUserSupplierStatus:'',
      pickerOptions: uiUtil.getPickerOptions(dayjs()),
      loading: false,
      visibleOfSku: false,
      visibleOfAddressBook: false,
      skuIdList: [],//已选择的商品id
      tableColumns: tableColumns,
      defaultImg: require('@/assets/image/item-default-img.png'),
      tableData: [],
      selectedSupplierName: '',
      formData: {
        id: '',
        supplierName: '',
        supplierContract: '',
        supplierPhone: '',
        supplierCode: '',
        supplierAddress: '',
        reveiverCompany: '',
        receiverContract: '',
        receiverPhone: '',
        reveiverAddress: '',
        deliveryTime: dayjs().add(1, 'hour'),
      },
      formRules: {
        supplierName: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' },
          { min: 2, message: '供应商名称不能少于2个字', trigger: 'change' },
          { max: 30, message: '供应商名称不得超过30个字', trigger: 'change' },
          { pattern: /[A-Za-z\u4e00-\u9fa5]{1,30}/, message: '供应商名称不支持纯数字、纯符号或数字与符号组合', trigger: 'change' },
          { validator: checkEmoji, trigger: 'change' },],
        deliveryTime: [
          { required: true, message: '请选择要求到货时间', trigger: 'blur' },
          { validator: checkDeliveryTime, trigger: 'change' },],
        reveiverCompany: [
          { required: true, message: '请输入收件公司', trigger: 'blur' },
          { min: 2, message: '收件公司不能少于2个字', trigger: 'change' },
          { max: 30, message: '收件公司不得超过30个字', trigger: 'change' },
          { validator: checkEmoji, trigger: 'change' },],
      },
    }
  },
  async mounted () {
    this.receriverList = await this.queryContactList('20', '', 10000)
  },
  async activated () {
    const id = this.$route.query.id
    const distrId = this.$route.query.distrId
    if (!id) {
      const res = await  getCurrentUserSupplierStatus()
      if(res.code===0){
        if(res.data===1&&!this.formData.reveiverCompany){
          this.formData.reveiverCompany=  getLoginCompanyName(true)
        }else if(res.data===2&&!this.formData.supplierName){
          this.formData.supplierName=getLoginCompanyName(true)
        }
      }
      return
    }
    this.formData.id = id
    this.formData.distrId = distrId
    const res = await getAllocationList({ id })
    if (res.code === 0 && res.data && res.data.rows) {
      copyTheSameProperty(this.formData, res.data.rows[0])
      this.tableData = res.data.rows[0].itemInfoVos
    }
  },
  beforeRouteLeave (to, from, next) {
    this.resetForm()
    next()
  },
  methods: {
    async handleGoBack () {
      await this.$confirm('取消后将不再保存数据，请确认是否取消?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this.$router.push('/supplier/allocation')
    },
    removeSku (index, rows) {
      rows.splice(index, 1)
    },
    async handleClickSelectSku () {
      if (this.formData.supplierPhone) {
        this.selectedSupplierName = this.formData.supplierName
      } else {
        const params = {
          customerCode: getCustomerCode(),
          supplierName: this.formData.supplierName,
          supplierStatus: 1,
          page: 1,
          pageSize: 1,
        }
        const res = await getSupplierList(params)
        this.selectedSupplierName = this.formData.supplierName
        if (res.code === 0 && res.data.rowTotal > 0) {
          this.selectedSupplierName = this.formData.supplierName
        }else{
          this.selectedSupplierName = ''
        }        
      }
      this.visibleOfSku = true
      this.skuIdList = this.tableData.map(m => m.id)
    },
    handleSelectedSku (rows) {
      rows.forEach(r=>{
        const currentRow=this.tableData.find(t => t.id === r.id)
        if(currentRow){
          r.nums=currentRow.nums
        }
      })
      this.tableData=rows
    },
    async querySearchSupplier (queryString, cb) {
      const params = {
        customerCode: getCustomerCode(),
        supplierName: queryString,
        supplierStatus: 1,
        page: 1,
        pageSize: 20,
      }
      const res = await getSupplierList(params)
      let results = []
      if (res.code === 0 && res.data.rows) {
        results = res.data.rows
      }
      cb(results)
    },
    handleSelectSupplier (item) {
      this.formData.supplierName = item.supplierName
      this.formData.supplierContract = item.contactName
      this.formData.supplierPhone = item.contactPhone
      this.formData.supplierCode = item.customerCode
      this.formData.supplierAddress = item.supplierAddress
    },
    handleChangeSupplier () {
      this.formData.supplierContract = ''
      this.formData.supplierPhone = ''
      this.formData.supplierCode = ''
      this.formData.supplierAddress = ''
    },
    /**
                 * 查询地址薄数据 
                 * @param {*} addressType 寄方：10，收方：20
                 * @param {*} queryString 
                 * @param {*} pageSize 
                 */
    async queryContactList (addressType, queryString, pageSize = 50) {
      const params = {
        phone: getPhone(),
        // customerCode: this.authorityIds.includes('031') ? this.customerCode : "",
        addressType: addressType,
        page: 1,
        pageSize: pageSize,
        keyword: queryString
      }
      const res = await queryAddressBook(params)
      if (res.code === 0) {
        return res.data.rows.map(r =>
          Object.assign(r, {
            address: r.province + r.city + r.area + r.address,
            detailAddress: r.address
          })
        )
      }
      return []
    },
    async queryReceiverContactList (queryString, cb) {
      if(!this.customerCode){
        return cb([])
      }
      let results = []
      if (this.receriverList && this.receriverList.length > 0) {
        let list = this.receriverList
        if (queryString) {
          list = list.filter(f => (f.address||'').includes(queryString)
              || (f.company || '').includes(queryString) || (f.contactPhone || '').includes(queryString) || (f.contact || '').includes(queryString))
        }
        results = list.slice(0, 50)
      } else {
        results = await this.queryContactList('20', queryString, 50)
      }
      results && results.forEach(item => {
        const regExp = new RegExp(`(${queryString})`, 'ig')
        const replacement = '<span style=\'color:#8365f6\'>$1</span>'
        item.contactRaw = item.contact && item.contact.replace(regExp, replacement)
        item.companyRaw = item.company && item.company.replace(regExp, replacement)
      })
      cb(results)
    },
    handleSelectCompany (item) {
      this.formData.reveiverCompany = item.company
      this.formData.receiverContract = item.contact
      this.formData.receiverPhone = item.contactPhone
      this.formData.reveiverAddress = item.address
    },
    handleChangeCompany () {
      this.formData.receiverContract = ''
      this.formData.receiverPhone = ''
      this.formData.reveiverAddress = ''
    },
    resetForm () {
      this.$refs.form.resetFields()
      Object.assign(this.$data.formData, this.$options.data().formData)
      this.tableData = []
    },
    saveData () {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        if (this.tableData.length < 1) {
          this.$message.warning('请选择托寄物')
          return
        }
        if (this.tableData.some(s => !s.nums || Number(s.nums) < 1)) {
          this.$message.warning('托寄物发货数量必须大于0')
          return
        }
        this.loading = true
        const itemInfoVos = this.tableData.map(m => ({ nums: m.nums, barCode: m.barCode, itemUnit: m.itemUnit }))
        let params = Object.assign(this.formData, { itemInfoVos })
        let res
        try {
          if (this.isModify) {
            // const params={
            //   id:this.formData.id,
            //   distrId:this.formData.distrId,
            //   itemInfoVos:itemInfoVos,
            //   supplierName:this.formData.supplierName,
            //   deliveryTime:this.formData.deliveryTime,
            //   reveiverCompany:this.formData.reveiverCompany,
            //   reveiverAddress:this.formData.reveiverAddress,
            //   supplierAddress:this.formData.supplierAddress,
            // } 
            res = await modifyAllocation(params)
          } else {
            delete params.id
            delete params.distrId
            params.createdBy = getLoginData().userName
            params.loginCompany = getLoginCompanyName(true)
            res = await saveAllocation(params)
          }
          if (res.code === 0) {
            this.$message.success(`${this.isModify ? '修改' : '新增'}成功`)
            this.$router.push({ name: 'allocation-index', params: { refresh: true } })
          }
        } finally {
          this.loading = false
        }
      })
    }
  },
  computed: {
    isModify () {
      return !!this.$route.query.id
    },
    customerCode(){
      return getCustomerCode()
    },
  },
  watch: {

  }
}
</script>

<style lang="scss">
  .company-autocomplete {
    .name-phone-wrap {
      font-size: 14px;
      color: #333333;
      line-height: 14px;
      margin: 12px 0 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      & > :first-child {
        padding-right: 1em;
      }
    }
    .address {
      font-size: 12px;
      line-height: 18px;
      color: #999999;
      margin-bottom: 8px;
      white-space: normal;
      word-break: break-all;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
</style>

<style lang="scss" scoped>
  .page-form-container {
    .allocation-info {
      border: 1px solid #e6e6e6;
      border-radius: 3px;
      padding: 4px 24px 24px;
      margin-top: 20px;
      /deep/ {
        .el-form {
          // max-width: 920px;
          margin-top: 20px;
          .el-form-item {
            margin-bottom: 26px;
            &.reveiver-company-item {
              position: relative;
              .address-book {
                z-index: 2;
                position: absolute;
                top: -31px;
                right: 0;
                color: #8365f6;
                cursor: pointer;
              }
            }
          }
          .el-date-editor.el-input {
            width: 100%;
            position: relative;
            &.delivery-time {
              .el-input__suffix {
                right: 15px;
              }
            }
            .el-input__prefix {
              right: 0;
              left: unset;
            }
            .icon-purple_calendar {
              color: #8365f6;
            }
          }
        }
        .el-button + .el-button {
          margin-left: 12px;
        }
        .allocation-table > .el-table {
          margin-bottom: 180px;
          .el-table__empty-text {
            width: 100%;
            border-bottom: 1px solid #f7f8fe;
          }
          .el-input {
            display: inline-block;
            width: 100%;
            & > input {
              border: none;
              border-radius: 19px !important;
              padding: 0 12px !important;
              background: #eef3fc;
              &:focus {
                border-bottom: unset !important;
              }
            }
          }
        }
      }
      .goods-btn {
        margin-bottom: 12px;
        display: flex;
        color: #333333;
        font-size: 14px;
        & > div:last-child {
          margin-left: auto;
          display: flex;
          align-items: center;
          & > svg {
            margin-right: 6px;
          }
        }
      }
      .btn-goods__select {
        color: #8365f6;
        cursor: pointer;
      }
      .item-main {
        display: flex;
        justify-items: center;
        align-items: center;
        .item-img {
          width: 29px;
          height: 32px;
          margin-right: 12px;
        }
        .item-name {
          line-height: 16px;
        }
      }
    }
  }
</style>