/**
 * 按照页面编码的维度统一存放上报方法
 * 各个地方按需调用
 * */

const CLK_SEARCH_ORDER_BUTTON = 'clk_search_order_button'
const CLK_SEARCH_ORDER_CARD_FIRST = 'clk_search_order_card_first'
const CLK_SEARCH_ORDER_CARD_SECOND = 'clk_search_order_card_second'
const CLK_SEARCH_ORDER_FUNCTION = 'clk_search_order_function'
const CLK_SEARCH_ORDER_LIST = 'clk_search_order_list'

const CLK_EXPRESS_TAB = 'clk_express_tab'
const CLK_EXPRESS_SINGLE_BUTTON = 'clk_express_single_button'
const CLK_EXPRESS_SINGLE_SUBBUTTON = 'clk_express_single_subbutton'
const CLK_EXPRESS_BATCH_BUTTON = 'clk_express_batch_button'
const CLK_EXPRESS_BATCH_SUBBUTTON_SUB = 'clk_express_batch_subbutton_sub'
const CLK_EXPRESS_BATCH_SUBBUTTON = 'clk_express_batch_subbutton'

class reportUtils {
  constructor() {}

  clkSearchOrderButton = params => {
    window.report.sendClickEvent(CLK_SEARCH_ORDER_BUTTON, params)
  }

  clkSearchOrderCardFirst = params => {
    window.report.sendClickEvent(CLK_SEARCH_ORDER_CARD_FIRST, params)
  }

  clkSearchOrderCardSecond = params => {
    window.report.sendClickEvent(CLK_SEARCH_ORDER_CARD_SECOND, params)
  }

  clkSearchOrderFunction = params => {
    window.report.sendClickEvent(CLK_SEARCH_ORDER_FUNCTION, params)
  }

  clkSearchOrderList = params => {
    window.report.sendClickEvent(CLK_SEARCH_ORDER_LIST, params)
  }

  clkExpressTab = params => {
    window.report.sendClickEvent(CLK_EXPRESS_TAB, params)
  }

  clkExpressSingleButton = params => {
    window.report.sendClickEvent(CLK_EXPRESS_SINGLE_BUTTON, params)
  }

  clkExpressSingleSubbutton = params => {
    window.report.sendClickEvent(CLK_EXPRESS_SINGLE_SUBBUTTON, params)
  }

  clkExpressBatchButton = params => {
    window.report.sendClickEvent(CLK_EXPRESS_BATCH_BUTTON, params)
  }

  clkExpressBatchSubbuttonSub = params => {
    window.report.sendClickEvent(CLK_EXPRESS_BATCH_SUBBUTTON_SUB, params)
  }

  clkExpressBatchSubbutton = params => {
    window.report.sendClickEvent(CLK_EXPRESS_BATCH_SUBBUTTON, params)
  }
}

export default new reportUtils()
