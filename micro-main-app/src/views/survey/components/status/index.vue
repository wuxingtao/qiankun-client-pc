<template>
  <div class="status">
    <div class="header">
      <div class="logo">
        <img src="../../image/logo.png" alt="" />
        <div class="line"></div>
      </div>
    </div>
    <div class="content">
      <div class="success" v-if="+status === 1">
        <div class="icon-success"></div>
        <div class="success-text">提交成功</div>
        <div v-if="questionDetailData.integeNum <= 0" class="tip__text">感谢您的参与</div>
        <div class="des" v-if="questionDetailData.integeNum > 0">
          <div>
            1、您已获得<span class="light"
              >{{ questionDetailData.integeNum }}积分</span
            >，可进入跨越领鲜小程序或跨越APP-商城进行消费；
          </div>
          <div>
            2、<span class="light">关注跨越速运公众号</span
            >，进入“会员中心”查看积分。
          </div>
        </div>
        <div class="btn-result" @click="goResult(questionDetailData.id)">查看提交结果</div>
        <div class="erweima" v-if="questionDetailData.integeNum > 0">
          <div class="img"></div>
          <div class="wx-text">微信扫一扫关注公众号</div>
        </div>
      </div>
      <div
        class="not-started"
        v-if="+status === 2"
      >
        <div class="icon-started"></div>
        <div class="title">未开始</div>
        <div class="text">问卷开始时间为{{ notStartTime }}</div>
      </div>
      <div
        class="stop"
        v-if="+status === 3"
      >
        <div class="icon-fail"></div>
        <div class="title">问卷已回收</div>
        <div class="text">感谢您的参与</div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs"
export default {
  name: "status",
  props: {
    questionDetailData: {
      type: Object,
    },
    status: {
      type: Number
    }
  },
  data() {
    return {
      questionId: "",
    }
  },
  computed: {
    /** 问卷是否过期 1（成功）0（失败）2（未开始）3（接口数据异常）5（问卷已结束） */
    notStartTime() {
      return dayjs(this.questionDetailData.startTime).format("YYYY年MM月DD日") || 0
    },
  },
  created() {
  },
  methods: {
    goResult(id) {
      this.$router.push({
        path: '/admin/result',
        query: {
          id
        }
      })
    }
  },
}
</script>
<style lang="scss" scoped>
.status {
  width: 1000px;
  margin: 0 auto;
  height: 872px;
  background-color: #fff;
  .logo {
    padding: 30px 34px 34px;
    height: 111px;
    background: linear-gradient(180deg, #f2eeff, #ffffff);
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
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 15%;

    .success {
      display: flex;
      flex-direction: column;
      align-items: center;
      .icon-success {
        width: 70px;
        height: 70px;
        background: url(../../image/success.png) no-repeat;
        background-size: cover;
      }
      .success-text {
        margin-top: 17px;
        font-size: 18px;
        font-weight: 600;
        color: #333333;
      }
      .des {
        margin-top: 30px;
        font-size: 14px;
        font-weight: 400;
        text-align: justify;
        color: #333333;
        line-height: 22px;
        .light {
          color: #f99257;
          font-size: 14px;
        }
      }
      .btn-result {
        width: 168px;
        height: 52px;
        line-height: 52px;
        margin-top: 43px;
        background: linear-gradient(315deg, #a482ff 0%, #b69bff 100%);
        border-radius: 44px;
        box-shadow: 0px 3px 12px 0px #dfd3ff, 0px 9px 22px 0px #dfd4ff;
        font-size: 18px;
        font-weight: 500;
        text-align: center;
        color: #ffffff;
        cursor: pointer;
      }
      .tip__text {
        margin-top: 8px;
        font-size: 16px;
        font-weight: 400;
        color: #666666;
      }
      .erweima {
        margin-top: 60px;
        .img {
          width: 117px;
          height: 117px;
          background: url(../../image/erweima.png) no-repeat;
          background-size: cover;
        }
        .wx-text {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 600;
          text-align: justify;
          color: #333333;
        }
      }
    }

    .stop {
      display: flex;
      flex-direction: column;
      align-items: center;
      .icon-fail {
        width: 70px;
        height: 70px;
        background: url(../../image/fail.png) no-repeat;
        background-size: cover;
      }
      .title {
        margin-top: 52px;
        font-size: 23px;
        font-weight: 600;
        color: #333333;
      }
      .text {
        margin-top: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #666666;
      }
    }

    .not-started {
      display: flex;
      flex-direction: column;
      align-items: center;
      .icon-started {
        width: 70px;
        height: 70px;
        background: url(../../image/not-started.png) no-repeat;
        background-size: cover;
      }
      .title {
        margin-top: 52px;
        font-size: 23px;
        font-weight: 600;
        color: #333333;
      }
      .text {
        margin-top: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #666666;
      }
    }
  }
}
</style>
