<!-- 
    异常页面 404 500
 -->
<template>
    <div class="unusual-page">
        <div class="status-pic">
            <img class="unusual-pic" :src="pic" alt="">
        </div>
        <div class="container">
            <div class="msg">{{msg}}</div>
            <div class="handle">
                <el-button @click="toIndexView" type="primary">返回跨越首页</el-button>
            </div>
            <div class="copyright">(KYE)跨越速运     版权所有 2007-2008 <a href="http://beian.miit.gov.cn/" style="text-decoration:underline;color: rgba(255, 255, 255, 0.8);">粤ICP备08000894号</a></div>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    msg: {
      type: String
    },
    pic: {
      type: String,
      default: '../../assets/image/404.svg'
    }
  },
  methods: {
    toIndexView(){
      window.location = '//www.ky-express.com/'
    }
  }
}
</script>

<style lang="scss" scoped>
.unusual-page{
    background-color: #f7f8fa;
    height: 100vh;
    position: relative;
    .status-pic{
        position: absolute;
        left: 0;
        top: 20vh;
        width: 100%;
        text-align: center;
    }
    .unusual-pic{
        height: 70vh;
    }
    .container{
        padding-top: 65vh;
        text-align: center;
        z-index: 10;
        position: relative;
        .copyright{
            font-size: 14px;
            color: #999999;
            margin-top: 116px;
        }
        .msg{
            font-size: 28px;
            color: #666666;
        }
        .handle{
            margin-top: 30px;
        }
        .el-button--primary{
            height: 48px;
            font-size: 18px;
        }
    }

}
</style>