<template>
    <el-dialog :visible="visible" custom-class="column-manage-dialog k-dialog"
               :title="title"
               :close-on-click-modal="false"
               @close="close"
               v-bind="$attrs"
               center
               top="50px"
               :width="width">
      <div class="column__body ky-column-filter">
        <el-row>
          <el-col :span="5">
            <h4 class="title">选中的字段将显示在列表上</h4>
            <el-checkbox :indeterminate="isIndeterminate"
                         :value="checkAll"
                         class="select-all"
                         @change="handleAllChange">全选
            </el-checkbox>
          </el-col>
          <el-col :span="15">
            <el-autocomplete
                    ref="elautocomplete"
                    :value-key="valueKey"
                    style="width: 250px;"
                    v-model="searchValue"
                    suffix-icon="el-icon-search"
                    clearable
                    :fetch-suggestions="querySearchAsync"
                    placeholder="请输入内容"
                    @select="handleSelect"
            ></el-autocomplete>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <ky-up-down v-model="checkOpen"></ky-up-down>
          </el-col>
        </el-row>

        <div class="column__list" ref="checkedScroll" :style="openStyle" v-show="checkOpen">
          <el-checkbox-group v-model="checkedColumns" @change="handleChange">
            <li ref="checkedScrollItem" class="column__item column__item_hover" :myId="item.prop"  v-for="item in columnList" :key="item.text || item.label">
              <el-checkbox-button :class="{'is--search':item.prop===activeProp}" v-if="item.visible" :disabled="item.disabled" :label="item.prop"
                                  @change="(val)=>{item.checked=val}">
                <span v-if="!item.disabled" class="column__item--icon"></span>
                <span class="btn_text">{{ item.text || item.label }}</span>
              </el-checkbox-button>
            </li>
            <i v-for="(item,index) in columnList" :key="index"></i>
          </el-checkbox-group>
        </div>
        <!--  拖拽列表  -->
        <div class="column__drag">
          <el-row>
            <el-col :span="20">
              <div class="header mt_16 mb_16 f_w_500">
                已选中<span class="theme-color fs_18 mlr_4">{{ checkedColumnsDrag.length }}</span>个字段（注：拖动以下字段，可进行从左至右排序）
              </div>
            </el-col>
            <el-col :span="4" style="text-align: right">
              <ky-up-down v-model="dragOpen"></ky-up-down>
            </el-col>
          </el-row>
          <div v-show="dragOpen" ref="dragScroll" class="content" :style="openStyle" style="padding: 10px 5px;">
            <draggable
                    v-if="!isClientMode"
                    v-model="checkedColumnsDrag"
                    ghost-class="ghost"
                    v-bind="dragOptions"
                    @change="dragChange">
              <transition-group>
                <template v-for="(element,index) in checkedColumnsDrag">
                  <div ref="dragScrollItem" :myId="element.prop"  :class="['drag-item drag--able']" :key="element.text || element.label"
                  >
                    <el-button class="item__btn" :class="{'is--search':element.prop===activeProp}" @click.stop="handleTip(element)">
                      <span class="num">{{ index + 1 }}</span>
                      <span class="btn_text2">{{ element.text || element.label }}</span>
                      <span v-if="!element.disabled" class="delete"
                            @click="()=>deleteItem(element.prop)">
                        <i class="iconfont icon-btn-icon fs_12--strict delete-hover"></i>
                      </span>
                    </el-button>
                  </div>
                </template>
              </transition-group>
            </draggable>
            <div v-else>
              <template v-for="(element,index) in checkedColumnsDrag">
                <div ref="dragScrollItem" :myId="element.prop"  :class="['drag-item drag--able']" :key="element.text || element.label"
                     v-dragging="{ item: element, list: checkedColumnsDrag, group: 'item' }"
                >
                  <el-button class="item__btn" :class="{'is--search':element.prop===activeProp}"  @click.stop="handleTip(element)">
                    <span class="num">{{ index + 1 }}</span>
                    <span class="btn_text2">{{ element.text || element.label }}</span>
                    <span v-if="!element.disabled" class="delete"
                          @click="()=>deleteItem(element.prop)">
                        <i class="iconfont icon-btn-icon fs_12--strict delete-hover"></i>
                      </span>
                  </el-button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
     <span class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="saveData">确 定</el-button>
    </span>
      </template>
    </el-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import {cloneDeep} from 'lodash'
