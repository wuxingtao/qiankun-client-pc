const chalk = require('chalk')
const path = require('path')
const tryRequire = require('try-require')

console.log(chalk.cyan(`Mock已启用, 请参考mock目录内使用说明`))

module.exports = function (app) {
  app.post('/router/rest', (req, res, next) => {
    const method = req.headers.method
    const mockPath = path.join(__dirname, `./${method}.js`)
    try {
      const maybePath = tryRequire.resolve(mockPath)
      if (maybePath) {
        delete require.cache[maybePath]
        const data = require(maybePath)
        if (data && data.enable) {
          console.log(chalk.cyan(`Mock: ${method}`))
          res.json(data.data)
        } else {
          next()
        }
      } else {
        next()
      }
    } catch (e) {
      console.error('[Mock]: ', e)
      next()
    }
  })
}
