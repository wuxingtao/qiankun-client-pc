<template>
    <div class="bill-container_r">
        <el-container style="height: 100%;">
            <el-header height="50px" class="header-container">
                <h3 class="header-title">我的账单</h3>
            </el-header>
            <el-main style="padding: 0;background: #fff;">
                <my-bill></my-bill>
            </el-main>
        </el-container>
    </div>
</template>
<script>
import MyBill from '../components/bill/index'
export default {
  name: 'bill',
  components: {
    MyBill
  },
  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
    .bill-container_r {
        background: #f7f9fa;
        height: 100%;
        position: relative;
        .header-container{
            color: #303133;
            font-size: 16px;
            background: #fff;
        }
        .header-title{
            height: 49px;
            line-height: 49px;
            font-style: normal;
            font-weight: bold;
            border-bottom: 1px solid #f1f1f5;
        }
    }

</style>
