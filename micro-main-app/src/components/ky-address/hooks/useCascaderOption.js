import useAddress from './useAddress'

export default function() {
  const { getDistrictChildNodesById } = useAddress()

  //通过接口查询加载当前节点的子节点
  const lazyLoad = async (node, resolve) => {
    const { value, level,label } = node

    // value 非districtId,取消请求
    if(value && label && value === label){
      resolve([])
      return
    }
    const resultNodes = await getDistrictChildNodesById(value, level)
    if (!resultNodes) {
      resolve([])
      return
    }
    let nodes = resultNodes.filter(n => n.label)
    for (let node of resultNodes.filter(n => !n.label)) {
      let tempNodes = await getDistrictChildNodesById(node.value, level)
      tempNodes = tempNodes.map(m => Object.assign({ parentOption: node }, m))
      nodes.push(...tempNodes)
    }
    resolve(nodes)
  }

  /**
   *  查找option的children
   * @param {Object} option 当前点击的option
   * @param {Array} cacheOptions 缓存选项
   * @param {Number} currentLevel 当前循环的层级
   * @return {Array} 查找到option的子选项
   */
  const getChildrenFromCacheOptions = (option, cacheOptions, currentLevel) => {
    cacheOptions = cacheOptions || []
    for (let i = 0; i < cacheOptions.length; i++) {
      const item = cacheOptions[i]
      if (currentLevel < option.level) {
        return getChildrenFromCacheOptions(option, item.children, currentLevel + 1)
      }
      if (item.value === option.value) {
        return item.children
      }
    }
  }

  return {
    lazyLoad,
    getChildrenFromCacheOptions
  }
}
