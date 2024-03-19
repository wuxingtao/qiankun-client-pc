<template>
  <ky-dialog title='不承保托寄物目录' custom-class='uncoverage-goods-agreement__container' :visible.sync='visibleFlag' append-to-body width='700px'>
    <el-scrollbar style='height: 500px;'>
      <div class="content">
        <div class="content-title">不承保托寄物目录</div>
        <div class="content-desc"> 任何情况下，跨越速运不对下列“不承保托寄物”的损失进行认定和赔付，也不对“不承保托寄物”导致的其他货物的损失进行认定和赔付。</div>
        <dl>
          <dd>1、现金、支票、票据、单证、有价证券、信用证、文件、档案、账册、图纸、护照；</dd>
          <dd class='bold'>2、艺术品、玉器、文物古玩、乐器、 单价超过人民币1万元的手表；</dd>
          <dd>3、名贵木材（如紫檀、黄花梨、红酸枝等）为原料的家具；</dd>
          <dd>4、鱼粉、菜籽饼、地瓜干、花生、各类粮食、饲料、原糖等有自燃特性、易腐易蛀货物；</dd>
          <dd class='bold'>5、中国大陆境内无修复或定损技术能力和相关配件的精密仪器或设备（任何仪器或设备如果满足以下条件之一，应视为精密仪器或设备：a.运输过程中对该仪器或设备的平衡、稳定、防震、防尘、搬运倾斜角度等有特殊严格要求；b.仪器或设备受损后无法找到配件，必须运回国外原厂修理或无法修复的；c.单件仪器或设备货值超过人民币200万元）；</dd>
          <dd>6、危险品、易燃易爆物品、卫星、武器弹药、军用品、成品车；</dd>
          <dd>7、动植物、海货、鲜活货；</dd>
          <dd>8、赠品、赔偿物资、援助物资；</dd>
          <dd class='bold'>9、原木、钢材、矿石、矿砂类；</dd>
          <dd>10、舱面货（集装箱运输方式除外）；</dd>
          <dd class='bold'>11、返修、在用货物、旧货、二手货品；</dd>
          <dd class='bold'>12、重大机械设备（任何机械设备如果满足以下条件之一，应视为重大机械设备：a.任一部件由于体积或重量的原因必须由特殊运输工具运输；b.任一部件由于本身的特殊性必须特殊处理，如要求特殊的绑扎固定及保持重心的平衡）；</dd>
          <dd>13、 汽车、摩托车、船舶、飞机、游艇、风力发电相关设备及叶片；</dd>
          <dd>14、 超宽或超高货物（以《交通事故认定书》认定为准）。</dd>

        </dl>
      </div>
    </el-scrollbar>
    <div slot='footer' class='dialog-footer'>
      <el-button size='medium' type='primary' @click='visibleFlag = false'>我知道了</el-button>
    </div>
  </ky-dialog>
</template>

<script>

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      visibleFlag: false
    }
  },
  watch: {
    visible (val) {
      this.visibleFlag = val
    },
    visibleFlag (val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
  .uncoverage-goods-agreement__container {
    .el-dialog__body {
      border-top: 1px solid #f1f1f5;
      border-bottom: 1px solid #f1f1f5;
      padding: 0 !important;
      margin: 0 !important;
      border-top: unset;
      .content {
        padding: 0 20px;
        color: #333;
        font-size: 12px;
        .content-title {
          padding-top: 20px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          color: $--color-text-primary;
          padding-bottom: 24px;
        }
        .content-desc {
          color: #fc2020;
          line-height: 22px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        dl {
          .bold,
          b {
            &,
            & span {
              font-weight: bold;
            }
          }
          dt {
            font-weight: bold;
            padding: 24px 0 16px;
          }
          dd {
            line-height: 22px;
          }
        }
      }
    }
  }
</style>


