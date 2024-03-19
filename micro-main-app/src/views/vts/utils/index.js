import native from './native'

/**
 * @param {*} num
 * @return {*} 时间组件 初始时间计算
 */
export const untilPickerTime = (num) => {
    let curTimeObj = new Date(new Date().getTime() + untilPickerHours(num))
    let curMinutes = (5 - curTimeObj.getMinutes() % 5) * 1000 * 60
    let curSeconds = curTimeObj.getSeconds() * 1000
    return curTimeObj.getTime() + curMinutes - curSeconds + (60 * 60 * 1000)
}

/**
* @param {*} num
* @return {*} 时间组件 时间转换/5的倍数
*/
export const untilPicker5Time = (timeStamp) => {
    let curTimeObj = new Date(timeStamp)
    let curMinutes = (5 - curTimeObj.getMinutes() % 5) * 1000 * 60
    let curSeconds = curTimeObj.getSeconds() * 1000
    return curTimeObj.getTime() + curMinutes - curSeconds
}

/**
* @param {*} num
* @return {*} 时间组件 小时转换
*/
export const untilPickerHours = (num) => {
    return 1000 * 60 * 60 * num
}

/**
* 获取小时时间差
* @param {时间戳} startDate 开始时间
* @param {时间戳} endDate 结束时间
* @param {boolean} ceil 取整方式 true 向上取整 false 向下取整
*/
export const untilIntervalHour = (startDate, endDate, ceil = true) => {
    let ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    if (ms < 0) {
        return 0
    }
    return ceil ? Math.ceil(ms / 1000 / 60 / 60) : Math.floor(ms / 1000 / 60 / 60)
}

export const REGULAR = {
    // 登录 - 5-32位非中文字符 (密码)
    password: /^[^\u4e00-\u9fa5]{5,32}$/,
    // 注册 - 8-32位非中文字符 (密码)
    setPassword: /^[^\u4e00-\u9fa5]{8,32}$/,
    // 非零的正整数
    positive: /^[1-9]\d*$/,
    // 正整数
    positiveOrZero: /^[0-9]\d*$/,
    //数字或小数
    number: /^\d+(\.\d+)?$/,
    //带1位或2位小数
    currency: /^\d*[.]?\d{1,2}$/,
    // 图像验证码（4位）
    identCode: /\d{4}/,
    msgCode: /\d{6}/,
    email: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
    // 手机号码
    mobileNumber: /^1[3456789]\d{9}$/,
    // 11位数字
    mobileTest: /\d{11}/,
    // 固定电话
    telephone: /\d{3}-\d{8}|\d{4}-\d{7}/,
    telephoneNew: /\d{3}-?\d{4,9}|\d{4}-?\d{3,8}/,
    // 固定电话含分机号
    telephoneFull: /^(\d{3,4}-)\d{7,8}(|([-\u8f6c]{1}\d{1,5}))$/,
    // 手机/固话
    mobileTelephone: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
    idCard: /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2]\d)|(3[0-1]))((\d{4})|(\d{3}[Xx]))$/,
    landlinePhone: /(^(0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?$)|(^(400-)?[2-9]{6,7}$)/,
    landlinePhone2: /^[\d-(),，]{5,20}$/,
    mobilePhone: /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|19[0-9]|14[057]|165|166|168|199|198)[0-9]{8}$/,
    includeChineseCharacter: /[\u4e00-\u9fa5]/,
    chineseAndEnglish: /^[\u4e00-\u9fa5_a-zA-Z]+$/,
    textAndNumber: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
    //普通文本(非特殊字符)
    genaralText: /^[\u4E00-\u9FA5A-Za-z0-9()（）\-－*,，.~。？?！@#￥%……&*——+!@#$%^&*()_{}《》\\|【】\[\]<>!@#$%^&*_\u0020\u3000]+$/,
    externalLink: /^(https?:|mailto:|tel:)/,
    //唯品会入库单号
    vipshopCode: /^[a-zA-Z0-9]{10}-[a-zA-Z0-9]{3,10}$/,
    //尺寸
    size: /^\d{1,9}\*\d{1,9}\*\d{1,9}(\*\d{1,9})?$/,
    // 运单号为7、11位纯数字或15位字符
    waybillNo: /^(\d{7}|\d{11}|[0-9a-zA-Z]{15})$/,
    emoji: /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig
}

