<template>
  <div class='container'>
    <div class='icon-text'>
      <i class='iconfont icon-introduct'></i>服务介绍
    </div>
    <div class='desc-text'>
      若您选择跨越速运的保价服务，当货物在运输途中发生丢货或破损时，跨越速运将按照声明价值和损失比例进行合理赔偿，赔偿金额最高不超过货物实际损失。
    </div>
    <div class='icon-text'>
      <i class='iconfont icon-standard'></i>收费标准
    </div>
    <div class='standard'>
      <img src='@assets/image/delivery/service_decimal_price_img3.png' alt='保价费率'>
      <img class='flr' src='@assets/image/delivery/service_decimal_price_img1.png' alt='最低收费'>
      <div class='attention-text'>
        <div class='desc-text inline-block'>
          <i class='mark-word'>注</i>
          1、 尾数遵循四舍五入的原则；2、 整车费率为1‰，最低收费50元；
        </div>
      </div>
    </div>
    <div class='icon-text'>
      <i class='iconfont icon-advantage'></i>服务优势
    </div>
    <div class='advantage clearfix'>
      <div class='advantage-item_4'>
        <img src='@assets/image/delivery/service1.png' alt='费率低' srcset=''>
        <p>费率低</p>
      </div>
      <div class='advantage-item_4'>
        <img src='@assets/image/delivery/service2.png' alt='安全保障' srcset=''>
        <p>安全保障</p>
      </div>
      <div class='advantage-item_4'>
        <img src='@assets/image/delivery/service3.png' alt='手续便捷' srcset=''>
        <p>手续便捷</p>
      </div>
      <div class='advantage-item_4'>
        <img src='@assets/image/delivery/service4.png' alt='快速理赔' srcset=''>
        <p>快速理赔</p>
      </div>
    </div>
    <div class='icon-text'>
      <i class='iconfont icon-send'></i>寄件须知
    </div>
    <div class='desc-text' style='padding-bottom: 0px;'>
      <p>
        1、
        货物声明价值不得超过货物实际价值，每票货物最高声明价值不超过人民币10万元，如保价值超出人民币10万元必须同跨越速运销售代表确认方可生效；
      </p>
      <p>
        2、若选择保价，按托寄物的声明价值和损失比例(重量或件数比例)赔偿，托寄物声明价值高于实际价值的，按实际价值的损失比例赔偿；
      </p>
      <p>
        3、
        如选择保价，收方签收时须验收货物完整性,否则签收后视为货物完好无损；
      </p>
      <p>4、玻璃制品保丢不保损；</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'valuation.vue'
}
</script>

<style lang='scss' scoped>
@import './common.scss';
</style>