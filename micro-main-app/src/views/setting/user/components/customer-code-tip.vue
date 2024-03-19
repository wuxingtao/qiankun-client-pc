<template>
  <div class='customer-code-tip__container'>
    <div class='title'>
      <img src="../../../../assets/image/setting/user/icon-customer.png" />
      什么是客户编码？
    </div>
    <div class='content'>客户编码是我司为保障客户权益，提供的个性化定制的唯一服务账号。</div>
    <div class='title'>
      <img src="../../../../assets/image/setting/user/icon-customer2.png" />
      为什么要绑定客户编码？
    </div>
    <div class='content'>绑定客户编码后，客户可在微信公众号、小程序、APP及官网等渠道自主下单、查件、<br />预存运费、查时效等。</div>
    <div class='title'>
      <img src="../../../../assets/image/setting/user/icon-customer3.png" />
      如何获取客户编码？
    </div>
    <div class='content step3'>
      <div><span>1</span>进入“我的”个人中心申请绑码</div>
      <div><span>2</span>专属商务对接获取唯一客户编码</div>
      <div><span>3</span>手机号绑定客户编码--绑定成功</div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.customer-code-tip__container {
  width: 600px;
  // height: 210px;
  margin: 20px 20px 24px;
  background: url('~@/assets/image/setting/user/customer-code2-bg.png') no-repeat top right;
  background-position: calc(100% - 10px) calc(100% - 10px);
  background-color: #f6f8ff;
  padding: 22px 40px 2px;
  box-sizing: border-box;
  
  .title {
    font-size: 12px;
    font-weight: bold;
    text-align: left;
    color: #03050d;
    line-height: 12px;
    margin-bottom: 8px;
    position: relative;

    
    img{
      position: absolute;
      left: -23px;
      top: -2px;
      width: 16px;
      height: 16px;
      // margin-right: 8px;
    }
  }
  
  .content {
    font-size: 12px;
    font-weight: 400;
    text-align: left;
    color: #73738b;
    line-height: 18px;
    margin-bottom: 18px;
    &.step3{
      &>div{
        margin-bottom: 10px;
      }
      span{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        transform : scale(0.85);
        background: #8f8fa8;
        border-radius: 50%;
        color: #fff;
        margin-right: 4px;
      }
      // span+span{
      //   margin-left: 20px;
      // }
    }
  }
}
</style>