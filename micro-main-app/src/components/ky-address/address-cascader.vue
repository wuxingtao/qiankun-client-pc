<template>
  <el-popover placement="bottom-start" :width="width" :popper-options="{boundariesElement:'viewport',removeOnDestroy:true}" trigger="manual" v-model="visible" popper-class="popover-tabs-cascader" @hide="popoverVisible=false" @show="popoverVisible=true">
    <div class="content address-cascader-content" v-loading="loading" @mouseenter="cursorHoverPopover=true" @mouseleave="cursorHoverPopover=false" @click="clickPopover">
      <el-tabs v-show="!showSuggestionResult" v-model="currentTabIndex" @tab-click="clickTab" :class="[hasMinHeight && 'tab-min-h']">
        <el-tab-pane label="热门城市" key="tab-hot" name="tab-hot">
          <ul class="item-wrap">
            <li v-for="(item,index) in hotCityList" :key="index" @click="handleHotCity(item)">{{item.value}}</li>
          </ul>
        </el-tab-pane>
        <el-tab-pane v-for="(tab,index) in tabs" :key="index" :label="tab.selectedOption&&tab.selectedOption.label ||'请选择' " :name="index+''">
          <ul class="item-wrap">
            <li v-for="item in tab.options" :key="item.label" @click="clickItem(item,index)">
              <el-tooltip :content="item.label" :disabled="item.label && item.label.length < 7">
                <span>{{item.label}}</span>
              </el-tooltip>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
      <div v-show="showSuggestionResult" class="search-result">
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <ul>
            <li v-if="!suggestions||suggestions.length<1" class="empty-text">无匹配数据</li>
            <template v-else>
              <li v-for="(item,index) in suggestions" :key="index" @click="suggestionItemClick(item)">
                {{`${item.displayText}`}}
              </li>
            </template>
          </ul>
        </el-scrollbar>
      </div>
    </div>
    <div slot="reference" class="input-container" @mouseenter="handleMouseEvent(true)" @mouseleave="handleMouseEvent(false)" @click.stop="clickInputContainer">
      <el-input v-model="displayText" ref="input" clearable :placeholder="placeholder" :disabled="disabled" :readonly="readonly" @clear="clearInput" @focus="focusInInput=true" @blur="lostFocus" @input="debounceHandleInput" size="medium"></el-input>
      <i slot="suffix" v-if="readonly&&cursorHoverInput&&displayText" class="el-select__caret el-input__icon el-icon-circle-close" @click.stop="clearInput"></i>
      <i slot="suffix" v-else-if="(!cursorHoverInput&&!focusInInput) || !displayText" class="el-select__caret el-input__icon el-icon-arrow-up" :class="{ 'is-reverse': popoverVisible }" @mouseenter="handleMouseEvent(true)" @mouseleave="handleMouseEvent(false)" @click.stop="clickInputContainer('icon')"></i>
    </div>

  </el-popover>
</template>

<script>
import { ref } from '@vue/composition-api'
import debounce from 'lodash/debounce'
import useCascaderOption from './hooks/useCascaderOption'
import hotCityList from '@comps/ky-address/hooks/useHotCity'

