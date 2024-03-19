<template>
  <div class="rule__page full-screen page-bg">
    <div class="rule__content">
      <div class="rule__side inline-block">
        <img src="@assets/image/lottery/kye-activity-desc.png">
      </div>
      <div class="rule__list inline-block">
        <div class="rule__list-box">
          <div class="rule__list-content">
            <div class="rule__list-text font-color t_a_l">
              奖项说明： <br>
              王者之星：华为MATE40RS保时捷限量款 - 1名 <br>
              卓越之星：大疆AIR 2S无人机-畅飞套装 - 3名 <br>
              精锐之星：大疆灵眸pocket2-全能套装 - 5名 <br>
              跨越之星：跨越高定飞机礼盒 - 15名
            </div>
            <div class="btn--lottery btn--lottery-img">
              <img src="@assets/image/lottery/btn-startsoon.png">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "desc"
}
</script>

<style lang="scss" scoped>
@import './global.scss';
.rule__content{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin:auto vm(230) auto 0;
  height: vm(960);
  display: flex;
  align-items: flex-end;
}
.rule__side{
  img{
    width: vm(1338);
    height: vm(960);
  }
}
.rule__list{
  width: vm(777);
  height: vm(614);
  margin: 0 0 vm(40) vm(-190);
  background-image:url('../../assets/image/lottery/card_bg1.png');
  background-repeat: no-repeat;
  background-size:100%;
  font-size: vm(24);
  font-weight: 500;
  z-index:-1;
  &-box{
    position: relative;
    height: 100%;
    margin-left: vm(100);
    text-align: center;
    box-sizing: border-box;
    display: flex;
    align-items: center;

  }
  &-content{
    padding-left: vm(100);
    margin-top: vm(-100);
    line-height: 1.5;
  }
}
.btn--lottery{
  position: absolute;
  left: 0;
  right: 0;
  bottom: vm(30);
  margin: auto;
  img{
    width:100%;
  }
}
</style>
