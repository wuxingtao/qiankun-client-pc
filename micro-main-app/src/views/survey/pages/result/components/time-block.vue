<template>
  <div class="time-block">
    <div class="input">{{ subject.valueAnswer }}</div>
  </div>
</template>

<script>
export default {
  name: "time-block",
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.time-block {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  cursor: no-drop;
  .input {
    position: relative;
    height: 40px;
    line-height: 40px;
    background-color: #f7f7f7;
    padding-left: 15px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    &::after {
      position: absolute;
      content: "";
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      background: url(../../../image/date.png) no-repeat;
      background-size: cover;
    }
  }
}
</style>
