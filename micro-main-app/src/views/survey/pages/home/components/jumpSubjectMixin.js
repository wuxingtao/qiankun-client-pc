export default {
  methods: {
    /**
     * @desc 跳题
     * @params val 选中的/填写的值
     * @params comType 单选 重置为true的区间（jumpIndex-comType）
     * @params jumpSubjectId 跳题id
     */
    jumpSubjectFn(val, jumpSubjectId, comType) {
      console.log(val, jumpSubjectId, comType, "val, jumpSubjectId, comType");
      if (this.subject["currentIndex"] >= 0) {
        this.$emit("hiddenItem", {
          currentIndex: this.subject["currentIndex"],
          jumpSubjectId,
          val,
          comType,
        });
      }
    },
  },
};
