<template>
  <div>
  <div v-if='!guide' class='order_search'>
    <el-popover
      width='300'
      placement='bottom'
      trigger='manual'
      popper-class='order_query_popper'
      v-model='visible'
      :visible-arrow='false'
    >
      <template>
        <div class='box'>
          <div v-if='!input && history.length' class='history'>
            <div class='title'>
              <span>查件历史</span>
              <i class='iconfont icon-delete icon' @click='deleteHistory' />
            </div>
            <ul>
              <li
                v-for='(item, index) in history'
                :key='index'
                :style="index % 2 === 1 ? 'marginRight: 0' : ''"
                @click='historyQuery(item)'
              >
                {{ item.searchKey }}
              </li>
            </ul>
          </div>
          <div class='suggest' v-if='input && suggest.length'>
            <ul>
              <li v-for='(item, index) in suggest' :key='index' @click='addHandler(item)'>
                <div class='suggest-wrapper'>
                  <i class='iconfont icon-search'></i>
                  <div class='text'>{{ item.keyword }}</div>
                </div>
                <span class='type'>
                  {{ item.keywordType | valueFilter }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <el-input
        v-model='input'
        slot='reference'
        ref='input'
        size='medium'
        clearable
        placeholder='运单号/手机号/自定义编码'
        maxlength='500'
        id='orderInput'
        @focus='focusHandler'
        @blur='blurHandler'
        @input='inputHandler'
        @paste.native.prevent='pasteHandler'
      >
      </el-input>
    </el-popover>
    <el-button class='ml_12 ky-button' type='primary' @click='queryHandler' size='medium'>
      <i class='iconfont icon-search'></i>搜索
    </el-button>
  </div>
  <!--    <div v-else class='guide_order_search'>-->
  <!--      <el-popover-->
  <!--        v-model='guidePopover'-->
  <!--        width='300'-->
  <!--        placement='bottom-end'-->
  <!--        trigger='manual'-->
  <!--        popper-class='guide_order_query_popper'-->
  <!--        :offset='50'-->
  <!--        :visible-arrow='true'-->
  <!--      >-->
  <!--        <div class='popover-text'>-->
  <!--          <p>1.搜索支持运单号/订单号/手机号/自定义编码</p>-->
  <!--          <p>2.增加查询历史</p>-->
  <!--        </div>-->
  <!--        <div class='guide_pic' slot='reference'></div>-->
  <!--      </el-popover>-->
  <!--    </div>-->
  <div v-else-if='steps === 1' class='guide_order_search'>
    <div class='guide_pic' slot='reference'></div>
    <div class='guide_text'>
      <p>1.搜索支持运单号/手机号/自定义编码</p>
      <p>2.增加查询历史</p>
    </div>
  </div>
  </div>
</template>

<script>
import waybillSuggestCodeEnum from "../../enum/waybillSuggest"
import { queryTypeEnum } from "../../enum/queryEnum"
import { debounce } from "lodash"
import API from "@api/waybill"
import { cloneDeep } from "lodash/lang"

export default {
  name: "OrderQuery",
  props: {
    steps: {
      type: Number,
      default: 0
    },
    guide: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      input: "",
      visible: false,
      history: [],
      suggest: [],
      submitList: []
    }
  },
  filters: {
    valueFilter(code) {
      return waybillSuggestCodeEnum.get(code)
    }
  },
  created() {
    this.getHistory()
  },
  methods: {
    queryHandler() {
      this.$reportUtils.clkSearchOrderButton({ button_name: "搜索" })
      if (!this.input) {
        this.$message.warning("搜索信息不能为空！")
        return
      }
      if (this.submitList.length > 20) {
        this.$message.warning("运单号查询最多支持20个运单")
      } else {
        // 将查询结果做区分
        const waybill = this.submitList
          .filter(i => i.keywordType === queryTypeEnum.WAYBILL_NO)
          .map(i => i.keyword)
        const order = this.submitList
          .filter(i => i.keywordType === queryTypeEnum.ORDER_NO)
          .map(i => i.keyword)
        const mobile = this.submitList
          .filter(i => i.keywordType === queryTypeEnum.MOBILE_NO)
          .map(i => i.keyword)
        const other = this.submitList
          .filter(i => i.keywordType === queryTypeEnum.OTHER || !i.keywordType)
          .map(i => i.keyword)
        // 将联想得到的手机号和其他类型的输入合并，类型修改为30
        const result = [
          {
            conditionInput: waybill,
            conditionType: queryTypeEnum.WAYBILL_NO
          },
          {
            conditionInput: order,
            conditionType: queryTypeEnum.ORDER_NO
          },
          // {
          //   conditionInput: mobile,
          //   conditionType: queryTypeEnum.MOBILE_NO
          // },
          {
            conditionInput: [...mobile, ...other],
            conditionType: queryTypeEnum.MOBILE_NO
          }
        ].filter(item => item.conditionInput.length)
        this.$emit("query", result)
      }
    },
    async getHistory() {
      const { data } = await API.searchHistoryLimit()
      this.history = data && data.length ? data.slice(0, 20) : []
    },
    async deleteHistory() {
      await API.searchHistoryDelete()
      this.getHistory()
    },
    historyQuery({ searchKey, searchType }) {
      this.input = searchKey
      this.submitList = [{
        keyword: searchKey,
        keywordType: searchType
      }]
      this.queryHandler()
    },
    addHandler(item) {
      // input处理
      const arr = this.input.replace("，", ",").split(",")
      arr.splice(arr.length - 1, 1, item.keyword)
      this.input = arr.join(",")
      // 选中值处理
      const changeIndex = this.submitList.length ? this.submitList.length - 1 : 0
      this.submitList.splice(changeIndex, 1, item)
      this.suggest = []
      this.$refs.input.focus()
    },
    focusHandler() {
      // 处理tooltip的边框出线
      this.visible = true
    },
    blurHandler() {
      this.visible = false
    },
    clear() {
      this.visible = false
      this.$refs.input.clear()
    },
    pasteHandler(e) {
      let data = e.clipboardData.getData("Text")
      let cache = data.replace(/(\r\n)/g, ",")
      
      const orderInput = document.getElementById("orderInput")
      const selectionStart = orderInput.selectionStart
      const selectionEnd = orderInput.selectionEnd
      let value = this.input
      this.input = value.substring(0, selectionStart) + cache + value.substring(selectionEnd)
      this.inputHandler()
    },
    inputHandler() {
      /**
       * 遍历现有字符判断和查找列表中的不同：
       * input删除的值
       * input修改的值
       * input新增的值
       */
      const input = this.input
        .replace(/，/g, ",")
        .split(",")
        .filter(i => !!i)
      const overLength = input.find(i => i.length > 120)
      if (overLength) {
        this.$message.warning("单个搜索字符长度不能超过120！")
        return
      }
      const submit = this.submitList
      const submitCache = cloneDeep(this.submitList)
      input.forEach((item, index) => {
        // 判断是否前方插入
        const repeat = submitCache.find(i => i.keyword === item)
        if (!submit[index] || item !== submit[index].keyword) {
          submit[index] = repeat ? repeat : {
            keyword: item,
            keywordType: queryTypeEnum.OTHER
          }
        }
      })
      if (input.length !== submit.length) submit.splice(input.length)
      this.getSuggest()
    },
    getSuggest: debounce(async function() {
      const arr = this.input.replace("，", ",").split(",")
      // 查找联想
      const keyword = arr[arr.length - 1]
      if (keyword && keyword.trim().length > 2) {
        const { data } = await API.getWaybillLink({
          keyword,
          pageSize: 10
        })
        data ? (this.suggest = data.slice(0, 10)) : []
      }
    }, 500)
  }
}
</script>

