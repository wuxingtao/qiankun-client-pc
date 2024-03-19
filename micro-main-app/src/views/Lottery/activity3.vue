<template>
  <div class="page__activity full-screen page-bg">
    <div class="page__content">
      <div class="page__aside">
        <div class="page__aside-img">
          <div class="gift__title">跨越高定飞机礼盒</div>
          <div class="gift__bg">
            <img src="@assets/image/lottery/gift-img.png" alt="">
          </div>
          <div class="gift__img">
            <img src="@assets/image/lottery/gift-0.png" alt="">
          </div>
        </div>
      </div>
      <div class="page__right">
        <div class="gift__box">
          <div class="gift__content">
            <div class="code__list">
              <template v-if="pageStatus === 0">
                <user-list ref="userListRef"></user-list>
                <div class="gift__btn btn--lottery-img" @click="drawPrize">
                  <img src="@assets/image/lottery/btn-start.png">
                </div>
              </template>
              <template v-else>
                <result-list :dataList="dataList" :level="level"></result-list>
                <div class="gift__btn btn--lottery-img" @click="switchStatus(0)">
                  <img src="@assets/image/lottery/btn-back.png">
                </div>
              </template>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import ResultList from './components/result-list'
import UserList from './components/user-list'
import {drawPrize,queryDrawResult} from '@views/Lottery/api/api'

export default {
  name: "activity3",
  components:{ResultList,UserList},
  data(){
    return {
      level:3,
      dataList:[],
      pageStatus: 0 // 0 待抽奖 1 抽奖结果页
    }
  },
  methods:{
    async getDrawResult(){
      this.pageStatus = 1
      let res = await queryDrawResult({level:this.level})
      if(res.code === 0 && res.data){
        this.dataList = res.data
      }

    },
    async drawPrize(){
      let res = await drawPrize({level:this.level})
      if(res.code === 0 && res.data && res.data.length >0 ){
        this.$message.success('抽奖成功')
      }
      this.getDrawResult()
    },
    switchStatus(val){
      this.pageStatus = val
      if(val === 1){
        this.dataList = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './activity';
</style>
