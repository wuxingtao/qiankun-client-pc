export const fontSize = res => {
  let docEl = document.documentElement
    ,clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth
  if (!clientWidth) return
  let fontSize = 100 * (clientWidth / 1920)
  return res*fontSize
}
