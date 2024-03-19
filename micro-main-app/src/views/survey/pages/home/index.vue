<template>
  <div class="home" v-if="Object.keys(questionDetailData).length > 0">
    <div class="content">
      <!-- 通知 -->
      <div class="notify" v-if="isNotify && questionDetailData.integeNum > 0">
        <span class="notify__text">发福利啦，提交问卷，获取积分，兑换礼品！</span>
        <span class="notify__close" @click="closeNotify"></span>
      </div>
      <!-- 问卷标题 -->
      <question-header :questionDetailData="questionDetailData"></question-header>
      <template>
        <!-- 不存在跳题 -->
        <div v-for="subject in questionDetailData.subjectList" :key="subject.id">
          <template v-if="subject.isViewTopic">
            <!-- 题目标题 -->
            <subject-title :index="subject.titleindex + 1" :subject="subject"></subject-title>

            <!-- 简答题 -->
            <multi-input
              v-if="subject.subjectType === 4"
              :subject="subject"
              @hiddenItem="hiddenItem"
            ></multi-input>

            <!-- 单选题 -->
            <single-choice
              v-if="+subject.subjectType === 1"
              :subject="subject"
              @hiddenItem="hiddenItem"
            ></single-choice>

            <!-- 多选题 -->
            <multi-choice
              v-if="+subject.subjectType === 2"
              :subject="subject"
              @hiddenItem="hiddenItem"
            ></multi-choice>

            <!-- 评分题 -->
            <scoring-question
              v-if="+subject.subjectType === 3"
              :subject="subject"
              @hiddenItem="hiddenItem"
            ></scoring-question>

            <!-- 时间题 -->
            <template v-if="+subject.subjectType === 5">
              <!-- 日期范围 -->
              <date-range
                v-if="subject.subjectChildType === 504 || subject.subjectChildType === 503"
                :subject="subject"
                @hiddenItem="hiddenItem"
              ></date-range>

              <!-- 日期时间 -->
              <date-time
                v-if="subject.subjectChildType === 502"
                :subject="subject"
                @hiddenItem="hiddenItem"
              ></date-time>

              <!-- 日期 -->
              <date
                v-if="subject.subjectChildType === 501"
                :subject="subject"
                @hiddenItem="hiddenItem"
              ></date>

              <!-- 时间 -->
              <time-block
                v-if="subject.subjectChildType === 500"
                :subject="subject"
                @hiddenItem="hiddenItem"
              ></time-block>
            </template>
          </template>
        </div>
      </template>

      <!-- 提交 -->
      <template v-if="+questionDetailData.questionState === 40">
        <div class="submit">
          <el-button class="btn" :disabled="loading" :loading="loading" @click="submit"
            >提交</el-button
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import MultiInput from './components/multi-input.vue'
import SingleChoice from './components/single-choice.vue'
import SubjectTitle from './components/subject-title.vue'
import MultiChoice from './components/multi-choice.vue'
import ScoringQuestion from './components/scoring-question.vue'
import DateRange from './components/date-range.vue'
import DateTime from './components/date-time.vue'
import Date from './components/date.vue'
import TimeBlock from './components/time-block.vue'
import QuestionHeader from '../../components/question-header/index.vue'
import * as API from '@/services/api/survey'
import dayjs from 'dayjs'