export const Regular = {
    // 登录 - 5-32位非中文字符 (密码)
    password: /^[^\u4e00-\u9fa5]{5,32}$/,
    // 注册 - 8-32位非中文字符 (密码)
    setPassword: /^[^\u4e00-\u9fa5]{8,32}$/,
    // 非零的正整数
    positive: /^[1-9]\d*$/,
    // 正整数
    positiveOrZero: /^[0-9]\d*$/,
    //数字或小数
    number: /^\d+(\.\d+)?$/,
    //带1位或2位小数
    currency: /^\d*[.]?\d{1,2}$/,
    //带1位小数
    _currency: /^\d*[.]?\d{1}$/,
    // 图像验证码（4位）
    identCode: /\d{4}/,
    msgCode: /\d{6}/,
    email: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
    // 手机号码
    mobileNumber: /^1[3456789]\d{9}$/,
    // 11位数字
    mobileTest: /\d{11}/,
    // 固定电话
    telephone: /\d{3}-\d{8}|\d{4}-\d{7}/,
    telephoneNew: /\d{3}-?\d{4,9}|\d{4}-?\d{3,8}/,
    // 固定电话含分机号
    telephoneFull: /^(\d{3,4}-)\d{7,8}(|([-\u8f6c]{1}\d{1,5}))$/,
    // 手机/固话
    mobileTelephone: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
    idCard: /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2]\d)|(3[0-1]))((\d{4})|(\d{3}[Xx]))$/,
    landlinePhone: /(^(0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?$)|(^(400-)?[2-9]{6,7}$)/,
    landlinePhone2: /^[\d-(),，]{5,20}$/,
    mobilePhone: /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|19[0-9]|14[057]|165|166|168|199|198)[0-9]{8}$/,
    includeChineseCharacter: /[\u4e00-\u9fa5]/,
    chineseAndEnglish: /^[\u4e00-\u9fa5_a-zA-Z]+$/,
    textAndNumber: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
    //普通文本(非特殊字符)
    genaralText: /^[\u4E00-\u9FA5A-Za-z0-9()（）\-－*,，.~。？?！@#￥%……&*——+!@#$%^&*()_{}《》\\|【】\[\]<>!@#$%^&*_\u0020\u3000]+$/,
    externalLink: /^(https?:|mailto:|tel:)/,
    //唯品会入库单号
    vipshopCode: /^[a-zA-Z0-9]{10}-[a-zA-Z0-9]{3,10}$/,
    //尺寸
    size: /^\d{1,9}\*\d{1,9}\*\d{1,9}(\*\d{1,9})?$/,
    // 运单号为7、11位纯数字或15位字符
    waybillNo: /^(\d{7}|\d{11}|[0-9a-zA-Z]{15})$/,
    emoji: /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig
}


