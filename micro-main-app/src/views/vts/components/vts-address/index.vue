<template>
  <div class="vts-address">
    <el-cascader :props="props"
                 :clearable="true"
                 v-model="value"
                 @change="handleChange"
                 :style="cascaderStyles"
                 ref="cascader"></el-cascader>
  </div>
</template>

<script>
  // api
  import { getMultiLevelSubList } from '@/services/api/vts'
  export default {
    props: {
      clear: {
        type: Boolean,
        default: true
      },
      type: {
        type: String,
        default: ''
      },
      cascaderStyles: {
        type: Object,
        default: () => {}
      }
    },
    data () {
      const that = this
      return {
        props: {
          lazy: true,
          async lazyLoad (node, resolve) {
            const { value, level } = node
            const resultNodes = await that.getAddressChildNodes(value, level)
            if (!resultNodes) {
              resolve([])
              return
            }
            let nodes = resultNodes.filter(n => n.label)
            console.log(nodes, resultNodes, '111')
            resolve(resultNodes)
          }
        },
        value: []
      };
    },
    methods: {
      async getAddressChildNodes (addressId, level) {
        const res = await getMultiLevelSubList(addressId)
        if (res.data && res.data.districtList) {
          const nodes = res.data.districtList.map(item => ({
            value: item.districtID,
            label: item.districtName,
            leaf: level >= 2,
            code: item.adminCode
          }))
          return nodes
        }
      },
      handleChange (val) {
        console.log(val, 'val--');
        if (val.length < 1) {
          this.value = []
          this.$emit('input', false, this.type)
          return
        }
        let item = this.$refs.cascader.getCheckedNodes(false)[0]
        let Area = item.data ? item.data : ''
        let City = item.parent ? item.parent.data : ''
        let Province = item.parent.parent ? item.parent.parent.data : ''
        // let obj = { Province, City, Area }
        let arr = [`province|${Province.label}`, `city|${City.label}`, `zone|${Area.label}`]
        this.$emit('input', arr, this.type)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
