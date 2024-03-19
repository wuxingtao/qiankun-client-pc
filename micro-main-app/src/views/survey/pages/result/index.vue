<template>
  <div class="result" v-if="Object.keys(questionDetailData).length > 0">
    <!-- 问卷标题 -->
    <question-header :questionDetailData="questionDetailData"></question-header>

    <div
      v-for="(subject, index) in questionDetailData.subjectList"
      :key="subject.id"
    >
      <!-- 题目标题 -->
      <subject-title :index="index + 1" :subject="subject"></subject-title>

      <!-- 简答题 -->
      <short-answer
        v-if="subject.subjectType === 4"
        :subject="subject"
      ></short-answer>

      <!-- 选择题 -->
      <choice
        v-if="[1, 2].includes(subject.subjectType)"
        :subject="subject"
      ></choice>

      <!-- 评分题 -->
      <scoring-question
        v-if="+subject.subjectType === 3"
        :subject="subject"
      ></scoring-question>

      <!-- 时间题 -->
      <time-block
        v-if="
          +subject.subjectType === 5 &&
            [500, 501, 502, 503, 504].includes(subject.subjectChildType)
        "
        :subject="subject"
      ></time-block>
    </div>
  </div>
</template>

<script>
import QuestionHeader from "../../components/question-header/index.vue"
import ShortAnswer from "./components/short-answer.vue"
import Choice from "./components/choice.vue"
import SubjectTitle from "./components/subject-title.vue"
import ScoringQuestion from "./components/scoring-question.vue"
import TimeBlock from "./components/time-block.vue"
import * as API from "@/services/api/survey"

export default {
  name: "result",
  components: {
    QuestionHeader, // 问卷标题
    SubjectTitle, // 题目标题
    ShortAnswer, // 简答题
    Choice, // 选择题
    ScoringQuestion, // 评分题
    TimeBlock, // 日期时间
  },
  data() {
    return {
      questionDetailData: {},
    }
  },
  created() {
    this.getQuestionDetailData()
  },
  methods: {
    /** 获取结果数据 */
    async getQuestionDetailData() {
      const { id: questionId } = this.$route.query

      if (!questionId) {
        return this.$message("必要参数不合法")
      }

      try {
        const { data } = await API.getByQuestionId({ questionId })
        this.questionDetailData = data
      } catch (err) {
        this.$message.error(err.message)
        throw new Error(err)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.result {
  width: 1000px;
  margin: 0 auto;
  background: #f7f7f7;
  box-shadow: 0px 2px 20px 0px rgba(143, 140, 163, 0.1);
}
</style>
