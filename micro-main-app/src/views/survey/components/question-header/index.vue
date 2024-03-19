<template>
  <div class="question-header">
    <div class="logo">
      <img src="../../image/logo.png" alt="" />
      <div class="line"></div>
    </div>
    <div class="title-block">
      <div class="title">{{ questionDetailData.title }}</div>
      <div class="des">
        {{ questionDetailData.description }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "question-header",
  props: {
    questionDetailData: {
      type: Object
    }
  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.question-header {
  padding: 30px 0 40px 0;
  background: #ffffff;
  box-shadow: 0px 2px 20px 0px rgba(143, 140, 163, 0.1);
    background: linear-gradient(180deg, #f2eeff, #ffffff);
  .logo {
    padding: 30px 34px 34px;
    height: 111px;
    box-sizing: border-box;

    img {
      width: 210px;
      height: 52px;
    }

    .line {
      margin-top: 29px;
      border-bottom: 5px dotted #d8d8d8;
    }
  }
  .title-block {
    padding: 0 34px;
    margin-top: 40px;
    box-sizing: border-box;

    .title {
      font-size: 26px;
      font-weight: 500;
      color: #333333;
      text-align: center;
    }

    .des {
      margin-top: 20px;
      font-size: 16px;
      font-weight: 400;
      color: #333333;
      line-height: 36px;
      text-align: justify;
      text-indent: 2em;
      word-break: break-all;
    }
  }
}
</style>
