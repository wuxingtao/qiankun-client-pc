<template>
  <div class="migration-entry" v-drag v-if="totalCount > 0" @mousedown="handleMouseDown" @mouseup="handleMouseUp">
    <el-popover
      placement="top-end"
      width="168"
      trigger="manual"
      v-model="visible">
      <div class="migration-entry-popover">
        <div class="font-14">
          <ky-icon type="iconentry-warn" />
        </div>
        <div class="migration-entry-popover-text">点击完善运单，信息完善后入口自动关闭</div>
        <div @click="onCloce">
          <ky-icon type="icon-close" />
        </div>
      </div>
      <div
        slot="reference"
        class="migration-entry-image"
        @click="onMigrationClick">
        <div class="migration-entry-count">{{ revealCount }}</div>
      </div>
    </el-popover>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import API from '@api/waybill'
import { KyIcon } from '@comps'
export default {
  components: { KyIcon },
  data() {
    return {
      visible: false,
      totalCount: 0,
      mouseDownE: null,
    }
  },
  computed: {
    revealCount() {
      return this.totalCount > 99 ? '99+' : this.totalCount
    },
  },
  mounted() {
    const visible = sessionStorage.getItem('entryVisible')
    this.visible = visible && +visible === 0 ? false : true
  },
  methods: {
    onCloce() {
      sessionStorage.setItem('entryVisible', 0)
      this.visible = false
    },
    onMigrationClick(e) {
      if (this.totalCount <= 0) {
        return this.$message.warning('暂无待通知取货的异常运单')
      }
      const { clientX, clientY } = this.mouseDownE
      if (clientX !== e.clientX && clientY !== e.clientY) {
        return
      }
      this.$router.push('/admin/waybill-v3-migration')
    },
    /** 迁移失败数据运单分页查询 */
    async getUpgradeFaildWaybillInfo() {
      const user = JSON.parse(sessionStorage.getItem('USER_DATA'))
      const endTime = dayjs().format('YYYY/MM/DD 23:59:59')
      const startTime = dayjs().add(-6, 'M').format('YYYY/MM/DD 23:59:59')

      const params = {
        phone: user.phone,
        dateType: 0,
        startTime: startTime,
        endTime: endTime,
        pageSize: 10,
        pageIndex: 1,
        customerCode: user.customCode,
        waybillStatus: 1,
        printStatus: 0,
        cargoStorageStatus: 10,
        waybillCustomerSource: 10,
      }
      const { data } = await API.getUpgradeFaildWaybillInfo(params)
      if (!data || data.dataCount <= 0) {
        this.totalCount = 0
        return
      }
      this.totalCount = data.dataCount
    },
    handleMouseDown(e) {
      this.mouseDownE = e
    },
    handleMouseUp(e) {
      const { clientX, clientY } = this.mouseDownE
      if (clientX === e.clientX && clientY === e.clientY) {
        return
      }
      this.onCloce()
    }
  },
  directives: {
    drag: {
      bind(el) {
        el.onmousedown = e => {
          //算出鼠标相对元素的位置
          let disX = e.clientX - el.offsetLeft
          let disY = e.clientY - el.offsetTop

          document.onmousemove = e => {
            //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = e.clientX - disX
            let top = e.clientY - disY

            //绑定元素位置到positionX和positionY上面
            el.positionX = top
            el.positionY = left

            //移动当前元素
            el.style.left = left + 'px'
            el.style.top = top + 'px'
          }
          document.onmouseup = e => {
            el.style.left = 'unset'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      },
    },
  },
}
</script>
<style lang="scss" scoped>
@import './style.scss';
</style>
