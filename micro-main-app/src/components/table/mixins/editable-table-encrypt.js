import EncryptFieldView from '@/components/encrypt-field/encrypt-field-view'
import dataMask from '@/utils/dataMask'

const encryptFileds = ['sjContactPerson', 'sjMobile', 'sjTelephone', 'sjAddress']

export default {
  components: {
    EncryptFieldView,
  },
  data() {
    return {
      encryptFiledVisible: false,
      encryptContent: '',
      currentDecryptRow: null,
    }
  },
  methods: {
    isInputVisble(row, column) {
      if (row.isEncrypt && row.isEncrypt.value && encryptFileds.includes(column.prop)) {
        return false
      }
      return !column.readOnly && (row[column.prop].edit || row[column.prop].errorInfo)
    },
    maskCellValue(val, prop) {
      switch (prop) {
        case 'sjContactPerson':
          return dataMask.maskName(val)
        case 'sjTelephone':
          return dataMask.maskTelephone(val)
        case 'sjMobile':
          return dataMask.maskMobile(val)
        case 'sjAddress':
          if (val && val.length > 9) {
            return val.substring(0, 9) + '***'
          }
      }
      return val
    },
    handleEncryptFields(row, column) {
      if (row.isEncrypt && row.isEncrypt.value && encryptFileds.includes(column.prop)) {
        this.encryptFiledVisible = true
        this.currentDecryptRow = row
      }
    },
    recordDecryptResult() {
      this.encryptContent = encryptFileds
        .filter((f) => this.currentDecryptRow[f])
        .map((k) => `${this.tableColumns.find((col) => col.prop === k).text}：${this.currentDecryptRow[k].value}`)
        .join(',')
      this.currentDecryptRow.isEncrypt.value = false
    },
  },
}
