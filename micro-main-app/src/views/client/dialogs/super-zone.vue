// <template>
//   <div class="clientdialog">
//     <el-dialog title="超区选项" :visible.sync="dialogVisible" :close-on-click-modal="false" width="683px" append-to-body>
//       <div class="dialog-body">
//         <div class="caption">收件地址超出我司派送范围内，请选择以下操作或咨询您的商务：</div>
//         <div class="self-pickup-wrap" :style="{borderColor:isHomeDelivery?'':'#7C57DF'}">
//           <div class="title">网点自提</div>
//           <div class="content">
//             <div>
//               <div class="row">
//                 <span class="label">自提地址：</span>
//               <span style="max-width: 428px;display:inline-block">{{superZoneInfo.selfLiftingAddress}}</span>
//                <span class="copy-address" v-if="superZoneInfo.selfLiftingAddress"  v-clipboard='superZoneInfo.selfLiftingAddress'>
//                  复制地址</span>
//              </div>
//               <div class="row"><span class="label">自提距离：</span>{{superZoneInfo.length}}km</div>
//             </div>
//             <el-radio v-model="isHomeDelivery" :label="false"><span></span></el-radio>
//           </div>
//         </div>
//         <div class="home-delivery-wrap" :style="{borderColor:isHomeDelivery?'#7C57DF':''}">
//           <div class="title">送货上门（超区需收取派送费）</div>
//           <div class="content">
//             <div >
//               <div class="row"><span class="label">超区费用：</span> <span style="color:red">￥{{superZoneInfo.superAreaFee}} 元</span></div>
//               <div class="row">
//                 <span class="label">超区距离：</span> {{superZoneInfo.length}}km
//                 <span class="label" style="padding-left:50px">超区价格：</span> {{superZoneInfo.superAreaUnitePrice}} 元/km
//               </div>
              
//             </div>
            
//             <el-radio v-model="isHomeDelivery" :label="true"><span></span></el-radio>
//           </div>
//         </div>
//       </div>
//       <span slot="footer" class="dialog-footer">
//         <el-button @click="dialogVisible = false">取 消</el-button>
//         <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
//       </span>
//     </el-dialog>
//   </div>
// </template>

// <script>
// export default {
//   name: "SuperZone",
//   data () {
//     return {
//       loading: false,
//       dialogVisible: false,
//       isHomeDelivery: false,
//       superZoneInfo: {},
//       callbackFunc: Function
//     }
//   },
//   methods: {
//     showDialog (superZoneInfo, callbackFunc) {
//       this.dialogVisible = true
//       this.superZoneInfo = superZoneInfo
//       this.callbackFunc = callbackFunc
//     },
//     async saveData () {
//       try {
//         this.loading = true
//         const deliveryMode=this.isHomeDelivery ? '20' : '10'
//         if(this.callbackFunc){
//           await this.callbackFunc(deliveryMode)
//         }
//         this.$emit('on-confirm',deliveryMode)
//         this.dialogVisible = false
//       } catch (ex) {
//         console.log("ex :>> ", ex)
//       } finally {
//         this.loading = false
//       }
//     },
//   },
// }
// </script>

// <style lang="scss" scoped>
// /deep/.el-dialog__body{
//   padding-bottom: 24px;
// }
//   .dialog-body {
//     color: #333333;
//     font-size: 14px;
//     .caption {
//       font-size: 16px;
//       font-weight: bold;
//       padding: 4px 0 2px;
//     }
//     [class$="-wrap"] {
//       border: 1px solid #dcdae2;
//       border-radius: 7px;
//       margin-top: 16px;
//       // padding: 16px;
//     }
//     .title {
//       padding-left: 22px;
//       font-weight: bold;
//       height: 40px;
//       line-height: 40px;
//       border-bottom: 1px solid #cccccc;
//       background: linear-gradient(90deg,#eeefff, #ffffff);
//       border-radius: 7px 7px 0 0;
//     }
//     .content {
//       display: flex;
//       padding:0 12px 0 22px;
//       line-height: 20px;
//       .row {
//         margin: 14px 0;
//         .copy-address{
//           vertical-align: top;
//           padding-left: 17px;
//           position: relative;
//           color: #9a5fff;
//           cursor: pointer;
//              &::before {
//             content: '';
//             display: block;
//             width: 1px;
//             height: 12px;
//             background: #d8d8d8;
//             position: absolute;
//             left: 7px;
//             top: 2px;
//           }
//         }
//       }
//       .label {
//         color: #999999;
//         vertical-align: top;
//       }
//       .el-radio {
//         margin-left: auto;
//         align-self: center;
//       }
//     }
//   }
// </style>
