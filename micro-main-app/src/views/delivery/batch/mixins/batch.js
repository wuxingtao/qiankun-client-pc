import TableEditable from '@/components/table/table-editable'
import DialogSuperZone from '../../components/dialog-super-zone'
import BatchFooter from '../batch-footer'
import HeaderDeclaredValue from '../table-cell-template/header-declared-value'
import batchColumnsCommon from '../batch-columns-common'
import batchColumnsFixed from '../batch-columns-fixed'

export default{
  components: {
    TableEditable,
    DialogSuperZone,
    BatchFooter,
    HeaderDeclaredValue,
    batchColumnsCommon,
    batchColumnsFixed
  },
  props: {
    supplierOrderList: {
      type: Array,
    },
  },
  setup() {
  },
  methods: {
    handleCellSelectChange({fieldName, val, row, value}){
      this.$refs.tableEditableRef.handleChange({fieldName, val, row, value})
    }
  },
}
