<template>
  <el-dialog :visible.sync="dialogVisible" width="764px" :title="title" custom-class="k-dialog"
             :close-on-click-modal="false">
    <express-detail :layout="layout" :ydCode="ydCode" :orderNumber="orderNumber" ref="expressDetailRef"
                    v-if="dialogVisible" @no-value-callback="noValueCallback">
      <div slot="contact" v-if="$slots.contact">
        <slot name="contact"></slot>
      </div>
    </express-detail>
    <div class="no-data text_center" v-if="noData">暂无数据</div>
    <div slot="footer"
         class="dialog-footer text_right">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary"
                 @click="handleConfirm">确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import ExpressDetail from '../express-detail'

export default {
  name: 'express-dialog' ,
  components: {
    ExpressDetail
  } ,
  props: {
    title: {
      type: String ,
      default: () => '查看物流'
    } ,
    ydCode: {
      type: String ,
      default: () => ''
    } ,
    // 下单编码
    orderNumber:'',
    visible: false,
    layout:{
      type:String,
      default: ()=>'city,ydCode,distance,detail'
    },
    goodsStatus:{
      type:Number,
      default:()=>0
    },
    // 运单状态 ''
    waybillStatus:{
      type:String,
      default: ()=>''
    }
  } ,
  data() {
    return {
      dialogVisible: false ,
      // 暂无数据
      noData: false,
    }
  } ,
  watch: {
    visible(val) {
      this.dialogVisible = val
    } ,
    dialogVisible(val) {
      if (!val) {
        this.$emit('close')
      } else {
        this.$nextTick(() => {
          this.$refs.expressDetailRef.detailInit({ydCode:this.ydCode,goodsStatus:this.goodsStatus,status:this.waybillStatus})
        })
      }
    }
  } ,
  computed: {
    // layout 布局显示
    layoutSelect() {
      let result = {}
      this.layout.split(',').forEach((item) => {
        result[item.trim()] = true
      })
      return result
    }
  } ,
  methods: {
    handleClose() {
      this.dialogVisible = false
    } ,
    handleConfirm() {
      this.handleClose()
    },
    // 暂无物流数据
    noValueCallback(val){
      this.noData = val
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
