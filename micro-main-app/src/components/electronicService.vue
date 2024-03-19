<template>
  <ky-dialog title="电子运单契约条款" class="terms-service dialog-2021" custom-class="admin-dialog" :visible.sync="visibleFlag"
             width="736px" append-to-body :modal="showModel">
    <div class="page__content">
      <div v-html="content"></div>
    </div>
    <div slot="footer" class="dialog-footer w_full text_right">
      <el-button class="btn-i-know" size="medium" type="primary" @click="close">我已阅读</el-button>
    </div>
  </ky-dialog>

</template>

<script>
import { defineComponent, reactive, toRefs, onMounted, watch } from '@vue/composition-api'
import UserService from '@/services/module/user'

const ELECTRONIC_DOC_ID = 137
export default defineComponent({
  name: 'Electronic-service',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    showModel: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      content: '',
      visibleFlag: false,

    })

    watch(() => props.visible, (val) => {
      state.visibleFlag = val
    })

    watch(() => state.visibleFlag, (val) => {
      emit('update:visible', val)
    })

    onMounted(() => {
      handleContent()
    })

    function handleContent () {
      UserService.getHelpDoc({ id: ELECTRONIC_DOC_ID }).then((res) => {
        state.content = res.data.content
      })
    }

    function close () {
      state.visibleFlag = false
    }

    return { ...toRefs(state), close }
  }
})
</script>

<style lang="scss" scoped>
.page__content {
  line-height: 2;
  color: #333;

  /deep/ {
    b {
      font-weight: bold;

      * {
        font-weight: bold;
      }
    }
  }
}
</style>
