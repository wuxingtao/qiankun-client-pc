/**
 * 只有普遍通用的组件才注册到全局，仅几个页面用到的建议不要写在这里
 */
import NoneData from './none-data'
import KyTable from './ky-table'
import KyPageHeader from './ky-page-header'
import KyPageContainer from './ky-page-container'
import KySearchContainer from './ky-search-container'
import KyDialog from './ky-dialog'
import KyTabs from './ky-tabs'
import KyTableList from './ky-table/index-old'
import KySearchForm from './ky-search-form'
import KyCustomColumn from './ky-custom-column'
import KyCustomColumnV3 from './ky-custom-column-v3'
import KyCityAddress from './ky-city-address/index'
import AddressItem from '@client/components/AddressItem' //旧版，省市区一定要有三级
import KyAddress from './ky-address/index' //新版，省市区二级或以上
import KyCityName from './ky-city-name/index'
import KyDatePicker from './ky-date-picker/index'
import KyUpDown from './ky-up-down/index'
import KyTip from './ky-tip/index'
import KySelectDatePicker from './ky-select-date-picker'
// import EncryptFieldView from './encrypt-field/encrypt-field-view'
import EncryptFieldInput from './encrypt-field/encrypt-field-input'
import KyTooltip from './ky-tooltip/index'

export default {
  KyCityName,
  KyDatePicker,
  KyUpDown,
  KyCityAddress,
  NoneData,
  KyTable,
  KyPageHeader,
  KyPageContainer,
  KySearchContainer,
  KyDialog,
  KyTabs,
  KyCustomColumn,
  AddressItem,
  KyAddress,
  KyTableList,
  KySearchForm,
  EncryptFieldInput,
  KyCustomColumnV3,
  KyTip,
  KySelectDatePicker,
  KyTooltip
}