<style lang='scss' scoped>
$height: 32px;

.order_search {
  display: flex;
  justify-content: space-between;
  height: $height;
  align-self: center;
  
  /deep/ {
    .el-input__inner {
      width: 300px;
      padding: 0 30px 0 8px;
      height: $height;
      line-height: $height;
    }
    
    .el-input--medium .el-input__icon {
      height: $height;
      line-height: $height;
    }
  }
  
}

.box {
  
  .history {
    padding: 7px 15px 13px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    
    .title {
      color: #999999;
      line-height: 17px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      
      i {
        width: 16px;
        height: 16px;
        color: #8365f6;
      }
    }
    
    ul {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      
      li {
        width: 126px;
        height: 28px;
        background: #f0f3f8;
        border-radius: 4px;
        margin: 8px 16px 0 0;
        text-align: center;
        line-height: 28px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .suggest {
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    
    ul {
      width: 100%;
      
      li {
        width: 100%;
        height: 40px;
        font-size: 14px;
        padding: 0 12px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .suggest-wrapper {
          display: flex;
          padding: 10px 0;
          height: 20px;
          
          i {
            width: 15px;
            height: 15px;
            margin-right: 8px;
            line-height: 20px;
          }
          
          .text {
            // line-height: 40px;
            font-size: 14px;
            width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #333;
          }
        }
        
        .type {
          font-size: 12px;
          background: #f1f4ff;
          border-radius: 2px;
          color: #8b98ac;
          height: 16px;
          padding: 2px 4px;
        }
        
        &:hover {
          background-color: #f8f8f8;
        }
      }
    }
  }
}


.guide_order_search {
  width: 300px;
  height: 36px;
  position: relative;
}

.guide_pic {
  width: 334px;
  height: 204px;
  position: absolute;
  top: -6px;
  left: 81px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/order-query-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.guide_text {
  width: 426px;
  height: 142px;
  position: absolute;
  top: 185px;
  left: 105px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/order-query-text-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 69px 0 0 19px;
  box-sizing: border-box;
  
  p {
    font-size: 16px;
    text-align: left;
    color: #ffffff;
    line-height: 25px;
    
    &:first-child {
      margin-bottom: 8px;
    }
  }
}

</style>

<style lang='scss'>
.order_query_popper {
  padding: 0;
  margin-top: 4px !important;
  border: none !important;
}

.guide_order_query_popper {
  background: linear-gradient(#9073FF, #C58AFF);
  margin-top: 23px !important;
  
  .popper__arrow {
  
  }
}

</style>
