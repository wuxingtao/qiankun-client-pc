<template>
  <div class="choice__style">
    <div class="choice">
      <div
        v-for="(item, index) in subject.optionList"
        :key="index"
        class="list"
      >
        <div
          v-if="+subject.subjectType === 1"
          :class="item.isValue ? 'item2' : 'item1'"
        >
          {{ item.content }}
        </div>
        <div
          v-if="+subject.subjectType === 2"
          :class="item.isValue ? 'check-box1' : 'check-box2'"
        >
          {{ item.content }}
        </div>
        <div class="input" v-if="item.valueSupplement">
          <el-input v-model="item.valueSupplement" disabled></el-input>
          <div v-if="item.supplementFlag === 1" class="isrequired">*</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "choice",
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.choice__style {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  cursor: no-drop;
  .choice {
    display: flex;
    flex-direction: column;
    .list {
      position: relative;
      margin-top: 16px;
      &:first-child {
        margin-top: 0;
      }
      .item1 {
        padding-left: 30px;
        font-size: 16px;
        font-weight: 400;
        color: #333333;
        line-height: 22px;
        text-align: justify;
        word-break: break-all;
        &::before {
          content: "";
          position: absolute;
          top: 2px;
          left: 0;
          width: 14px;
          height: 14px;
          border: 1px solid #979797;
          border-radius: 50%;
        }
      }
      .item2 {
        padding-left: 30px;
        font-size: 16px;
        font-weight: 400;
        color: #9673f6;
        line-height: 22px;
        text-align: justify;
        word-break: break-all;
        &::before {
          content: "";
          position: absolute;
          top: 2px;
          left: 0;
          width: 15px;
          height: 15px;
          background: url(../../../image/choice-icon.png) no-repeat;
          background-size: cover;
        }
      }

      .check-box1 {
        padding-left: 30px;
        font-size: 16px;
        font-weight: 400;
        color: #9673f6;
        line-height: 22px;
        text-align: justify;
        word-break: break-all;
        &::before {
          content: "";
          position: absolute;
          top: 2px;
          left: 0;
          width: 15px;
          height: 15px;
          background: url(../../../image/icon_checkbox_act.png) no-repeat;
          background-size: cover;
        }
      }
      .check-box2 {
        padding-left: 30px;
        font-size: 16px;
        font-weight: 400;
        color: #333;
        line-height: 22px;
        text-align: justify;
        word-break: break-all;
        &::before {
          content: "";
          position: absolute;
          top: 2px;
          left: 0;
          width: 15px;
          height: 15px;
          background: url(../../../image/icon_checkbox.png) no-repeat;
          background-size: cover;
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
        ::v-deep .el-input.is-disabled .el-input__inner {
          background-color: #f7f7f7;
          border: 0;
          border-radius: 12px;
          color: #000;
        }
      }
    }
  }
}
</style>
