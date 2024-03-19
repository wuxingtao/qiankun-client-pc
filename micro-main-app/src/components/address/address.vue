<template>
  <el-popover
    placement="bottom"
    :width="width"
    v-model="visible"
    popper-class="ky-address"
    trigger="click"
    @hide="handleHide"
    @show="handleShow"
  >
    <div class="w-address-content">
      <div class="content-body">
        <el-tabs v-model="activeName" @tab-click="tabClick"  v-loading="loading">
          <el-tab-pane
            v-for="(item, i) in tabPane"
            :key="i"
            :label="item.label"
            :name="item.name"
          >
            <div v-if="activeName == 'hotcity'">
              <div class="w-area">
                <ul class="w-area-list sidebar">
                  <li
                    class="area-list-item"
                    @click="selectHotcity(item.name)"
                    v-for="(item, index) in hotCity"
                    :key="item.name+index"
                  >
                    {{ item.name }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else>
              <div class="w-area">
                <ul class="w-area-list sidebar">
                  <li
                    class="area-list-item"
                    @click="selectDistrict(district, i)"
                    v-for="(district, j) in districtList"
                    :key="district.districtName+j"
                  >
                    {{
                      district.districtName ||
                        (district.districtName == '' ? '市级县' : '')
                    }}
                  </li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div
      class="el-select el-select--medium ky-select-area"
      slot="reference"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    >
      <div class="el-input el-input--medium el-input--suffix">
        <input
          autocomplete="off"
          :placeholder="placeholder"
          v-model="address"
          readonly="readonly"
          type="text"
          class="el-input__inner el-input--medium"
        />
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i
              v-show="showClose"
              class="el-select__caret el-input__icon el-icon-circle-close"
              @click.stop="resetSelect"
            ></i>
            <i
              v-show="!showClose"
              class="el-select__caret el-input__icon el-icon-arrow-up"
              :class="{ 'is-reverse': iconArrowUp }"
            ></i>
          </span>
        </span>
      </div>
    </div>
  </el-popover>
</template>
<script>
import _ from 'lodash'
import { getMultiLevelSubList, autoMatch } from "@/services/api/address"
export default {
  props: {
    /*
                                                    针对数据返现
                                                    初始展示地址： ['广东省', '广州市', '天河区']
                                                    */
    defaultDistrict: {
      type: [String, Array],
      default: ''
    },
    isLocationToDefaultDistrict:{
      type:Boolean,
    },
    width: {
      type: [Number, String],
      default: 450
    },
    /*
                                                    number: 按照数量返回数据 例如：level: '3'  地址簿需求返回三层数据
                                                    string：按照数据库数据关键返回层级(province/city/zone/street/village)  例如：level: '
                                                    '  时效运费查询页面，需求联动到最后一层
                                                    */
    level: {
      type: [Number, String],
      default: 'zone'
    },
    /* 等于/高于这个参数popover hide事件触发change */
    minLevel: {
      type: [Number, String, Boolean],
      default: false
    },
    /* 数据为空的占位符 */
    placeholder: {
      type: [String],
      default: '请选择'
    }
  },
  data() {
    return {
      loading: false,
      visible: false,
      iconArrowUp: false,
      inputHovering: false,
      activeName: 'hotcity',
      address: '',
      activeDistrictID: '',
      activeDistrictLevel: 'province',
      districtList: [],
      tabPane: [
        { label: '常用市', name: 'hotcity', id: '' },
        { label: '省/直辖市', name: 'province', id: '' }
      ],
      hotCityData: false,
      hotCity: [
        { name: '深圳市', proviceId: 'XZ1-31' },
        { name: '上海市', proviceId: 'XZ1-01' },
        { name: '苏州市', proviceId: 'XZ1-14' },
        { name: '广州市', proviceId: 'XZ1-31' },
        { name: '东莞市', proviceId: 'XZ1-31' },
        { name: '嘉兴市', proviceId: 'XZ1-22' },
        { name: '宁波市', proviceId: 'XZ1-22' },
        { name: '佛山市', proviceId: 'XZ1-31' },
        { name: '杭州市', proviceId: 'XZ1-22' },
        { name: '无锡市', proviceId: 'XZ1-14' },
        { name: '绍兴市', proviceId: 'XZ1-22' },
        { name: '中山市', proviceId: 'XZ1-31' },
        { name: '泉州市', proviceId: 'XZ1-27' },
        { name: '金华市', proviceId: 'XZ1-22' },
        { name: '天津市', proviceId: 'XZ1-05' },
        { name: '惠州市', proviceId: 'XZ1-31' },
        { name: '台州市', proviceId: 'XZ1-22' },
        { name: '北京市', proviceId: 'XZ1-06' },
        { name: '常州市', proviceId: 'XZ1-14' },
        { name: '烟台市', proviceId: 'XZ1-03' }
      ]
    }
  },
  watch: {
    // defaultDistrict发生变化 不等于address
    defaultDistrict(val) {
      let _default = ''
      if (typeof val == 'object') {
        _default = val.join(' - ')
      }
      if (this.address != _default) {
        this.resetSelect(false)
        this.address = val.join(' - ').replace(' -  - ', ' - ')
      }
      if(this.isLocationToDefaultDistrict){
        this.locationToDefaultDistrict(val)
      }
    },
    activeName(val) {
      if (val == 'hotcity') {
        this.tabPane = [
          { label: '常用市', name: 'hotcity' },
          { label: '省/直辖市', name: 'province' }
        ]
      } else if (val == 'province') {
        this.hotCityData = false
      }
    }
  },
  computed: {
    showClose() {
      if (this.address && this.inputHovering) {
        return true
      } else {
        return false
      }
    }
  },
  created() {
    if (typeof this.defaultDistrict == 'object') {
      this.address = this.defaultDistrict.join(' - ')
    }
  },
  methods: {
    async  locationToDefaultDistrict(values) {
      if (!values || values.length < 1) {
        return
      }
      await this.tabClick({index:1 })
      let array= '北京,上海,天津,重庆'.split(',').filter(m=>values[0].indexOf(m)>=0)
      let newValues=array.concat(values)
      for(let i=0;i<newValues.length;i++){
        let name=_.trimEnd(newValues[i]+'','省')
        name=_.trimEnd(name,'市')
        let item = this.districtList.find(d=>d.districtName.indexOf(name)>=0)
        if(typeof item == 'undefined'){
          return
        }
        await  this.selectDistrict(item, i+1)
      }
    },
    resetSelect(cb = true) {
      this.address = ''
      this.activeName = 'hotcity'
      this.districtList = []
      this.hotCityData = false
      this.tabPane = [
        { label: '常用市', name: 'hotcity' },
        { label: '省/直辖市', name: 'province' }
      ]
      cb && this.callback()
    },

    /**
     * 1. 区分热门城市选择还是省份选择
     */
    callback() {
      let ids = []
      let names = []
      let areaStr = ''
      let data = []
      if (this.hotCityData) {
        let nameA = this.hotCityData.districtName.split('-')
        let id = ''
        this.hotCity.forEach(el => {
          if (el.name === nameA[1]) {
            id = el.proviceId
          }
        })
        data = [
          {
            districtID: id,
            districtName: nameA[0],
            districtLevel: 'province'
          },
          {
            districtID: this.hotCityData.districtID,
            districtName: nameA[1],
            districtLevel: 'city'
          }
        ]
        ids.push(nameA[1])
        names = nameA
        for (let index = 2; index < this.tabPane.length; index++) {
          if (this.tabPane[index].districtID) {
            ids.push(this.tabPane[index].districtID)
            names.push(this.tabPane[index].label)
            let item = {
              districtID: this.tabPane[index].districtID,
              districtName: this.tabPane[index].label,
              districtLevel: this.tabPane[index].name
            }
            data.push(item)
          }
        }
      } else {
        for (let index = 1; index < this.tabPane.length; index++) {
          if (this.tabPane[index].districtID) {
            ids.push(this.tabPane[index].districtID)
            names.push(this.tabPane[index].label)
            let item = {
              districtID: this.tabPane[index].districtID,
              districtName: this.tabPane[index].label,
              districtLevel: this.tabPane[index].name
            }
            data.push(item)
          }
        }
      }

      areaStr = names.join('')
      this.address = names.join(' - ')
      this.$emit('change', ids, names, areaStr, data)
    },

    // 返回已选的数据
    levelLen() {
      let len = 0
      let arr = this.tabPane.filter((i, v) => i.label != '请选择')
      if (this.hotCityData) {
        len = arr.length
      } else {
        len = arr.length - 1
      }
      return len
    },

    // 最后一个选中项
    validEndPane() {
      let arr = this.tabPane.filter((i, v) => i.label != '请选择')
      let pane = arr[arr.length - 1]
      return pane
    },

    // Popover隐藏时触发, 防止选择到达用户需求和最小需求回调
    handleHide() {
      let _end = this.validEndPane()
      let len = this.levelLen()
      if (this.minLevel) {
        if (len >= this.minLevel && _end.name != this.level) {
          this.callback()
        }
      }
      this.iconArrowUp = false
    },
    handleShow() {
      this.iconArrowUp = true
    },

    // 点击已选地址
    async  tabClick(tab) {
      if (tab.name != 'hotcity') {
        let active = this.tabPane[tab.index]
        let end = Number(tab.index) + 1
        let tabData = this.tabPane.slice(0, end)
        this.tabPane = tabData
        this.activeName = active.name
        await  this.getDistrict(active.levelID, false)
      }
    },

    // 选择地址
    async selectDistrict(district, index) {
      let tabItem = this.tabPane[index]
      let newTab = {
        label: district.districtName,
        name: tabItem.name,
        districtID: district.districtID,
        levelID: tabItem.levelID
      }
      this.$set(this.tabPane, index, newTab)
      let len = this.hotCityData ? this.tabPane.length : this.tabPane.length - 1
      console.log(len,this.level)
      console.log(tabItem.name,this.tabPane)
      if (len == this.level || tabItem.name == this.level) {
        this.callback()
        this.visible = false
      } else {
        this.loading=true
        await  this.getDistrict(district.districtID)
        this.loading=false
      }
    },

    // 选择热门城市
    async selectHotcity(tab) {
      let res = await autoMatch(tab)
      let data = res.data
      this.hotCityData = data
      this.getDistrict(data.districtID)
    },

    // 获取地址数据
    // 1. 加载下一级， 新增下一级
    // 2. 加载当前级别的地址， 不需要增加一级
    async getDistrict(id, push = true) {
      this.loading=true
      let res = await getMultiLevelSubList(id)
      this.loading=false
      let data = res.data
      if (push && data.districtList && data.districtList[0]) {
        let newTab = { label: '请选择', name: data.districtLevel, levelID: id }
        this.tabPane.push(newTab)
        this.activeName = data.districtLevel
      }
      // 屏蔽港澳台
      this.districtList = data.districtList.filter(
        item =>
          item.districtName != '台湾' &&
          item.districtName != '澳门' &&
          item.districtName != '香港'
      )
      /* this.districtList = data.districtList */
    },

    async getMultiLevel() {
      let res = await getMultiLevelSubList(this.activeDistrictID)
      this.districtList = res.data.districtList || []
      this.activeDistrictLevel = res.data.districtLevel
      if (this.districtList.length == 1 && !this.districtList[0].districtName) {
        this.callback()
        this.visible = false
      }
    }
  }
}
</script>
<style lang="scss">
@import './address.scss';
</style>
