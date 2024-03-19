<template>
  <div class="scoring-question">
    <div class="content">
      <div
        :class="subject.answerIndex >= index ? 'star-light' : 'star-grey'"
        v-for="(item, index) in subject.optionList"
        @click="onClick(item, index)"
        :key="index"
      ></div>
      <div class="text">{{ subject.answerContent }}</div>
    </div>
  </div>
</template>

<script>
import jumpSubjectMixin from "./jumpSubjectMixin.js"
export default {
  name: "scoring-question",
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {}
  },
  methods: {
    onClick(item, index) {
      this.subject.optionList.findIndex((option, idx) => {
        if (index === idx) {
          this.subject.answerContent = option.content
          this.subject.answerIndex = index
        }
      })

      // 跳题
      this.jumpSubjectFn(item.content, this.subject['jumpSubjectId'])
    },
  },
}
</script>

<style lang="scss" scoped>
.scoring-question {
  padding: 0 30px 34px 30px;
  margin-bottom: 20px;
  background-color: #fff;
  .content {
    display: flex;
    align-items: center;
    .star-grey {
      width: 40px;
      height: 40px;
      margin-right: 40px;
      background: url(../../../image/star-grey.png) no-repeat;
      background-size: cover;
    }
    .star-light {
      width: 40px;
      height: 40px;
      margin-right: 40px;
      background: url(../../../image/star-light.png) no-repeat;
      background-size: cover;
    }
    .text {
      font-size: 16px;
      font-weight: 400;
      text-align: center;
      color: #666666;
    }
  }
}
</style>
