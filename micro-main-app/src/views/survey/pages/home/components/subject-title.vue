<template>
  <div :class="['subject-title', subject.isAnswer ? 'is-scroll' : '']">
    <div class="subject">
      <span class="number" v-if="subjectTitle > 0">{{ subjectTitle }}</span>
      {{ subject.questionTitle }}
      <span class="xin" v-if="subject.mustAnswer === '10'">*</span>
      <span class="tip" v-if="subject.subjectType === 1">单选</span>
      <span class="tip" v-if="subject.subjectType === 2">多选</span>
      <span class="warn" v-if="subject.isAnswer && subject.answerContent === '' && subject.isAnswer">此题未作答</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "subject-title",
  props: {
    // 序号
    index: {
      type: Number,
      default: 0,
    },
    subject: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    subjectTitle() {
      return `${this.padZero(this.index)}`
    }
  },
  methods: {
    /** 序号 */
    padZero(num, targetLength = 2) {
      let str = num + ''
      while (str.length < targetLength) {
        str = '0' + str
      }
      return str
    }
  },
}
</script>

<style lang="scss">
.subject-title {
  padding: 30px 34px 10px;
  margin-top: 20px;
  background-color: #fff;
  .subject {
    font-size: 18px;
    font-weight: 500;
    color: #333333;
    line-height: 25px;
    text-align: justify;
    word-break: break-all;
    .number{
      font-size: 18px !important;
    }
    .xin {
      color: #f99257;
      vertical-align: sub;
      font-size: 18px !important;
    }
    .tip {
      display: inline-block;
      width: 38px;
      height: 18px;
      line-height: 18px;
      margin-left: 16px;
      background: #9673f6;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      text-align: center;
      vertical-align: middle;
    }
    .warn {
      display: inline-block;
      width: 101px;
      height: 30px;
      line-height: 23px;
      margin-left: 10px;
      background: url(../../../image/warn.png) no-repeat;
      background-size: 100%;
      font-size: 16px;
      font-weight: 400;
      color: #fff;
      text-align: center;
    }
  }
}
</style>
