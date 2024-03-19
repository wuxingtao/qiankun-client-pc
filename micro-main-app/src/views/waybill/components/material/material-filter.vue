<template>
  <div class='material-filter'>
    <section class='material-filter-title'>
      <label class='font-bold'>运单号:</label>
      <span class='material-filter-title-code font-bold'>{{ activedCode }}</span>
    </section>
    <section class='material-filter-search'>
      <el-input
        clearable
        placeholder='请输入运单号'
        size='small'
        @input='onInput'
        suffix-icon='el-icon-search'
        v-model='inputCode'
      >
      </el-input>
    </section>
    <section class='material-filter-list'>
      <div class='material-filter-list-scroll' @click.capture='onCodeListClick'>
        <template v-for='item in codelist'>
          <div
            :key='item'
            class='material-filter-list-item'
            :class="activedCode === item ? 'actived' : ''"
            :data-code='item'>
            <ky-icon type='iconexpress-route-icon' />
            <span class='mg-l8'>{{ item }}</span>
          </div>
        </template>
      </div>
      <div class='material-filter-pagination' v-if='total > pageSizes[0]'>
        <el-pagination
          :pager-count='5'
          @size-change='onSizeChange'
          @current-change='onPageChange'
          :page-sizes='pageSizes'
          :page-size='form.pageSize'
          layout='prev, pager, next, sizes'
          :total='total'>
        </el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
import _ from 'lodash'
import { KyIcon } from '@comps'
import API from '@api/waybill'

export default {
  components: { KyIcon },
  data() {
    return {
      inputCode: '',
      form: {
        page: 1,
        pageSize: 20,
      },
      pageSizes: [20, 50, 100],
      total: 0,
      codelist: [],
      activedCode: '',
      originalCodeList: []
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    init() {
      this.form = {
        page: 1,
        pageSize: 20,
      }
      this.getMaterialWaybillList()
    },
    async getMaterialWaybillList() {
      try {
        const params = this.$store.state.material.queryListParams
        const data = await API.getMaterialWaybillList({ ...params, ...this.form })
        this.originalCodeList = _.cloneDeep(data.rows)
        this.total = data.rowTotal
        this.codelist = this.filterCodeList(data.rows)
        this.activedCode = this.codelist[0] || null
        this.$store.dispatch('material/SET_CODE_LIST_TOTAL', this.total)
        this.$store.dispatch('material/SET_ACTIVED_YD_CODE', this.activedCode)
      } catch (err) {
        console.warn('请求失败')
      }
    },
    onInput() {
      if (!this.inputCode) {
        return this.codelist = this.originalCodeList
      }
      const codelist = _.cloneDeep(this.originalCodeList)
      const filterCodeList = this.filterCodeList(codelist)
      this.codelist = filterCodeList
    },
    filterCodeList(codes) {
      return codes.reduce((arr, item) => {
        const result = _.includes(item, this.inputCode.toUpperCase())
        if (result) {
          arr.push(item)
        }
        return arr
      }, [])
    },
    onCodeListClick(e) {
      if (e.target === e.currentTarget) {
        return
      }
      const code = e.target.dataset.code
      if (this.activedCode === code) {
        return
      }
      this.activedCode = code
      this.$store.dispatch('material/SET_ACTIVED_YD_CODE', code)
    },
    /** 每页显示条数更新 */
    onSizeChange(size) {
      this.form.pageSize = size
      this.getMaterialWaybillList()
    },
    /** 页码更新 */
    onPageChange(page) {
      this.form.page = page
      this.getMaterialWaybillList()
    },
  },
}
</script>
<style lang='scss' scoped>
@import './style.scss';
</style>