import PinyinMatch from 'pinyin-match'
export default {
  name: 'ky-column-filter' ,
  props: {
    /* label: '测试1', // el-table label
       prop: 'value1', // el-table prop
       disabled: true, // 是否禁用
       checked: true, // 是否选中
       visible: true // 是否显示
       * */
    title:{
      type: String,
      default:'自定义排序'
    },
    column:{
      type: Array,
      default:()=>[]
    },
    visible:{
      type:Boolean,
      default: false
    },
    width:{
      type: String,
      default: '1126px'
    },
    valueKey:{
      type: String,
      default: 'text'
    },
  } ,
  watch:{
    visible:{
      handler(n){
        if(n===true){
          this.initColumns()
        }
      },
      immediate:true
    }
  },
  data() {
    return {
      checkOpen: true,
      dragOpen: true,
      timeout: '',
      activeProp: '',
      searchValue: '',
      columnList: [], // 所有的数据
      checkedColumns: [], // 高亮的数据
      checkedColumnsDrag: [],// 拖拽的数据
      dragOptions: {
        animation: 0 ,
        group: 'description' ,
        // disabled: !this.editable,
        ghostClass: 'ghost' ,
        chosenClass: 'chosen' ,
        draggable: '.drag--able'
      }
    }
  } ,
  computed: {
    openStyle(){
      if(this.checkOpen===false || this.dragOpen===false){
        return {
          'max-height': '420px'
        }
      }
    },
    // 部分选中
    isIndeterminate() {
      return this.checkedColumns.length > 0 && this.checkedColumns.length !== this.columnList.length
    } ,
    // 全选
    checkAll() {
      return this.checkedColumns.length > 0 && this.checkedColumns.length === this.columnList.length
    },
  } ,
  mounted(){
    // 兼容IE 拖拽后触发的事件
    this.$dragging.$on('dragged', this.dragChange)
  },
  components: {draggable} ,
  methods: {
    // 定位 当前激活的 滚动
    scrollGoto(prop,refPater,refChild) {
      this.$nextTick(() => {
        let list=this.$refs[refChild]
        let y = 0
        if(list&&list.length>0 &&prop){
          let dom = list.find((item) => {
            let myId=item.getAttribute('myId')
            return prop===myId
          })
          if(dom){
            y = dom.offsetTop || 0
            if(y&&y>5){
              y-=5
            }
          }
        }
        this.$refs[refPater] && this.$refs[refPater].scrollTo(0, y)
      })
    },
    //搜索
    querySearchAsync(queryString, cb) {
      queryString=queryString.replace(/(^\s*)|(\s*$)/g, "")
      let restaurants = this.columnList || []
      let results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants
      this.$refs.elautocomplete.activated=true
      cb(results)
    },
    createStateFilter(queryString) {
      return (state) => {
        let search= state.text || state.label
        return PinyinMatch.match(search, queryString)
      }
    },
    handleSelect(item) {
      this.activeProp=item.prop|| ''
      this.scrollGoto(this.activeProp,'checkedScroll','checkedScrollItem')
      this.scrollGoto(this.activeProp,'dragScroll','dragScrollItem')
      console.log(item)
    },
    /*初始化数据*/
    initColumns(){
      if(this.column&&this.column.length>0){
        // 过滤高亮的数据
        this.columnList= [] // 所有的数据
        this.checkedColumns= [] // 高亮的数据
        this.checkedColumnsDrag= [] // 拖拽的数据
        this.columnList=cloneDeep(this.column)
        this.columnList.forEach((item)=>{
          if(!item.disabled){
            item.disabled=false
          }
          if(item.checked===true){
            if(item.prop){
              this.checkedColumnsDrag.push(item)
              this.checkedColumns.push(item.prop)
            }else{
              item.sortIndex= ''
            }
          }else{
            item.sortIndex= ''
          }
        })
        if(this.checkedColumnsDrag&&this.checkedColumnsDrag.length>0){
          this.checkedColumnsDrag.sort(function(a,b){
            return a.sortIndex-b.sortIndex
          })
        }
      }
    },
    /*关闭弹层*/
    close(){
      this.$emit('update:visible',false)
    },
    /*触发全选 */
    handleAllChange(val) {
      let checkedColumns=[]
      let checkedColumnsDrag= []
      if (val) {
        this.columnList.forEach((item) => {
          if(item.disabled){
            if(item.checked){
              checkedColumns.push(item.prop)
              checkedColumnsDrag.push(item)
            }
          }else{
            item.checked=true
            checkedColumns.push(item.prop)
            checkedColumnsDrag.push(item)
          }
        })
        this.checkedColumns = checkedColumns
        this.checkedColumnsDrag = checkedColumnsDrag
      } else {
        this.checkedColumnsDrag = this.columnList.filter((item) => {
          if(item.disabled && item.checked){
            checkedColumns.push(item.prop)
          }else {
            item.checked=false
          }
          return item.disabled && item.checked
        })
        this.checkedColumns = checkedColumns
      }
    } ,
    /*单个check选中*/
    handleChange(val) {
      this.activeProp=''
      this.checkedColumnsDrag = this.columnList.filter((item)=>{
        if(item.disabled){
          if(item.checked){
            return val.includes(item.prop)
          }
        }
        return !item.disabled && val.includes(item.prop)
      })
    },
    // 已选中提示
    handleTip(item){
      this.activeProp=''
      if(item.disabled){
        this.$message.warning(`${item.label||item.text}不支持隐藏`)
      }
    },
    /*column 列表拖拽change */
    dragChange() {
      this.activeProp=''
      this.checkedColumns = this.checkedColumnsDrag.map((item) => {
        return item.prop
      })
    },
    /* 删除指定字段*/
    deleteItem(prop) {
      this.activeProp=''
      for (let i = 0; i < this.checkedColumnsDrag.length; i++) {
        if (this.checkedColumnsDrag[i].prop === prop) {
          let item= this.checkedColumnsDrag[i]
          item.checked=false
          this.checkedColumnsDrag.splice(i , 1)
          break
        }
      }
      const deleteIndex = this.checkedColumns.indexOf(prop)
      if (deleteIndex !== -1) {
        this.checkedColumns.splice(deleteIndex , 1)
      }
    },
    /*保存数据*/
    saveData() {
      this.activeProp=''
      if(this.checkedColumnsDrag&&this.checkedColumnsDrag.length>0){
        this.checkedColumnsDrag.forEach((item,index)=>{
          item.sortIndex=index+1
          item.checked=true
        })
      }
      this.$emit('select',{dragData:this.checkedColumnsDrag, column:this.columnList})
      this.close()
    },
    /*获取数据*/
    getData(){
      return {
        column: this.columnList, // 所有的数据
        key: this.checkedColumns, // 高亮的数据
        checkedColumnsDrag: this.checkedColumnsDrag,// 拖拽的数据
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './index';
  /deep/ .el-dialog__header{
    padding: 16px 20px;
  }
  /deep/ .el-input__inner {
    border-radius: 18px;
  }
  .is--search{
    border-radius: 18px;
    box-shadow: 0 0 6px 3px #bf3cf3;
  }
  .delete-hover{
    &:hover{
      color: #a70ce8;
      background: rgba(150, 9, 234, 0.1);
      border-radius: 50%;
      text-align: center;
      padding: 2px;
    }
  }
  .content{
    position: relative;
    max-height: 259px;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
  }
  .column__list{
    position: relative;
    scroll-behavior:smooth;
    padding: 10px 5px;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
  }

  /deep/ .ky-column-filter .column__item_hover{
  /*  width: 240px;*/
  }
  /deep/ .ky-column-filter .column__item_hover{
    &:hover{
      .btn_text{
        /* width: auto;*/
        position: absolute;
        left: 0;
        text-align: center;
        width: 110px;
        border-radius: 18px !important;
      }
      .is-checked{
        .btn_text{
          background: #8365f6;
        }
      }
    }
  }
  /deep/ .ky-column-filter .column__item_hover .el-checkbox-button .el-checkbox-button__inner{
    position: relative;
   /* width: 240px;*/
  }
</style>
