<template>
  <div>
    <div class="lottery__title">
      <h3 class="lottery__text">{{levelName}}</h3>
      <div class="lottery__title-bottom">
        <img src="@assets/image/lottery/lottery_title_icon.png">
      </div>
    </div>
    <template v-if="level == '0'">
      <div class="single__code">
        <div class="single__title">获奖码：{{dataList[0].prizeNo}}</div>
        <code-item :info="dataList[0]"></code-item>
      </div>
    </template>
    <template v-else>
      <code-list :data-list="dataList"></code-list>

    </template>
  </div>
</template>

<script>
import CodeList from './code-list'
import CodeItem from './code-item'

export default {
  name: "result-list",
  components:{CodeList,CodeItem},
  props:{
    dataList:{
      type: Array,
      default: ()=> []
    },
    level:{
      type:String|Number,
      default:()=>0
    }
  },
  data(){
    return {
      pagination: {
        current: 0,
        size: 1000
      },
      totalNum :0,
      levelList:['王者之星','卓越之星','精锐之星','跨越之星']
    }
  },
  computed:{
    levelName(){
      return this.levelList[this.level]
    }
  },
  methods:{

  }
}
</script>

<style lang="scss" scoped>
@import '../base.scss';

.lottery__title{
  text-align: center;
  margin-top: vm(-40);
}
.lottery__text{
  font-size:vm(36);
  font-weight: bold;
  color: #551b25;
  margin-bottom:vm(22);
}
.lottery__title-bottom{
  img{
    width: vm(519);
    height: vm(44);
  }
}
.single__title{
  color: #551b25;
  font-size: vm(48);
  font-weight: 500;
  margin-top: vm(160);
  margin-bottom: vm(50);
}
.single__code{
  text-align: center;
  /deep/ .info{
    .phone{
      margin-bottom:0;
      font-size: vm(24);
    }
    .code{
      display:none;
    }
  }
}
</style>
