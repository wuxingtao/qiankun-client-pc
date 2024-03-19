import { Message } from 'element-ui'
import FormatDate from '@utils/formatDate'
import { export_json_to_excel } from './Export2Excel'

function formatJSON(keys, data) {
    return data.map(i => keys.map(j => i[j]))
}

/** 提取表头信息 */
function collectHeadProp(theads) {
    let thead = [], keys = []
    theads.forEach(({ prop, label }) => {
        keys.push(prop)
        thead.push(label)
    })
    return {
        keys,
        thead
    }
}

function excel(theads, datalist, title) {
    // 数据使用前先深拷贝一份，避免污染数据源
    datalist = JSON.parse(JSON.stringify(datalist))
    if (datalist.length === 0) {
        return Message({
            message: '没有可供导出的数据',
            type: 'warning',
            duration: 2000
        })
    }

    const { keys, thead } = collectHeadProp(theads)
    const data = datalist.map(item => {
        // 处理自定义object类型的state字段
        if (typeof item.state === 'object') {
            item.state = item.state.text
        }
        return item
    })

    const tbody = formatJSON(keys, data)
    return export_json_to_excel(thead, tbody, `${title}-${FormatDate.date(Date.now())}`)
}

export default {
    excel
}
