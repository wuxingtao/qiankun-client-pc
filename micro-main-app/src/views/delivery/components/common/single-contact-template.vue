<template>
  <div class="single-contact-template__container">
    <div class='name-phone-wrap'>
      <span v-html='item.contactRaw'></span>
      <span v-html='item.contactPhoneRaw'></span>
    </div>
    <div v-if="companyText" class='company line-ellipsis' :title='item.company' v-html='companyText'></div>
    <div class='address line-ellipsis' :title='item.address'>{{ item.address }}</div>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
export default {
  props: {
    item: {
      typeof: Object,
      default: () => { return {} }
    }
  },
  setup(props) {
    const companyText = computed(()=>props.item.companyRaw || props.item.company)
    return{
      companyText
    }
  }
}
</script>

<style lang="scss" scoped>
  .single-contact-template__container {
    color: #03050d;
    .name-phone-wrap {
      font-size: 14px;
      line-height: 14px;
      margin: 12px 0 6px;
      overflow: hidden;
      text-overflow: ellipsis;

      & > :first-child {
        font-weight: bold;
        padding-right: 8px;
      }
    }
    .line-ellipsis{
      white-space: normal;
      word-break: break-all;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }

    .company{
      font-weight: bold;
      line-height: 1;
      margin-bottom: 4px;
    }

    .address {
      font-size: 12px;
      line-height: 18px;
      color: #999999;
      margin-bottom: 8px;

    }
  }
</style>