export const formatGenericParams = (obj = {}, type = '') => {
    let tmp = []
    let arr = []
    formatParams(obj, arr) // 1、递归处理参数，去掉空参，2、将a:{b:1,c:2}这种格式改为a.b,a.c
    arr.forEach((item, index) => {
        console.log(obj, item, arr, 'formatGenericParams');


        // 参数是xx.xx的这种格式
        if (item.indexOf('.') !== -1) {
            let key = item.split('.')[0]
            let key2 = item.split('.')[1]
            // 不为空，不为空数组，不等于0,才需要格式化。 数字0比较特殊，需单独拿出来
            if ((!obj[key][key2] || !obj[key][key2].length) && obj[key][key2] !== 0) {
                if (arr.includes('orderStatistical.waitOrderFlag')) {
                    let _parmas = []
                    _parmas = [
                        {
                            propertyName: item,
                            columnName: item,
                            frontBrackets: '(',
                            conditionOperation: 'or',
                            operation: 'equal',
                            type: 'number',
                            values: [obj[key][key2]]
                        },
                        {
                            columnName: "orderStatistical.kyeWaitPriceFlag",
                            conditionOperation: 'or',
                            operation: "equal",
                            propertyName: "orderStatistical.kyeWaitPriceFlag",
                            type: "number",
                            values: [obj[key][key2]]
                        },
                        {
                            columnName: "orderStatistical.sallWaitPriceFlag",
                            conditionOperation: "or",
                            operation: "equal",
                            postBrackets: ")",
                            propertyName: "orderStatistical.sallWaitPriceFlag",
                            type: "number",
                            values: [obj[key][key2]]
                        }
                    ]
                    _parmas.forEach(_item => {
                        tmp.push(_item)
                    })
                } else if (arr.includes('orderStatistical.underWayFlag')) {
                    let _parmas = [
                        {
                            propertyName: item,
                            columnName: item,
                            frontBrackets: '(',
                            conditionOperation: 'or',
                            operation: 'equal',
                            type: 'number',
                            values: [obj[key][key2]]
                        },
                        {
                            columnName: "orderStatistical.orderedUnbindFlag",
                            conditionOperation: "",
                            operation: "equal",
                            postBrackets: ")",
                            propertyName: "orderStatistical.orderedUnbindFlag",
                            type: "number",
                            values: [obj[key][key2]]
                        }
                    ]
                    _parmas.forEach(_item => {
                        tmp.push(_item)
                    })
                } else {
                    let params = {
                        propertyName: item,
                        columnName: item,
                        frontBrackets: '(',
                        postBrackets: ')',
                        conditionOperation: '',
                        operation: 'equal',
                        type: 'number',
                        values: [obj[key][key2]]
                    }
                    tmp.push(params)
                }
                console.log(tmp, '---------');

            } else {
                let operation = 'equal'
                let type = 'string'
                let conditionOperation = index === arr.length - 1 ? '' : 'and' // 是否为最后一个
                let values = []
                // if(Array.isArray(obj[item]) && obj[item].length === 3) { // 地址
                if (Array.isArray(obj[key][key2])) { // 除地址外，其他数组格式的
                    let val = obj[key][key2][0]
                    if (isNaN(val) && !isNaN(Date.parse(val))) { // 是日期格式的
                        type = 'date'
                        operation = 'between'
                    } else {
                        type = 'enum'
                        operation = 'equal'
                    }
                    values = obj[key][key2]
                } else { // 普通字符串参数
                    values = (obj[key][key2] || obj[key][key2] === 0) ? [obj[key][key2]] : []
                }
                let params = {
                    propertyName: item,
                    columnName: snakeCase(item),
                    frontBrackets: '(',
                    postBrackets: ')',
                    conditionOperation,
                    operation,
                    type,
                    values
                }
                tmp.push(params)
            }
        } else if ((!obj[item] || !obj[item].length) && obj[item] !== 0) {
            console.log('这里？？');
            let params = {
                propertyName: item,
                columnName: item,
                frontBrackets: '(',
                postBrackets: ')',
                conditionOperation: '',
                operation: 'equal',
                type: 'number',
                values: [obj[item]]
            }
            tmp.push(params)
            console.log(tmp, '---------');
        } else {
            let operation = 'equal'
            let type = 'string'
            let conditionOperation = index === arr.length - 1 ? '' : 'and' // 是否为最后一个
            let whetherSettleNetworkCargo = 10
            let values = []
            if (item === 'startAddress') { // 始发地（始发地变量名必须命名为 startAddress) 数据格式为[zone|xx省,zone|xx市,zone|xx区]  或者是  [street|xx省,street|xx市,street|xx镇]
                obj[item].forEach((address, addIndex) => { // address的字符拼接方式为 区或镇的标识+|+区或镇的名字 zone|省/zone|市/zone|区/street|省/street|市/street|区
                    const val = address.split('|')[1] // 真正传给后端的值
                    const addressType = address.split('|')[0] // 前端用来标记是区（县）还是镇和街道。zone是区县，street是镇和街道
                    // 数组的第一个为省、第二个为市、第三个为区（县）或者是镇（比如东莞市下面是没有区的）
                    const key = addIndex === 0 ? 'startProvince' : addIndex === 1 ? 'startCity' : addressType === 'zone' ? 'startArea' : 'startTown'
                    // 只有当地址为参数的最后一项，且当前项为地址数组的最后一个的时候，值为''
                    conditionOperation = (index === arr.length - 1 && addIndex === 2) ? '' : 'and'
                    let params = {
                        propertyName: key,
                        columnName: snakeCase(key),
                        frontBrackets: '(',
                        postBrackets: ')',
                        conditionOperation,
                        operation,
                        type,
                        whetherSettleNetworkCargo,
                        values: [val]
                    }
                    tmp.push(params)
                })
            } else if (item === 'endAddress') { // 目的地（目的地变量名必须命名为 endAddress) 所有注释同始发地
                obj[item].forEach((address, addIndex) => {
                    const val = address.split('|')[1]
                    const addressType = address.split('|')[0]
                    const key = addIndex === 0 ? 'endProvince' : addIndex === 1 ? 'endCity' : addressType === 'zone' ? 'endArea' : 'endTown'
                    conditionOperation = (index === arr.length - 1 && addIndex === 2) ? '' : 'and'
                    let params = {
                        propertyName: key,
                        columnName: snakeCase(key),
                        frontBrackets: '(',
                        postBrackets: ')',
                        conditionOperation,
                        operation,
                        type,
                        whetherSettleNetworkCargo,
                        values: [val]
                    }
                    tmp.push(params)
                })
            } else if (Array.isArray(obj[item])) { // 除地址外，其他数组格式的
                let val = obj[item][0]
                if (isNaN(val) && !isNaN(Date.parse(val))) { // 是日期格式的
                    type = 'date'
                    operation = 'between'
                } else {
                    type = 'enum'
                    operation = 'contain'
                }
                values = obj[item]
            } else if (typeof obj[item] === 'number') { //数字类型
                console.log('进这里');

                type = 'number'
                operation = 'qpual'
            } else { // 普通字符串参数
                values = (obj[item] || obj[item] === 0) ? [obj[item]] : []
            }
            if (item !== 'startAddress' && item !== 'endAddress') { // 不是特殊的地址参数，则直接push进数组中
                tmp.push({
                    propertyName: item,
                    columnName: snakeCase(item),
                    frontBrackets: '(',
                    postBrackets: ')',
                    conditionOperation,
                    operation,
                    type,
                    whetherSettleNetworkCargo,
                    values
                })
            }
        }
    })
    return {
        vos: tmp
    }
}

