<template>
  <div class="short-answer">
    <div class="input">{{ subject.valueAnswer }}</div>
  </div>
</template>

<script>
export default {
  name: "short-answer",
  props: {
    subject: {
      type: Object
    }
  },
  data() {
    return {
      text: "",
    }
  },
}
</script>

<style lang="scss">
.short-answer {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  cursor: no-drop;
  .input {
    min-height: 80px;
    padding: 10px 15px;
    background-color: #f7f7f7;
    border-radius: 12px;
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 400;
    color: #333;
  }
}
</style>
