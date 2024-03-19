<template>
  <ky-dialog title='保价说明' custom-class='unconvered-goods-dialog' :visible.sync='visibleFlag' append-to-body
             width='700px'>
    <el-scrollbar style='height: 500px;'>
      <div class='content-title'>保价说明</div>
      <div class='content'>
        <dl>
          <dt>一、保价及货损赔偿</dt>
          <dd>
            （一）本公司对托寄物提供保价服务。如托寄物在托寄过程中发生毁损、灭失，保价与否将直接影响本公司赔偿的金额，由您根据托寄物的实际价值和赔偿要求,自行评估并选择是否保价，本公司建议您贵重物品和单票价值超过人民币壹仟元的托寄物尽量向本公司提出“保价”服务。具体规则如下：
          </dd>
          <dd><b>1.普货类</b>（除整车运输和生鲜类之外的所有类型）</dd>
          <dd class='bold'>1.1若您未购买保价的，如因本公司原因导致托寄物毁损、灭失，本公司按托寄物的实际损毁价值赔偿。<span class='red'>但月结客户货损赔偿金额不超过单票服务费的9倍，最高赔偿限额为4000元；非月结客户，本公司默认收取保价费2元，但货损赔偿金额不超过单票服务费的7倍，最高赔偿限额为2000元。</span>
          </dd>
          <dd class='bold'>1.2若您购买保价的，保价费为声明价值的4‰。<span
            class='red'>发生托寄物破损、短少或灭失情形，本公司按托寄物的实际价值及货损比例给予赔偿，但最高不超过托寄物实际价值。</span></dd>
          <dd><b>2.生鲜类</b>（指水蜜桃、荔枝、枇杷、樱桃、杨梅、大闸蟹等）</dd>
          <dd>2.1本公司对生鲜类托寄物提供保价服务，<b>保价费每件1元/件，</b>每件指独立包裹托运货物的最小规格包装，<span class='bold red'>赔偿标准为托寄物实际成本价值，但每票最高赔偿不超过500元。</span>
          </dd>
          <dd class='bold red'>2.2若您未购买保价的，本公司仅对托寄物丢失予以赔偿。</dd>
          <dd class='bold red'>
            2.3若您购买保价的，本公司对托寄物丢失予以赔偿，在时效范围内发生的货物损毁、变质、出水、霉烂、发臭等影响食用或销售的不予赔偿。通常把前述理赔规则简称为“保时、保丢、不保损”。因本公司原因延迟派送超出合同约定的时效，导致托寄物变质、出水、霉烂、发臭等影响食用或销售的；或在派送时效范围内，如因本公司过错造成托寄物包装破损导致托寄物变质、出水、霉烂、发臭等情形，本公司按托寄物的实际价值及货损比例给予赔偿。
          </dd>
          <dd class='bold'>3.整车类</dd>
          <dd class='bold'>3.1未保价的货物，在派送过程中，如因本公司原因导致货物毁损、灭失的，按货物的实际损毁价值赔偿，<span class='red'>但月结客户赔偿金额不超过单车运费的9倍，最高赔偿限额为4000元；非月结客户赔偿金额不超过单车运费的7倍，最高赔偿限额为2000元。</span>
          </dd>
          <dd class='bold'>3.2货物保价的，<span class='red'>保价费为货物声明价值的1‰。发生货物破损、短少或灭失情形，足额保价的，按照货物实际毁损价值再减去免赔额进行赔偿；未足额保价的，则按照（声明价值÷货物实际价值）×货物实际毁损价值-免赔额进行赔偿。</span>
          </dd>
          <dd class='bold red'>
            3.3免赔额：每次事故货损免赔额为100元或损失金额的5%，两者以高者为准；发生盗抢、丢失的免赔额为3000元或损失金额的10%，两者以高者为准；易碎品免赔额为100元或损失金额的10%，两者以高者为准。
          </dd>
          <dd class='bold'><span class='red'>（二）保价只赔付托寄物实际损失（直接损失），</span>即托寄物本身的物理价值，对于托寄物破损、短少或灭失引起的间接损失不做核定及赔偿，如：误工费、利润、罚款、停产、停线延误等。
          </dd>
          <dd>（三）鉴于本公司无法评估托寄物的实际价值，您需按托寄物实际价值填写托寄物的声明价值，并缴纳保价费。</dd>
          <dd class='bold'>（四）您在下单前应当认真阅读本声明并根据真实情况选择保价，如您错误选择保价，本公司按收取保价费的80%予以退回。</dd>
          <dd class='bold red'>（五）如您的托寄物声明价值如超过500万，须在下单前联系本公司销售人员确认该托寄物是否可以购买保价服务；如果没有得到本公司书面回复同意的，视为本公司不提供保价服务。</dd>
          
          <dt>
            二、月结客户是指与本公司已签署服务协议的合作方，且在协议中约定服务费的结算方式为月结。非月结客户是指除月结客户以外的寄方或到付收方。若您与本公司已经签署相关书面协议的，相关书面协议约定与本保价说明存在冲突的，以书面协议为准；书面协议没有约定的，按照本保价说明约定执行。
          </dt>
          
          <dt class='bold'>三、<span class='red'>本公司对下列物品不提供保价服务</span></dt>
          <dd class='bold'>（一）现金、支票、票据、单证、有价证券、信用证、文件、档案、账册、图纸、护照；</dd>
          <dd class='bold'>（二）艺术品、玉器、文物古玩、乐器、单价超过人民币1万元的手表；</dd>
          <dd class='bold'>（三）名贵木材（如紫檀、黄花梨、红酸枝等）为原料的家具；</dd>
          <dd class='bold'>（四）鱼粉、菜籽饼、地瓜干、花生、各类粮食、饲料、原糖等有自燃特性、易腐易蛀货物；</dd>
          <dd class='bold'>
            （五）中国大陆境内无修复或定损技术能力和相关配件的精密仪器或设备（任何仪器或设备如果满足以下条件之一，应视为精密仪器或设备：a.运输过程中对该仪器或设备的平衡、稳定、防震、防尘、搬运倾斜角度等有特殊严格要求；b.仪器或设备受损后无法找到配件，必须运回国外原厂修理或无法修复的；c.单件仪器或设备货值超过人民币200万元）；
          </dd>
          <dd class='bold'>（六）危险品、易燃易爆物品、卫星、武器弹药、军用品、成品车；</dd>
          <dd class='bold'>（七）动植物、海货、鲜活货；</dd>
          <dd class='bold'>（八）赠品、赔偿物资、援助物资；</dd>
          <dd class='bold'>（九）原木、钢材、矿石、矿砂类；</dd>
          <dd class='bold'>（十）舱面货（集装箱运输方式除外）；</dd>
          <dd class='bold'>（十一）返修、在用货物、旧货、二手货品；</dd>
          <dd class='bold'>
            （十二）重大机械设备（任何机械设备如果满足以下条件之一，应视为重大机械设备：a.任一部件由于体积或重量的原因必须由特殊运输工具运输；b.任一部件由于本身的特殊性必须特殊处理，如要求特殊的绑扎固定及保持重心的平衡）；
          </dd>
          <dd class='bold'>（十三）汽车、摩托车、船舶、飞机、游艇、风力发电相关设备及叶片；</dd>
          <dd class='bold'>（十四）超宽或超高货物（以《交通事故认定书》认定为准）。</dd>
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
  data() {
    return {
      visibleFlag: false
      
    }
  },
  watch: {
    visible(val) {
      this.visibleFlag = val
    },
    visibleFlag(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
.unconvered-goods-dialog {
  .el-dialog__body {
    border-top: 1px solid #f1f1f5;
    border-bottom: 1px solid #f1f1f5;
    padding: 0 !important;
    margin: 0 !important;
    border-top: unset;
    
    .content-title {
      padding-top: 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      color: $--color-text-primary;
      // padding-bottom: 24px; 
    }
    
    .content {
      padding: 0 20px;
      color: #333333;
      font-size: 12px;
      
      .content-desc {
        color: #fc2020;
        line-height: 22px;
      }
      
      dl {
        .bold,
        b {
          &,
          & span {
            font-weight: bold;
          }
        }
        
        .red {
          color: #fc2020;
        }
        
        dt {
          font-weight: bold;
          line-height: 22px;
          padding: 20px 0 8px;
        }
        
        dd {
          line-height: 24px;
          // padding-bottom: 6px;
        }
      }
    }
  }
}
</style>


