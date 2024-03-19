<template>
  <div class="material-panel-router">
    <div v-for="(item, i) in routeNodeVos" :key="i" :class="`route-three-item ${i === 0 ? 'first': ''}`">
      <section :class="`material-panel-router-three-item-label ${styles[item.nodeStatus]}`">
        <span v-if="item.nodeName">{{ item.nodeName }}</span>
        <span v-else>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </section>
      <section class="route-three-item-detail">
        <div :class="`detail-item`">
          <div class="detail-item-icon">
            <div class="detail-item-icon-unit">
              <ky-icon type="iconexpress-route-icon" />
              <!-- <ky-icon :type="statusIcon[item.icon]" /> -->
            </div>
          </div>
          <div class="detail-item-content">
            <div class="detail-item-date">
              {{ item.date }}
            </div>
            <div class="detail-item-desc">
              {{ item.desc }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import { KyIcon } from '@comps'

export default {
  props: {
    routeNodeVos: {
      type: Array,
      default: () =>  []
    }
  },
  components: { KyIcon },
  data() {
    return {
      styles: {
        0: 'warn',
        1: ''
      },
      routeNodeVos1: [
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          date: '2021-10-31 9:30:10',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-process',
          date: '2021-10-31 9:30:10',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          date: '2021-10-31 9:30:10',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          date: '2021-10-31 9:30:10',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
      ],
    }
  },
}
</script>
<style lang="scss">
@import '../style.scss';
</style>
