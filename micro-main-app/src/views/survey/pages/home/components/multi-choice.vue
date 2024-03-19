<template>
  <div class="multi-choice">
    <div class="list" v-for="(item, index) in subject.optionList" :key="index">
      <el-checkbox
        v-model="checkList"
        class="checkbox"
        @change="changeCheckbox(item)"
        :label="item.content"
      ></el-checkbox>
      <div
        v-if="checkList.includes(item.content) && item.isSupplement === 1"
        :class="['input', checkList.includes(item.content) ? 'input2' : '']"
      >
        <el-input
          :class="['text', item.optionAnwser && item.supplement === '' ? 'is-scroll' : '']"
          v-model="item.supplement"
          :placeholder="item.supplementNotice ? item.supplementNotice : '请输入'"
          :maxlength="item.lengthLimit"
          clearable
          @keydown.native="keydown($event, item.supplement)"
        ></el-input>
        <div v-if="item.supplementFlag === 1" class="isrequired">*</div>
      </div>
    </div>
  </div>
</template>

<script>
import jumpSubjectMixin from './jumpSubjectMixin.js'
export default {
  name: 'multi-choice',
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object
    }
  },
  data() {
    return {
      checkList: []
    }
  },
  watch: {
    checkList(val) {
      if (!val.length) {
        this.subject.answerContent = ''
      }
    }
  },
  methods: {
    changeCheckbox(item) {
      if (this.subject.answerContent === item.content) {
        // 取消勾选
        this.answerContent = ''
        item.supplement = ''
      } else {
        // 勾选
        this.subject.checkboxValues = this.checkList
        this.subject.answerContent = item.content
      }
      // 跳题
      this.jumpSubjectFn(this.checkList.length, this.subject.jumpSubjectId)
    },
    keydown(e, val) {
      if (!val) {
        if (+e.keyCode === 32) {
          e.returnValue = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.multi-choice {
  padding: 0 34px 14px 34px;
  background-color: #fff;
  .checkbox {
    ::v-deep.el-checkbox {
      margin-top: 20px;
    }
    ::v-deep.el-checkbox__label {
      font-size: 16px;
      font-weight: 400;
      color: #333333;
      line-height: 16px;
      text-align: justify;
      word-break: break-all;
    }
    ::v-deep.el-checkbox__input {
      border-radius: 4px;
    }
    ::v-deep.el-checkbox__inner {
      border-color: #979797;
      border-radius: 4px;
    }
    ::v-deep.el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #9673f6;
      border-color: #9673f6;
    }
    ::v-deep.el-checkbox__inner:hover {
      border-color: #979797;
    }
  }
  .list {
    margin-bottom: 16px;
    .input {
      display: flex;
      align-items: center;
      flex: 1;
      margin-top: 16px;
      ::v-deep.el-input__inner {
        padding-left: 15px;
        border-radius: 12px;
      }
      ::v-deep.el-input__inner:hover {
        border-color: rgb(150, 115, 246);
      }
      .isrequired {
        font-size: 18px;
        margin-left: 10px;
        flex-shrink: 0;
        color: #f99257;
      }
    }

    .input2 {
      ::v-deep.el-input__inner {
        padding-left: 15px;
        border-color: rgb(150, 115, 246);
      }
    }
  }
}
</style>
