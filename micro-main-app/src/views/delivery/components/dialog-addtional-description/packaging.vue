<template>
  <div class='container'>
  <div class='icon-text'>
    <i class='iconfont icon-introduct'></i>服务介绍
  </div>
  <div class='desc-text'>
    为了更好的保障您的货物安全，跨越速运为您提供更专业、多样化、环保防水、防止信息泄露等的包装服务。
    <div class='products pt14 clearfix'>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack1.png' alt='木箱'></div>
        <p class='product-name'>木箱</p>
        <p class='product-desc'>
          用塑料泡沫填充木箱内部
          <br>防压、防震、双重保险
        </p>
      </div>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack2.png' alt='木架'></div>
        <p class='product-name'>木架</p>
        <p class='product-desc'>
          用木架进行二次固定包装
          <br>在原基础上再一次增加防压、防震能力
        </p>
      </div>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack3.png' alt='防水薄膜'></div>
        <p class='product-name'>防水薄膜</p>
        <p class='product-desc'>
          机制防水，全程无忧。采用三层薄膜保护，拒绝货物潮湿进水
        </p>
      </div>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack4.png' alt='木质托盘'></div>
        <p class='product-name'>木质托盘</p>
        <p class='product-desc'>
          不腐烂、耐磨、抗冲击力强，无膨胀现象，不易起层等
        </p>
      </div>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack5.png' alt='塑料托盘'></div>
        <p class='product-name'>塑料托盘</p>
        <p class='product-desc'>
          洁净卫生，质轻、无钉刺、耐酸碱、无质变、易清洗、安全等
        </p>
      </div>
      <div class='product'>
        <div class='img'><img src='@assets/image/delivery/pack6.png' alt='防水编织袋'></div>
        <p class='product-name'>防水编织袋</p>
        <p class='product-desc'>
          规格：根据货物大小定制
          <br>密度：48X48根/10cm <br>类型：外层包装服务
        </p>
      </div>
    </div>
  </div>
  
  <div class='icon-text'>
    <i class='iconfont icon-standard'></i>收费标准
  </div>
  <div class='products pt14 clearfix'>
    <div class='product_4 product-small'>
      <div class='img'>
        <img src='@assets/image/delivery/pack2.png' alt='木架（半封闭）'>
      </div>
      <p class='product-name'>木架（半封闭）</p>
      <!--      <p class='product-desc'>180元/方，最低30元/票</p>-->
    </div>
    <div class='product_4 product-small'>
      <div class='img'><img src='@assets/image/delivery/pack1.png' alt='木箱（全封闭）'></div>
      <p class='product-name'>木箱（全封闭）</p>
      <!--      <p class='product-desc'>230元/方，最低60元/票</p>-->
    </div>
    <div class='product_4 product-small'>
      <div class='img'><img src='@assets/image/delivery/pack5.png' alt='托盘（木质/塑料）'></div>
      <p class='product-name'>托盘（木质/塑料）</p>
      <!--      <p class='product-desc'>标准60元/块，非标100/块</p>-->
    </div>
    <div class='product_4 product-small'>
      <div class='img'><img src='@assets/image/delivery/pack6.png' alt='防水薄膜/防水编织袋'></div>
      <p class='product-name'>防水薄膜/防水编织袋</p>
      <!--      <p class='product-desc'>免费</p>-->
    </div>
  </div>
  
  <div class='icon-text' style='margin-top: 30px;'>
    <i class='iconfont icon-advantage'></i>服务优势
  </div>
  
  <div class='advantage clearfix'>
    <div class='advantage-item_4'>
      <img src='@assets/image/delivery/service1.png' alt='可定制包装' srcset=''>
      <p>可定制包装</p>
    </div>
    <div class='advantage-item_4'>
      <img src='@assets/image/delivery/service2.png' alt='抗震减压' srcset=''>
      <p>抗震减压</p>
    </div>
    <div class='advantage-item_4'>
      <img src='@assets/image/delivery/service3.png' alt='专业环保' srcset=''>
      <p>专业环保</p>
    </div>
    <div class='advantage-item_4'>
      <img src='@assets/image/delivery/service4.png' alt='降低破损' srcset=''>
      <p>降低破损</p>
    </div>
  </div>
  
  <div class='icon-text' style='margin-top: 30px;'>
    <i class='iconfont icon-send'></i>寄件须知
    <div class='product-desc'>以上收费标准及实际可提供的包装可能因服务(产品)或所在地区不同而有所差异，详情请咨询专属销售。</div>
  </div>
  </div>
</template>

<script>
export default {
  name: "packaging"
}
</script>

<style lang='scss' scoped>
@import './common.scss';
</style>