import dayjs from 'dayjs'

export default function({root}){
  const cacheKey = 'ADDRESS_LIST'

  const getCachAddressList = async ()=>{
    let list = await root.$native.getCacheInfo(cacheKey)
    list = list ? JSON.parse(list) : []
    return list
  }

  const removeCacheClipboardContet = async  ()=> {
    const list = await getCachAddressList()
    /** 返回一天内有效的缓存地址 */
    const validList = list.filter(item => {
      const timer = dayjs(Number(item.now)).add(1, 'd').isAfter(dayjs())
      if (timer) {
        return item
      }
    })
    await root.$native.setCacheInfo(cacheKey, JSON.stringify(validList))
  }

  const  cacheContentFilter = (content,setCacheWhenNotExist) => { 
    return new Promise(async resolve => {
      const list = await getCachAddressList()
      const exist = list.some(item => item.content === content)
      if (!exist && setCacheWhenNotExist) {
        const now = Date.now()
        list.push({ now, content })
        await root.$native.setCacheInfo(cacheKey, JSON.stringify(list))
      }
      resolve(exist)
    })
  }

  /**
   * 
   * @param {Blooen} isFromDialogClipboard 是否是读取剪切板内容并弹窗提示页
   * @returns 
   */
  const getValidtClipboardContent = async isFromDialogClipboard=>{
    if (!root.isClientMode){
      return {existInCache:false}
    }
    const content = await root.$native.getClipboardContent()
    if(!content){
      return {existInCache:false}
    }
    await removeCacheClipboardContet()
    if (!content || content.length < 11 || !['省', '市', '区'].find(f => content.includes(f))) {
      return {existInCache:false}
    }
    const existInCache = await cacheContentFilter(content,isFromDialogClipboard)
    return {
      existInCache,
      content
    }
  }

  return {
    getValidtClipboardContent
  }
}