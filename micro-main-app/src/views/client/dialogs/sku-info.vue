// <template>
//   <!-- <div class="clientdialog"> -->
//   <el-dialog title="货物尺寸" custom-class="clientdialog" :visible.sync="dialogVisible" :close-on-click-modal="false" :width="isHideSkuInfo?'320px':'600px'" append-to-body>
//     <div class="dialog-body">
//       <div v-for="(item,index) in formData.list" :key="index">
//         <sku-info-item :isHideSkuInfo="isHideSkuInfo" :isAddRow="index===formData.list.length-1&&formData.list.length<8" :rowIndex="index" :skuList="skuList" @modifyRowCount="handleRow" :data="formData.list[index]" />
//       </div>
//     </div>
//     <span slot="footer" class="dialog-footer">
//       <el-button @click="dialogVisible = false">取 消</el-button>
//       <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
//     </span>
//   </el-dialog>
//   <!-- </div> -->
// </template>

// <script> 
// import SkuInfoItem from "@client/components/SkuInfoItem"
// export default {
//   name: "SkuInfo",
//   components: {
//     SkuInfoItem
//   },
//   props: {
//     hideSkuInfo:{type:Boolean,default:false},
//     sizeList: { type: [Array, String] },
//     goodsInfo: { type: String },
//     skuList: { type: Array }
//   },
//   data () {
//     return {
//       loading: false,
//       dialogVisible: false,

//       formData: {
//         list: [
//           { GoodsName: "", GoodsWeight: "", GoodsNumber: "", GoodsSize: "" }
//         ]
//       }
//     }
//   },
//   computed: {
//     isHideSkuInfo () {
//       return this.hideSkuInfo || this.$store.getters.isB2BUser && this.skuList.length < 1
//     }
//   },
//   methods: {
//     showDialog () {
//       this.dialogVisible = true
//       if (this.goodsInfo && this.goodsInfo.length > 2) {
//         this.formData.list = JSON.parse(this.goodsInfo)
//         console.log('JSON.parse(this.goodsInfo)  :>> ', JSON.parse(this.goodsInfo))
//       }
//     },
//     checkData () {
//       const sizeRegx = /^[1-9]\d{0,}\*[1-9]\d{0,}\*[1-9]\d{0,}$/
//       const result = this.formData.list.every(
//         s => !s.GoodsSize || (sizeRegx.test(s.GoodsSize) && s.GoodsSize.split('*').every(e => e && e <= 700))
//       )
//       console.log('result :>> ', result, this.formData.list[0].GoodsSize)
//       if (!result) {
//         return false
//       }
//       const filterFunc = f => f.GoodsName || f.GoodsWeight || f.GoodsNumber || sizeRegx.test(f.GoodsSize)
//       const list = this.formData.list.filter(filterFunc)
//       const sizeList = list.map(m => {
//         const arr = m.GoodsSize.split("*")
//         return {
//           Len: arr[0],
//           Width: arr[1],
//           Height: arr[2],
//           Number: m.GoodsNumber
//         }
//       })
//       this.$emit("update:goodsInfo", JSON.stringify(list))
//       this.$emit("update:sizeList", sizeList)
//       return true
//     },
//     saveData () {
//       try {
//         this.loading = true
//         if (!this.checkData()) {
//           this.$message.warning('数据格式不正确，请修改')
//           return
//         }
//         this.dialogVisible = false
//       } finally {
//         this.loading = false
//       }
//     },
//     handleRow (rowIndex) {
//       if (rowIndex === this.formData.list.length - 1 && this.formData.list.length < 8) {
//         this.formData.list.push({
//           GoodsName: "",
//           GoodsWeight: "",
//           GoodsNumber: "",
//           GoodsSize: ""
//         })
//       } else {
//         this.formData.list.splice(rowIndex, 1)
//       }
//     }
//   }
// }
// </script>

// <style lang="scss">
//   .clientdialog {
//     .el-dialog__body {
//       overflow-y: auto;
//       overflow-x: hidden;
//       color: #666666;
//       padding: 0 0 32px;
//       margin: 16px 20px 0;
//     }
//     .el-dialog__footer {
//       border-top: 1px solid #f1f1f5;
//       padding: 8px 20px;
//       .el-button--primary {
//         background-color: #7c57df;
//         border-color: #7c57df;
//       }
//     }
//   }
// </style>
