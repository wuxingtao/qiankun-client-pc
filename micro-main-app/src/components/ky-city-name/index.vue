<template>
    <div>
        <el-autocomplete
                ref="elautocomplete"
                value-key="label"
                style="width: 250px;"
                :value="value"
                v-bind="$attrs"
                v-on="$listeners"
                @input="inputChange"
                suffix-icon="el-icon-search"
                :fetch-suggestions="querySearchAsync"
                placeholder="请输入内容"
                @select="handleSelect"
        ></el-autocomplete>
    </div>
</template>
<script>
import PinyinMatch from "pinyin-match"
import {cityName} from "./config"

export default {
  name: "ky-city-name",
  props:{
    value:{
      type:String,
      default:''
    }
  },
  methods:{
    //搜索
    querySearchAsync(queryString, cb) {
     let restaurants = cityName || []
      queryString=queryString.replace(/(^\s*)|(\s*$)/g, "")
      let results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : []
        this.$refs.elautocomplete.activated=true
        cb(results)
    },
    createStateFilter(queryString) {
        return (statue) => {
        return PinyinMatch.match(statue.label, queryString)
      }
    },
    inputChange(value){
      this.$emit('input',value)
    },
    handleSelect(item) {
      this.$emit('input',item.label)
      this.$emit('select',item)

    }
  }
}
</script>

<style scoped>

</style>