export default {
  name: 'TabsCascader',
  props: {
    placeholder: { type: String, default: '请选择省市区' },
    width: { type: [Number, String], default: 450 },
    separator: { type: String, default: ' / ' },
    options: { type: Array }, //[{value,label,children:options,leaf,level}] level从1开始
    valueList: { type: Array }, //选中项的值
    labelList: { type: Array }, //选中项的文本
    filterable: { type: Boolean, default: true },
    // filterMethod:{type:Function},
    fetchSuggestions: { type: Function },
    disabled:{
      type:Boolean,
      default:false
    },
    props: {
      type: Object,
      default: function () {
        return { lazy: false, lazyLoad: null, type: null }
      },
    },
    // 是否开启最低高度
    hasMinHeight:{
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      cacheOptions: [],
      visible: false,
      loading: false,
      popoverVisible: false,
      cursorHoverInput: false,
      cursorHoverPopover: false,
      focusInInput: false,
      currentTabIndex: '0',

      displayText: '',
      suggestions: [], //搜索结果
      showSuggestionResult: false, //是否显示搜索结果
      hotCityList
    }
  },
  setup (props) {
    const tabs = ref([])
    //{selectedOption,options}  selectedOption:为当前面板选择的option,options:为上一级option.children
    const selectedOptions = ref([])

    const { lazyLoad, getChildrenFromCacheOptions } = useCascaderOption()
    return {
      tabs,
      selectedOptions,
      lazyLoad,
      getChildrenFromCacheOptions
    }
  },
  mounted () {
    const byOptionValue = !this.labelList || this.labelList.length < 1
    const list = byOptionValue ? this.valueList : this.labelList
    this.initByList(list, byOptionValue)
  },
  methods: {
    handleMouseEvent (isEnter) {
      this.cursorHoverInput = isEnter
    },
    async initByList (list, byOptionValue = true, isManualClick = false) {
      if (this.tabs.length > 1) {
        this.clickTab({ index: 0 })
      }
      if (this.tabs.length < 1) {
        await this.lazyLoadChildrenOfOption({ value: '', level: 1 })
      }
      this.lazyLoadDataByList(list, byOptionValue, isManualClick)
    },
    clickTab (tab) {
      const tabIndex = Number(tab.index) - 1 > 0 ? Number(tab.index) - 1 : 0
      if(tab.name === 'tab-hot'){
        this.currentTabIndex = 'tab-hot'
      }else{
        this.currentTabIndex = tabIndex + ''
        this.tabs = this.tabs.slice(0, tabIndex + 1)
      }
    },
    handleHotCity(item){
      this.$emit('handleHotCity',item.district)
    },
    clickItem (option, tabIndex) {
      option.level = tabIndex + 1
      this.lazyLoadChildrenOfOption(option, true)
    },
    //加载option的children
    loadChildrenOfOption (option, isManualClick, isLastNode) {
      const theLastTab = this.tabs[this.tabs.length - 1]
      const tabOption = theLastTab.options.find(o => o.value == option.value)
      Object.assign(option, tabOption)
      theLastTab.selectedOption = option
      let isLeafNode = option.leaf || isLastNode
      if (isLeafNode || !option.children || option.children.length < 1) {
        this.selectedOptions = this.tabs.map(t => t.selectedOption).filter(f => !f.isEmptyNode).sort((a,b)=>a.level-b.level)
        this.visible = false
        isManualClick && this.$emit('valueChange', this.selectedOptions)
        return
      }
      this.tabs.push({ options: option.children })
      this.currentTabIndex = this.tabs.length - 1 + ''
      // 省市区异常处理
      this.displayTextPoly()
    },
    //通过valueList加载数据
    loadDataByValueList (valueList) {
      let currentOptions = this.options
      if (!valueList || valueList.length < 1) {
        this.tabs = [{ options: currentOptions }]
        return
      }
      valueList.forEach(v => {
        const option = currentOptions.find(o => o.value === v)
        if (option) {
          this.tabs.push({ selectedOption: option, options: currentOptions })
          currentOptions = option.children
        }
      })
      if (!currentOptions || currentOptions.length < 1) {
        this.selectedOptions = this.tabs.map(t => t.selectedOption).sort((a,b)=>a.level-b.level)
      }
      this.currentTabIndex = this.tabs.length - 1 + ''
    },
    async lazyLoadDataByList (list, byOptionValue = true, isManualClick = false) {
      if (!list || list.length < 1) {
        this.selectedOptions = []
        return
      }
      for (let index = 0; index < list.length; index++) {
        let option = { label:list[index], value: list[index], level: index + 1 }
        if (!this.tabs[index]) {
          return
        }
        if (!byOptionValue) {
          const tabOption = this.tabs[index].options.find(
            f => f.label == list[index]
          )
          Object.assign(option, tabOption)
        }
        const isLastNode = index === list.length - 1
        await this.lazyLoadChildrenOfOption(option, isManualClick, isLastNode)
      }
    },
    lazyLoadChildrenOfOption (option, isManualClick, isLastNode) {
      return new Promise((resolve, reject) => {
        if (option && option.value) {
          const children = this.getChildrenFromCacheOptions(
            option,
            this.cacheOptions,
            1
          )
          if (children && children.length > 0) {
            option.children = children
            this.loadChildrenOfOption(option, isManualClick, isLastNode)
            resolve()
            return
          }
        }
        if (option && option.leaf) {
          this.loadChildrenOfOption(option, isManualClick, isLastNode)
          resolve()
          return
        }
        this.loading = true
        try {
          this.lazyLoad(option, children => {
            if (!children) {
              this.loading = false
              resolve()
              return
            }
            if (this.tabs.length < 1 || !this.tabs[0]) {
              if (this.cacheOptions.length < 1) {
                this.cacheOptions.push(...children)
              }
              this.tabs = [{ options: children }]
            }
            if (option && option.value) {
              if (!option.leaf) {
                option.children = children
              }
              this.loadChildrenOfOption(option, isManualClick, isLastNode)
            }
            this.loading = false
            resolve()
          })
        } catch (ex) {
          console.log('lazyLoadChildrenOfOption :>> ', ex)
          this.loading = false
          reject()
        }
      })
    },
    clearInput () {
      this.$refs.input.focus()
      this.selectedOptions = []
      this.$nextTick(() => {
        this.$emit('valueChange', this.selectedOptions)
      })
    },
    lostFocus () {
      if (!this.cursorHoverPopover) {
        this.visible = false
        this.showSuggestionResult = false
        this.displayTextPoly()
      }
      this.focusInInput = this.popoverVisible ? null : false
      this.cursorHoverInput = this.popoverVisible ? null : false
    },
    clickInputContainer (target) {
      if(this.disabled){
        return
      }
      if (target === 'icon' && this.focusInInput == null) {
        this.focusInInput = false
        return
      }
      this.visible = !this.visible
      if (this.visible) {
        this.$refs.input.focus()
        if (!this.displayText) {
          this.showSuggestionResult = false
        }
      }
    },
    clickPopover () {
      this.$refs.input.focus()
    },
    debounceHandleInput: debounce(function (queryString) {
      this.handleInput(queryString)
    }, 500),
    handleInput (queryString) {
      if (!this.fetchSuggestions) {
        return
      }
      if (!queryString) {
        this.suggestions = []
        return
      }
      this.loading = true
      this.showSuggestionResult = true
      this.fetchSuggestions(queryString, data => {
        this.suggestions = data
        this.loading = false
      })
    },
    async suggestionItemClick (item) {
      this.initByList(item.labelList, false, true)
      this.visible = false
      setTimeout(() => {
        this.showSuggestionResult = false
      }, 100)
    },
    /**
         * 省市区文案显示兼容 props.type 判断类型
         */
    displayTextPoly () {
      this.displayText = this.selectedOptions.filter(f => f.label)
        .map(o => o.label)
        .join(this.separator)
        //  else if (this.props.type === 'poly') {
        //   const labelList = this.labelList || []
        //   // 存在重复省市区以后台数据为准
        //   if (Array.from(new Set(labelList)).length < labelList.length) {
        //     this.displayText = labelList[0] + labelList[1] + labelList[2]
        //   } else if (labelList.length > 0 && labelList.length <= 2) {
        //     // 处理缺少zone的情况
        //     this.displayText = labelList[0] + labelList[1]
        //   } else {
        //     this.displayText = this.selectedOptions
        //       .map(o => o.label)
        //       .join(this.separator)
        //   }
        // }
    }
  },
  computed: {
    readonly () {
      return !this.filterable
    },
  },
  watch: {
    selectedOptions () {
      this.displayTextPoly()
    },
    labelList: {
      deep: true,
      handler: function (val) {
        this.initByList(val, false)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
  .el-tabs {
    padding: 5px 12px;
    /deep/ .item-wrap {
      display: flex;
      flex-wrap: wrap;
      list-style: none;
      li {
        width: 96px;
        height: 30px;
        line-height: 30px;
        margin: 2px 5px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: #ffffff;
          background: #8365f6;
          border-radius: 4px;
        }
      }
    }
    &.tab-min-h{
      /deep/ .el-tabs__content{
        min-height: 272px;
      }
    }
  }
  .address-cascader-content {
    /deep/ {
      .el-loading-spinner .circular  {
        width: 28px;
        height: 28px;
      }
    }
  }
  .search-result {
    max-height: 300px;

    ul {
      padding-bottom: 15px;
      .empty-text {
        color: #c0c4cc;
        text-align: center;
        cursor: auto;
      }
      li {
        height: 34px;
        line-height: 34px;
        padding: 0 12px;
        cursor: pointer;
        &:hover {
          background: #f5f7fa;
        }
      }
    }
    /deep/ {
      .el-scrollbar {
        height: calc(100% + 20px);
        //隐藏横行包裹滚动条
        .scrollbar-wrapper {
          max-height: 300px;
          overflow-x: hidden !important;
        }
        //隐藏横行滚动条
        .is-horizontal {
          display: none;
        }
      }
    }
  }
  .input-container {
    position: relative;

    /deep/ {
      input {
        cursor: pointer;
      }
      .el-input__icon{
        right: 10px !important;
      }
      .el-input__suffix {
        right: 10px;
      }
    }

    .el-icon-circle-close {
      cursor: pointer;
    }
    .el-select__caret{
      width: 12px;
    }
    .el-icon-circle-close,
    .el-icon-arrow-up {
      position: absolute;
      right: 5px;
      top: 3px;
      transform: rotateZ(180deg);
      color: #c0c4cc;
    }
    .is-reverse {
      transform: rotateZ(0deg);
      top: -4px;
    }
  }
  /deep/ {
    .el-tabs__nav{
      .el-tabs__item{
        font-weight: 600;
        &#tab-tab-hot{
          font-weight: normal;
          &.is-active{
            font-weight: 600;
          }
        }
      }
    }

    .el-tabs__nav-wrap::after {
      height: 1px;
    }

    .el-tabs__content {
      li {
        color: $--color-text-primary;
      }
    }
  }

  .popover-tabs-cascader {
    li span.el-tooltip {
      padding: 0 5px;
    }
  }

</style>
<style lang="scss">
  .popover-tabs-cascader {
    padding: 5px 0;
    border: 0;
    .el-tabs__active-bar {
      height: 4px;
      background: #8365f6;
      border-radius: 2px;
    }
  }
</style>
