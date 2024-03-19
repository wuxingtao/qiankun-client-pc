<template>
  <div class="scoring-question">
    <div class="content">
      <div
        v-for="(item, index) in subject.optionList"
        :key="index"
        :class="num >= index ? 'star-light' : 'star-grey'"
      ></div>
      <div class="text">{{ subject.valueAnswer }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "scoring-question",
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {}
  },
  computed: {
    num() {
      return (
        this.subject.optionList.findIndex(
          (option) => option.content === this.subject.valueAnswer
        )
      )
    },
  },
  methods: {
  },
}
</script>

<style lang="scss" scoped>
.scoring-question {
  padding: 0 30px 34px 30px;
  margin-bottom: 20px;
  background-color: #fff;
  cursor: no-drop;
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
