<template>
  <div class="single-choice">
    <div class="choice">
      <div
        class="list__content"
        v-for="(item, index) in subject.optionList"
        :key="index"
      >
        <div class="list">
          <div
            :class="subject.answerContent === item.content ? 'item2' : 'item1'"
            @click="select(item, index)"
          >
            {{ item.content }}
          </div>
        </div>
        <div
          :class="[
            'input',
            item.optionAnwser && item.supplement === '' ? 'is-scroll' : '',
          ]"
          v-if="
            subject.answerContent === item.content && item.isSupplement === 1
          "
        >
          <el-input
            v-model="item.supplement"
            :placeholder="
              item.supplementNotice ? item.supplementNotice : '请输入'
            "
            :maxlength="item.lengthLimit"
            clearable
            @keydown.native="keydown($event, item.supplement)"
          ></el-input>
          <div
            v-if="item.supplementFlag === 1"
            :class="['isrequired', subject.isAnswer ? 'is-scroll' : '']"
          >
            *
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jumpSubjectMixin from "./jumpSubjectMixin.js"
export default {
  name: "single-choice",
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {
      avtiveIndex: false,
      input: "",
    }
  },
  methods: {
    select(item, index) {
      if (this.subject.radioValue !== item.id) {
        item.supplement = ""
      }
      this.subject.radioValue = item.id
      this.subject.answerContent = item.content

      // 跳题
      this.jumpSubjectFn(item.content , this.subject.jumpSubjectId || item.jumpSubjectId, 'single-choice')
    },
    keydown(e, val) {
      if (!val) {
        if (+e.keyCode === 32) {
          e.returnValue = false
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.single-choice {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  .choice {
    display: flex;
    flex-direction: column;
    .list__content {
      margin-top: 16px;
      cursor: pointer;
      &:first-child {
        margin-top: 0;
      }
      .list {
        position: relative;
        padding-left: 30px;

        .item1 {
          font-size: 16px;
          font-weight: 400;
          color: #333333;
          line-height: 22px;
          text-align: justify;
          word-break: break-all;
          &::before {
            content: "";
            position: absolute;
            top: 3px;
            left: 0;
            width: 14px;
            height: 14px;
            border: 1px solid #979797;
            border-radius: 50%;
          }
        }
        .item2 {
          font-size: 16px;
          font-weight: 400;
          color: #9673f6;
          line-height: 22px;
          text-align: justify;
          word-break: break-all;
          &::before {
            content: "";
            position: absolute;
            top: 3px;
            left: 0;
            width: 15px;
            height: 15px;
            background: url(../../../image/choice-icon.png) no-repeat;
            background-size: cover;
          }
        }
      }
      .input {
        display: flex;
        align-items: center;
        margin-top: 16px;
        .isrequired {
          font-size: 18px;
          margin-left: 10px;
          flex-shrink: 0;
          color: #f99257;
        }
        ::v-deep .el-input--suffix .el-input__inner {
          padding-left: 15px;
          border-radius: 12px;
        }
        ::v-deep .el-input__inner {
          border-color: #9673f6;
        }
      }
    }
  }
}
</style>
