<template>
  <div class="page__content">
    <div class="page__content-actions">
      <p>Actions 通信</p>
      <p>current token: {{ currentToken }}</p>
    </div>
    <div class="page__content-shared">
      <p>shared 通信</p>
      <p>current token: {{ sharedToken }}</p>
    </div>
    <div class="page__btn" @click="handleClick">
      <el-button type="primary"> 按钮打开弹窗 </el-button>
    </div>
    <el-dialog title="弹窗测试" :visible.sync="visible" width="600px">
      <div class="content">
        <p>弹窗内容</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="visible=false">知道啦</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import actions from "@/shared/actions";
import shareModule from "@/shared";

export default {
  name: "communication-test",
  data () {
    return {
      currentToken: "", // action 通信token
      sharedToken: "", // shared 通信token
      visible: false
    };
  },
  mounted () {
    // 注册观察者函数
    // onGlobalStateChange 第二个参数为 true，表示立即执行一次观察者函数
    actions.onGlobalStateChange(state => {
      const { token } = state;
      this.currentToken = token;
      if (!token) {
        this.$message.warning("未检测到Action登录信息");
        // return this.$router.push('/')
      }
      // 获取用户信息
      this.getUserInfo(token);
    }, true);

    this.sharedTokenCheck();
  },
  methods: {
    getUserInfo () {},
    sharedTokenCheck () {
      const shared = shareModule.getShared();
      const token = shared.getToken();
      console.log("shared", shared);

      this.sharedToken = token;
      if (!token) {
        this.$message.warning("未检测到Shared登录信息");
        // return this.$router.push('/')
      }
    },
    handleClick () {
      this.visible = true;
    }
  }
};
</script>

<style scoped></style>