export const formatAggregationsParams = (kye) => {
    let aggregations = [
        {
            field: "orderStatistical.kyeWaitPriceFlag", // 代理待报价
            operation: "sum",
            resultKey: "kyeWaitPriceSum",
            resultVal: "Double",
        },
        {
            field: "orderStatistical.sallWaitPriceFlag", // 销售待报价
            operation: "sum",
            resultKey: "sallWaitPriceSum",
            resultVal: "Double",
        },
        {
            field: "orderStatistical.orderedUnbindFlag", // 已下单
            operation: "sum",
            resultKey: "orderedUnbindSum",
            resultVal: "Double",
        },
        {
            "field": "orderStatistical.waitOrderFlag",//待下单
            "operation": "sum",
            "resultKey": "waitOrderSum",
            "resultVal": "Double"
        },

        {
            "field": "orderStatistical.underWayFlag",//运输中
            "operation": "sum",
            "resultKey": "underWaySum",
            "resultVal": "Double"
        },
        {
            "field": "orderStatistical.receiveFlag",//已完成
            "operation": "sum",
            "resultKey": "receiveSum",
            "resultVal": "Double"
        },
        {
            "field": "orderStatistical.cancelFlag",//已取消
            "operation": "sum",
            "resultKey": "cancelSum",
            "resultVal": "Double"
        }
    ]
    // if (+kye === 0) {
    return aggregations
    // } else {
    //     return [aggregations[+kye - 1]]
    // }

}

// 递归处理参数，去掉空参，和深层次遍历
export const formatParams = (obj, arr, key) => {
    if (obj instanceof Object) {
        Object.keys(obj).forEach(item => {
            if (Object.prototype.toString.call(obj[item]) === '[object Object]') {
                formatParams(obj[item], arr, item)
            } else if ((obj[item] && obj[item].length) || obj[item] === 0 || obj[item] === 1) {
                let data = key ? key + '.' + item : item
                arr.push(data)
            }
        })
    }
    return arr
}

/**
 * 转换字符串string为下划线命名
 * @param {String} value
 * @example
 *  aBcD => a_b_c_d
 */
