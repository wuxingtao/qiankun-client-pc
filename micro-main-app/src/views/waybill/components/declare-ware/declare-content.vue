<template>
  <div class="declare-ware-content__wrapper">
    <div class="declare-ware-total">共{{addressLists && addressLists.length}}票</div>
    <div class="declare-ware-content__lists">
      <declare-content-item
        v-for="(item, index) in addressLists"
        :key="index"
        :item="item"
        :radio.sync="item.checkedCustomsCharge"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
import DeclareContentItem from '@views/waybill/components/declare-ware/declare-content-item.vue'

export default defineComponent({
  name: 'declare-content',
  props: {
    addressLists: {
      type: Array,
      default: () => []
    }
  },
  components: {
    DeclareContentItem
  },
  setup() {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
.declare-ware-total{
  color: #03050d;
  font-size: 14px;
  font-family: PingFangSC, PingFangSC-Regular;
  letter-spacing: 4px;
  margin-bottom: 10px;

}
</style>
