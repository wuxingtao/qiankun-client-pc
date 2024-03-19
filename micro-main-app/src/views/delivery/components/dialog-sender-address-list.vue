<template>
  <ky-dialog title="选择寄件地址" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px" append-to-body>
    <div class="dialog-body">
      <div class="tip">猜您会选择以下地址下单：</div>
      <template v-for="(item,index) in addressList">
        <div :key="index" :class="['item__wrapper',item === selectedItem ?'active':'']" @click="selectedItem=item">
          <div class="content">
            <div class="user">
              <span v-show="item.person">{{item.person}}</span>
              <span>{{item.mobile || item.telphone}}</span>
            </div>
            <div class="companyName">{{item.customerName}}</div>
            <div class="address">
              {{item.fullAddress}}
            </div>
          </div>
          <el-radio :value="item === selectedItem" size="medium" :label="true"><span></span></el-radio>
        </div>
      </template>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">都不选</el-button>
      <el-button type="primary" @click="confirm"> 确定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import deliveryApi from '@api/delivery'
import * as storageUtil from '@/utils/storage'

export default {
  data () {
    return {
      dialogVisible: false,
      addressList: [],
      selectedItem: '',
      resolveResult: Function,
      isFromBatchFill:false,
    }
  },
  methods: {
    getAddressDataFromCache(){
      const senderAddressListCache = this.$store.state.delivery.senderAddressListCache || {}
      const customerCode = storageUtil.getCustomerCode()
      let addressData = null
      if(senderAddressListCache?.customerCode === customerCode){
        if(this.isFromBatchFill&&senderAddressListCache.single){
          addressData = senderAddressListCache.single
        }else if(!this.isFromBatchFill&&senderAddressListCache.batch){
          addressData = senderAddressListCache.batch
        }       
      }
      this.$store.commit('delivery/setSenderAddressListCache',{})
      return addressData
    },
    setAddressDataCache(selectedItem){
      const addressData = {customerCode:storageUtil.getCustomerCode()}
      const key = this.isFromBatchFill ? 'batch' : 'single'
      addressData[key] = selectedItem
      this.$store.commit('delivery/setSenderAddressListCache',addressData)
    },
    async loadData(){
      this.addressList = []
      const res = await deliveryApi.getSenderAddressList()
      if(res.code === 0 && res.data?.length>0){
        this.addressList = res.data.map(m=>({
          ...m,
          fullAddress:[m.province,m.city,m.area,m.address].join('')
        }))
      }

      // this.addressList = [{
      //   person: '',
      //   mobile: '13344443333',
      //   telphone: 'telphone',
      //   customerName: '公司名称',
      //   province: '省',
      //   city: '市',
      //   area: '区',
      //   address: '湖北省武汉市武昌区武汉市武昌区静安路6号尚文科技大厦第18层第18-C号',
      //   fullAddress:'asdf'
      // },{
      //   person: '张三',
      //   mobile: '13344443333',
      //   telphone: 'telphone',
      //   customerName: '公司名称',
      //   province: '省',
      //   city: '市',
      //   area: '区',
      //   address: '详细地址',
      //   fullAddress:'asdf'
      // }]
    },
    async showDialog (isFromBatchFill) {
      if(this.$route.name !== 'delivery'){
        return
      }
      this.isFromBatchFill = isFromBatchFill
      const addressData = this.getAddressDataFromCache()
      if(addressData){
        return addressData
      }
      await this.loadData()     
      if(this.addressList.length<1){
        return
      }
      this.dialogVisible = true
      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    },
    async confirm () {
      try {
        if(!this.selectedItem){
          this.$message.warning('请至少选择一条数据')
          return
        }
        const item = this.selectedItem
        const result = {
          company:item.customerName,
          contact:item.person,
          contactPhone:item.mobile,
          telephone:item.telphone,
          districtList:[item.province,item.city,item.area].filter(f=>f),
          detailAddress:item.address
        }
        this.setAddressDataCache(result)
        this.resolveResult && (this.resolveResult(result))
        this.dialogVisible = false
      } catch (ex) {
        console.log('ex :>> ', ex)
      } 
    },
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        this.resolveResult && (this.resolveResult(false))
        // if(!this.isFromBatchFill){
        deliveryApi.updateSenderAddressStatus()
        // }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/.el-dialog__body {
    padding-bottom: 8px !important;
  }
  .dialog-body {
    color: #03050d;
    font-size: 12px;
    .tip{
      font-size: 14px;
      padding-bottom: 9px;
    }
    .item__wrapper {
      display: flex;
      border: 1px solid #e9e9e9;
      border-radius: 4px;
      padding: 16px 20px;
      margin-bottom: 16px;
      background: url('~@/assets/image/delivery/super-zone-bg1.png') no-repeat;
      background-position-x: right;
      background-size: contain;
      &.active {
        border: 2px solid #8365f6;
        background-color: #f4f0ff;
        /deep/ {
          .el-radio__inner {
            border: none;
          }
        }
      }
    }

    .content {
      line-height: 18px;
      .user {
        font-size: 14px;
        color: #03050d;
        & > span {
          padding-right: 16px;
          font-weight: bold;
        }
      }
      .companyName{
        color: #8f8fa8;
        padding: 4px 0;
      }
    }
    .el-radio {
      margin-left: auto;
      display: flex;
      align-items: center;
      width: 24px;
      padding-left: 14px;
      /deep/ {
        .el-radio__inner {
          height: 24px;
          width: 24px;
          box-sizing: border-box;
          border: 2px solid #666666;
        }
        .el-radio__input.is-checked .el-radio__inner {
          &::after {
            content: '';
            width: 10px;
            height: 5px;
            border: 2px solid white;
            border-top: transparent;
            border-right: transparent;
            text-align: center;
            display: block;
            position: absolute;
            top: 7px;
            left: 6px;
            transform: rotate(-45deg);
            border-radius: 0px;
            background: none;
          }
        }
      }
    }
  }
</style>
