module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  globals: {
    Txplayer: true,
    YKU: true
  },
  rules: {
    indent: [2, 2, { SwitchCase: 1 }],
    'comma-style': [
      'error',
      'first',
      {
        exceptions: {
          ArrayExpression: true,
          ObjectExpression: true
        }
      }
    ],
    'arrow-parens': [1, 'as-needed'],
    'max-len': [0, { code: 100 }],
    quotes: [1, 'single'],
    semi: [2, 'never'],
    'no-floating-decimal': [2],
    'no-console': 'off',
    'no-debugger': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
