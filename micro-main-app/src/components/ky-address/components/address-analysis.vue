<template>
  <ky-dialog title="温馨提示" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body @close="close">
    <div class="row-info">
      <span class="c_666">{{ addressText }}：</span><span class="c_03050d">{{ address }}</span>
    </div>
    <div class="address-lists">
      <p class="error-tip mb_16"><i class="iconfont icon-warning mr_8 fs_14--strict w_a_m"></i><span class="f_w_600">未能在地图中检测到您的详细地址，请选择以下地址：</span></p>
      <el-radio-group v-model="addressSelect" class="address-radio-group">
        <el-radio :label="item" v-for="(item,index) in dataLists" :key="index" :show-overflow-tooltip="true" :title="item.value">
          {{ item.value }}
        </el-radio>
      </el-radio-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs,computed } from '@vue/composition-api'

export default defineComponent({
  name: '',
  props: {
    address: {
      type: String,
      default: () => ''
    },
    addressType: {
      type: String,
      default: () => '10'
    }
  },
  setup (props, ctx) {
    const state = reactive({
      dialogVisible: false,
      dataLists: [],
      addressSelect: {}
    })

    const addressText = computed(() => {
      const textLists = {'10': '寄件地址','20': '收件地址'}
      return textLists[props.addressType] || '公司地址'
    })

    function showDialog (dataLists) {
      state.dialogVisible = true
      state.dataLists = dataLists
      state.addressSelect = {}
    }

    function close () {
      state.dialogVisible = false
      state.dataLists = []
      // ctx.emit('update:visible',false)
    }

    function handleConfirm () {
      if (!state.addressSelect?.value) {
        this.$message.warning('请选择需替换的地址')
        return
      }
      close()
      ctx.emit('change', state.addressSelect)
    }

    return { ...toRefs(state), addressText, showDialog, handleConfirm, close }
  }
})
</script>

<style lang="scss" scoped>
.error-tip{
  color:#FE743C;
  display: flex;
  align-items: center;
  padding-left: 1px;
}
.row-info {
  height: 54px;
  line-height: 54px;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #424242;
  font-weight: bold;
  padding-left: 16px;
  margin-bottom: 16px;
  background: #fdfcff url('~@/assets/image/waybill/notice-pickup-title.png') no-repeat top right/cover;
  background-size: auto 100%;
}

/deep/ .address-radio-group {
  width: 100%;
  display: block;
  padding: 0 10px;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  box-sizing: border-box;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;

  .el-radio {
    display:flex;
    align-items: center;
    width: 100%;
    padding: 16px 10px;
    color: $--color-text-primary;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: border-box;
    &::before{
      content:'';
      position: absolute;
      right: 5px;
      bottom:0;
      height: 1px;
      width: calc(100% - 40px);
      background-color:#f1f1f5;
    }

    &:last-child {
      &::before{
        content:'';
        height:0;
      }
    }
  }
  .el-radio__label{
    -webkit-line-clamp: 2;
    display: -webkit-box;
    white-space: initial;
    -webkit-box-orient: vertical;
    padding-left: 12px;
    line-height: 1.4;
    max-height:40px;
    overflow: hidden;
  }
}


</style>