export default {
  name: 'home',
  components: {
    QuestionHeader, // 问卷标题
    SubjectTitle, // 题目标题
    MultiInput, // 简答题
    SingleChoice, // 单选题
    MultiChoice, // 多选
    ScoringQuestion, // 评分题
    DateRange, // 日期范围
    DateTime, // 日期时间
    Date, // 日期
    TimeBlock // 时间
  },
  data() {
    return {
      questionDetailData: {},
      sourceKey: '',
      pageKey: '',
      loading: false,
      isNotify: true
    }
  },
  created() {
    this.getQuestionDetailData()
  },
  methods: {
    // 跳题操作
    hiddenItem({ currentIndex, jumpSubjectId, val, comType }) {
      console.log({ currentIndex, jumpSubjectId, val, comType })

      // 是否走跳题逻辑
      if (!this.questionDetailData['isJump']) return

      // 获取当前项跳题集合的最大index
      const list = this.questionDetailData.subjectList || []
      // 如果单选中的项的jumpSubjectId 小于上次单选中项的jumpSubjectId
      // if (comType === 'single-choice') {
      //   const jumpSubjectIdArr = list?.filter(item => {
      //     return jumpSubjectId === item.id
      //   })
      //   let repeatArr = jumpSubjectIdArr?.map(item => item.currentIndex)
      //   let jumpSubjectIdIndex = Math.max(...repeatArr)

      //   // 找到子项区间的index
      //   const intervalArr = list?.[currentIndex].optionList.map(item => item.jumpSubjectId)
      //   let intervalArrFilter = []
      //   intervalArr.forEach(item => {
      //     if (item) {
      //       const index = list?.findIndex(i => i.id === item)
      //       intervalArrFilter.push(index)
      //     }
      //   })
      //   const maxIndex = Math.max(...intervalArrFilter)
      //   console.log(maxIndex, 'maxIndex', currentIndex)
      //   // 先将区间内重置为true
      //   for (let i = 0; i < list.length; i++) {
      //     const items = list[i]
      //     if (i <= maxIndex && i >= currentIndex) {
      //       items.isViewTopic = true
      //     }
      //   }
      //   // 当前下标与跳题下标之间显示隐藏
      //   for (let i = 0; i < list.length; i++) {
      //     if (i < jumpSubjectIdIndex && currentIndex < i) {
      //       console.log(jumpSubjectIdIndex, currentIndex)
      //       const item = list[i]
      //       item.isViewTopic = !Boolean(val)
      //       // 清空数据
      //       if (currentIndex !== i) {
      //         item['answerIndex'] = -1
      //         item['answerContent'] = ''
      //         item['timeValue'] = ''
      //         item['radioValue'] = ''
      //         item['checkboxValues'] = []
      //         for (let y = 0; y < item['optionList'].length; y++) {
      //           const itemOptionList = item['optionList'][y]
      //           itemOptionList['supplement'] = ''
      //         }
      //       }
      //     }
      //   }
      // } else {
      // 获取跳题的最大index
      const jumpSubjectIdArr = list?.filter(item => {
        return jumpSubjectId === item.id
      })
      let repeatArr = jumpSubjectIdArr.map(item => item.currentIndex)
      let jumpSubjectIdIndex = Math.max(...repeatArr)

      console.log(jumpSubjectIdIndex, 'jumpSubjectIdIndex', currentIndex, 'currentIndex')
      // 无跳题
      if (jumpSubjectIdIndex < 0) return
      let maxHiddenIndex = 0
      // 跳题的index项是否为隐藏 如果是隐藏则取最进显示项的index， 这个区间内的项重新显示
      console.log(list[jumpSubjectIdIndex].isViewTopic, 'list[jumpSubjectIdIndex].isViewTopic')
      if (!list[jumpSubjectIdIndex].isViewTopic) {
        for (let i = jumpSubjectIdIndex; i < list.length; i++) {
          const items = list[i]
          if (list[i].isViewTopic) {
            maxHiddenIndex = items.currentIndex + 1
            break
          }
        }
        for (let i = 0; i < list.length; i++) {
          if (i < maxHiddenIndex && jumpSubjectIdIndex <= i) {
            const items = list[i]
            items.isViewTopic = true
          }
        }
      }
      // 最大下标与当前下标之间显示隐藏
      for (let i = 0; i < list.length; i++) {
        if (i < jumpSubjectIdIndex && currentIndex < i) {
          const item = list[i]
          item.isViewTopic = !Boolean(val)
          // 清空数据
          if (currentIndex !== i) {
            item['answerIndex'] = -1
            item['answerContent'] = ''
            item['timeValue'] = ''
            item['radioValue'] = ''
            item['checkboxValues'] = []
            for (let y = 0; y < item['optionList'].length; y++) {
              const itemOptionList = item['optionList'][y]
              itemOptionList['supplement'] = ''
            }
          }
        }
      }
      // }

      // 重置下标
      let num = 0
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item['isViewTopic']) {
          item.titleindex = +this.padZero(num)
          num++
        }
      }
      console.log(this.list)
    },
    padZero(num, targetLength = 2) {
      let str = num + ''
      while (str.length < targetLength) {
        str = '0' + str
      }
      return str
    },
    /** 关闭通知 */
    closeNotify() {
      this.isNotify = false
    },

    /** 获取问卷数据 */
    async getQuestionDetailData() {
      const { p, sourceKey, pageKey } = this.$route.query

      if (!p || !sourceKey || !pageKey) {
        this.$message.error('必要参数不合法！')
        return
      }

      this.sourceKey = sourceKey
      this.pageKey = pageKey

      try {
        const params = {
          uuid: p,
          sourceKey: sourceKey ? sourceKey : 30,
          pageKey: pageKey ? pageKey : 300
        }
        let { data } = await API.getQuestionDetail(params)

        /** 问卷停止回收 */
        if (Object.keys(data).length <= 0) {
          this.$router.push({
            path: '/admin/survey-status',
            query: {
              status: 3
            }
          })
          return
        }

        // /** 未开始 */
        if (data.startTime > dayjs().toDate().getTime()) {
          this.$router.push({
            path: '/admin/survey-status',
            query: {
              status: 2,
              startTime: data.startTime
            }
          })
          return
        }

        // /** 已结束 */
        if (data.endTime < dayjs().toDate().getTime()) {
          this.$router.replace({
            path: '/admin/survey-status',
            query: {
              status: 3
            }
          })
          return
        }

        this.questionDetailData = {
          ...data,
          // isJump: true, // 跳题字段,
          subjectList:
            data.subjectList &&
            data.subjectList.map((i, index) => ({
              ...i,
              answerContent: '', // 问题回答内容
              timeValue: '', // 存放选中的日期时间
              isAnswer: false, // 必填项是否未作答
              radioValue: '', // 存放单选题id
              checkboxValues: [], // 存放多选题id
              // jumpSubjectId: "1501815475869609985", // 跳题参数,
              // isJumpProp: true, // 是否需要跳题字段,
              isViewTopic: true, // 跳题显示隐藏 初始化显示
              currentIndex: index, // 初始下标
              titleindex: index,
              optionList:
                i.optionList &&
                i.optionList.map((e, index) => ({
                  ...e,
                  supplement: '', // 选项的补充回答
                  optionAnwser: false // 选项是否必填
                  // jumpSubjectId: index, // 跳题参数,
                }))
            }))
        }

        console.log('data===>', this.questionDetailData)
      } catch (err) {
        this.$router.replace({
          path: '/admin/survey-status',
          query: {
            status: 3
          }
        })
        throw new Error(err)
      }
    },

    /** 滚动到未填写的位置 */
    scrollPosition() {
      this.$nextTick(() => {
        const isScroll = document.querySelectorAll('.is-scroll')
        if (isScroll && isScroll.length > 0) {
          isScroll[0].scrollIntoView({
            block: 'center',
            behavior: 'auto'
          })
        }
      })
    },

    /** 提交 */
    async submit() {
      this.questionDetailData.subjectList = this.questionDetailData.subjectList.filter(
        item => item['isViewTopic']
      )
      // 必答题是否有作答提示
      this.questionDetailData.subjectList.forEach(item => {
        if (item.mustAnswer === '10') {
          // 单选 or 多选
          if (+item.subjectType === 1 || +item.subjectType === 2) {
            if (item.answerContent === '') {
              item.isAnswer = true
              this.scrollPosition()
            } else {
              // 选项是否含有必填且未作答的题
              item.isAnswer = false
              item.optionList.find(option => {
                if (item.radioValue === option.id || item.checkboxValues.includes(option.content)) {
                  if (option.supplement === '' && option.supplementFlag === 1) {
                    this.$message({
                      message: '必填项未填写',
                      type: 'warning'
                    })
                    option.optionAnwser = true
                    this.scrollPosition()
                  } else {
                    option.optionAnwser = false
                  }
                }
              })
            }
          } else {
            if (item.answerContent === '') {
              item.isAnswer = true
              this.scrollPosition()
            } else {
              item.isAnswer = false
            }
          }
        }
      })

      const params = {
        sourceKey: '30',
        pageKey: '300',
        questionId: this.questionDetailData.id,
        questionResultDetailList: this.questionDetailData.subjectList.map(subject => {
          let questionResultDetailOptionList = subject.optionList.map(option => ({
            questionSubjectOptionId: option.id,
            supplement: option.supplement,
            supplementFlag: option.supplementFlag
          }))

          // 单选
          if (subject.subjectType === 1) {
            questionResultDetailOptionList = subject.optionList
              .filter(item => item.id === subject.radioValue)
              .map(itemMap => ({
                questionSubjectOptionId: itemMap.id,
                supplement: itemMap.supplement.trim(),
                supplementFlag: itemMap.supplementFlag
              }))
          }
          // 多选
          if (subject.subjectType === 2) {
            questionResultDetailOptionList = subject.optionList
              .filter(item => subject.checkboxValues.includes(item.content))
              .map(itemMap => ({
                questionSubjectOptionId: itemMap.id,
                supplement: itemMap.supplement.trim(),
                supplementFlag: itemMap.supplementFlag
              }))
          }
          // 评分
          if (subject.subjectType === 3) {
            questionResultDetailOptionList = subject.optionList
              .filter(item => item.content === subject.answerContent)
              .map(itemMap => ({
                questionSubjectOptionId: itemMap.id,
                supplement: itemMap.supplement.trim(),
                supplementFlag: itemMap.supplementFlag
              }))
          }

          return {
            questionSubjectId: subject.id,
            subjectType: subject.subjectType,
            subjectChildType: subject.subjectChildType,
            answerContent: subject.answerContent.trim(),
            questionResultDetailOptionList,
            mustAnswer: subject.mustAnswer
          }
        })
      }
      console.log('params===>', params)

      /** 校验必填项是否已全部填写 */
      let valid = []
      this.questionDetailData.subjectList &&
        this.questionDetailData.subjectList.forEach(subject => {
          if (subject.isAnswer) valid.push(subject.isAnswer)
          if (subject.subjectType === 1 || subject.subjectType === 2) {
            return (
              subject.optionList &&
              subject.optionList.map(i => {
                valid.push(i.optionAnwser)
              })
            )
          }
        })
      if (valid.includes(true)) return

      try {
        this.loading = true
        await API.save(params)
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.$router.replace({
          path: '/admin/survey-status',
          query: {
            status: 1,
            integeNum: this.questionDetailData.integeNum,
            id: this.questionDetailData.id
          }
        })
        this.loading = false
      } catch (err) {
        this.$message.error(err.message)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 1000px;
  margin: 0 auto;
  background: #f7f7f7;
  box-shadow: 0px 2px 20px 0px rgba(143, 140, 163, 0.1);

  .notify {
    position: fixed;
    display: flex;
    align-items: center;
    z-index: 100;
    width: 1000px;
    height: 40px;
    line-height: 40px;
    background: #fff2eb;
    padding: 0 20px;
    box-sizing: border-box;
    .notify__text {
      position: relative;
      flex: 1;
      padding-left: 25px;
      font-size: 14px;
      font-weight: 400;
      color: #f96457;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        background: url(../../image/notify.png) no-repeat;
        background-size: cover;
      }
    }
    .notify__close {
      width: 20px;
      height: 20px;
      background: url(../../image/icon_notify_close.png) no-repeat;
      background-size: cover;
      cursor: pointer;
    }
  }

  .submit {
    display: flex;
    align-items: center;
    padding: 20px 0;
    background-color: #fff;

    .btn {
      width: 351px;
      height: 54px;
      margin: 0 auto;
      background: linear-gradient(315deg, #a482ff 0%, #b69bff 100%);
      border-radius: 12px;
      font-size: 20px;
      font-weight: 500;
      color: #ffffff;
      cursor: pointer;
    }
  }
}
</style>
