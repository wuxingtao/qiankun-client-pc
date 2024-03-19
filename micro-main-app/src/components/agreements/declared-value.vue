<template>
  <div class="declared-value__container">
    <div class='content-title'>保价说明</div>
      <div class='content'>
        <dl>
          <dt>一、普货类</dt>
          <dd class='bold'>
            （一）理赔规则
          </dd>
          <dd class='bold'><span class='red'>1.未保价的托寄物发生毁损、短少或灭失，本公司在服务费9倍内赔偿月结客户的实际损失，最高赔偿4000元；非月结客户，本公司默认收取2元保价费，在服务费7倍内赔偿实际损失，最高赔偿2000元。</span>
          </dd>
          <dd class='bold'>2.托寄物足额保价的，按照托寄物实际毁损价值赔偿；<span
            class='red'>未足额保价的，则按照（声明价值÷托寄物实际价值）×托寄物实际毁损价值进行赔偿。</span></dd>
          <dd>（二）收费标准</dd>
          <dd><b>保价费为托寄物声明价值的4‰。</b>
          </dd>
          <dd class='bold'>（三）免责条款</dd>
          <dd class='bold red'>
            1.未保价的易碎品以及含有易碎品部件的托寄物（如陶瓷、玻璃、灯具、液晶屏、显示器等），赔丢不赔损。
          </dd>
          <dd class='bold red'>2.因您包装不良造成托寄物损失，或托寄物外包装无破损痕迹而内件物品破损、数量短少的，本公司不承担赔偿责任。</dd>
          <dd class='bold red'>3.对于托寄物破损、短少或灭失引起的间接损失，如：孳息、商业利益、误工费、利润、罚款、停产、停线延误、客户索赔等，本公司不予赔偿
          </dd>
          <dd class='bold'><span class='red'>4.任何情况下，本公司对下列物品不提供保价服务，也不对损失进行认定和赔付。</span>
          如您错误选择保价，本公司按收取保价费的80%予以退回。
          </dd>
          <dd><span class='bold red'>	1) 返修、在用货物、旧货、二手货品；</span>
          </dd>
          <dd> <span class='bold red'>2)	艺术品、玉器、文物古玩、乐器、单价超过人民币1万元的手表；</span>
          </dd>
          <dd>3)现金、支票、票据、单证、有价证券、信用证、文件、档案、账册、图纸、护照；
          </dd>
          <dd>4)	<span class="bold">重大机械设备</span>（任何机械设备如果满足以下条件之一，应视为重大机械设备：a.任一部件由于体积或重量的原因必须由特殊运输工具运输；b.任一部件由于本身的特殊性必须特殊处理，如要求特殊的绑扎固定及保持重心的平衡）；</dd>
          <dd>5)	鱼粉、菜籽饼、地瓜干、花生、各类粮食、饲料、原糖等有自燃特性、易腐易蛀货物；</dd>
          <dd>6)	中国大陆境内无修复或定损技术能力和相关配件的精密仪器或设备（任何仪器或设备如果满足以下条件之一，应视为<span class="bold">精密仪器或设备</span>：a.运输过程中对该仪器或设备的平衡、稳定、防震、防尘、搬运倾斜角度等有特殊严格要求；b.仪器或设备受损后无法找到配件，必须运回国外原厂修理或无法修复的；c.单件仪器或设备货值超过人民币200万元）；</dd>
          <dd>7)	危险品、易燃易爆物品、卫星、武器弹药、军用品、成品车；</dd>
          <dd>8)	动植物、海货、鲜活货；</dd>
          <dd>9)	赠品、赔偿物资、援助物资；</dd>
          <dd>10)	原木、钢材、矿石、矿砂类；</dd>
          <dd>11)	舱面货（集装箱运输方式除外）；</dd>
          <dd>12)	名贵木材（如紫檀、黄花梨、红酸枝等）为原料的家具；</dd>
          <dd>13)	汽车、摩托车、船舶、飞机、游艇、风力发电相关设备及叶片；</dd>
          <dd>14)	超宽或超高货物（以《交通事故认定书》认定为准）。</dd>


          <dd ><span class='bold'>二、生鲜类</span>（指水蜜桃、荔枝、枇杷、樱桃、杨梅、大闸蟹等）
          </dd>
          
          <dd class='bold'>1.若您未保价的，本公司仅对托寄物丢失予以赔偿。</dd>
         <dd>2.若您保价的，保价费每件1元，托寄物<span class='bold'>丢失的，或因本公司原因延迟派送超出合同约定的时效并导致托寄物变质、出水、霉烂、发臭等影响食用或销售的，按托寄物的实际价值及货损比例给予赔偿，每票最高赔偿500元；但在时效范围内非因本公司过错发生的托寄物损毁、变质、出水、霉烂、发臭等影响食用或销售的不予赔偿。</span>（即“保时、保丢、不保损”）</dd>
        </dl>
      </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.declared-value__container{
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
</style>