export function snakeCase (value) {
    if (typeof value !== 'string') {
        return value
    }

    return value.replace(/[A-Z]/g, ($0) => {
        return '_' + $0.toLowerCase()
    })
}

//设置运单查询条件缓存
export function setVtsTabKye (data) {
    if (data) {
        sessionStorage.setItem('vtsTabKye', JSON.stringify(data))
    } else {
        sessionStorage.removeItem('vtsTabKye')
    }
}
//读取运单查询条件缓存
export function getVtsTabKye () {
    return JSON.parse(sessionStorage.getItem('vtsTabKye')) || {}
}

/**
 * 导出excel
 * @param {Array} jsonData 表格数据
 * @param {Array} theadColumns 表格列数据
 * @param {String} filename 文件名
 * @returns 
 */
export async function exportExcel ({ jsonData, theadColumns, filename }) {
    // if (native.isClientMode()) {
    //     let tableData = jsonData
    //     if (theadColumns) {
    //         tableData = tableData.map((r) => {
    //             let row = {}
    //             theadColumns.forEach((c) => {
    //                 row[c.text] = r[c.prop] === 0 ? 0 : (r[c.prop] || '')
    //             })
    //             return row
    //         })
    //     }
    //     const result = JSON.parse(native.exportTable(JSON.stringify(tableData), filename))
    //     if (result) {
    //         if (result.code == 0 && result.msg) {
    //             Message.success(result.msg)
    //         } else if (result.code != 0 && result.msg) {
    //             Message.error(result.msg)
    //         }
    //     }
    //     return
    // }
    const excel = await import('./excelUtil')
    excel.exportExcel({ jsonData, theadColumns, filename })
}

export const getPhone = () => {
    return sessionStorage.getItem('PHONE')
}

export const getCustomerCode = () => {
    return sessionStorage.getItem('CUSTOMER_CODE')
}

/**
* 通过查询接口导出excel（注：接口入参必须包含page属性，出参中res.data.pageTotal和res.data.rows
* @param {Function} requestFunc 请求接口方法
* @param {Object} params 请求接口入参
* @param {Array} tableColumns 表格列
* @param {String} filename 文件名
* @param {String} pageIndexName 入参当前页的参数名称
* @param {String} pageSizeName 入参页大小的参数名称
* @param {String} totalCountName 出参总行数的参数名称
* @param {String} rowsName 出参数据的参数名称
* @returns
*/
export async function exportExcelByApi ({ requestFunc, params, tableColumns, filename, pageIndexName = 'page', pageSizeName = 'pageSize', totalCountName = 'rowTotal', rowsName = 'rows' }) {
    if (!params || [pageIndexName, pageSizeName].some((f) => !params.hasOwnProperty(f))) {
        return console.error(`请求方法参数中必须包含${pageIndexName}和${pageSizeName}属性`)
    }
    params[pageIndexName] = 1
    const res = await requestFunc(params)
    if (res.code === 0) {
        let data = []
        if (!res.data.hasOwnProperty(totalCountName)) {
            return console.error(`请求接口返回接口不包含${totalCountName}属性，该方法不适用`)
        }
        const pageCount = Math.ceil(res.data[totalCountName] / params[pageSizeName])
        if (pageCount < 1) {
            this.$message('未查询到数据')
            return
        }
        data = res.data[rowsName]
        if (pageCount > 1) {
            const promiseList = []
            for (let i = 2; i <= pageCount; i++) {
                params[pageIndexName] = i
                promiseList.push(requestFunc(params))
                if (promiseList.length === 5 || i === pageCount) {
                    const resList = await Promise.all(promiseList)
                    promiseList.length = 0
                    if (resList.every((r) => r.code === 0)) {
                        resList.forEach((r) => data.push(...r.data[rowsName]))
                    }
                }
            }
        }
        const theadColumns = tableColumns.filter((c) => c.visible).map((c) => c)
        try {
            const excel = await import('./clientUtil')
            excel.exportExcel({
                theadColumns,
                jsonData: data,
                filename: filename,
            })
        } catch (ex) {
            console.log('exportExcelByApi :>> ', ex)
        }
    }
}

export const setSession = (val) => {
    return new Promise((resolve, reject) => {
        sessionStorage.setItem('AgainOrderDetailInfo', JSON.stringify(val))
        resolve()
    })
}



