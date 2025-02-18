module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    require.resolve('@gera2ld/plaid-common-react/eslint'),
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
    react: {
      pragma: 'VM',
    },
  },
  globals: {
    VM: true,
  },
  rules:{
    'linebreak-style': ["error", "windows"],
    'no-plusplus': ["off", { "allowForLoopAfterthoughts": true }],
    'camelcase': ["off", {"properties": "never","ignoreGlobals": true,"ignoreDestructuring": true,"ignoreImports": true}],
    'no-unused-expressions': ["error", { "allowShortCircuit": true }],
    'max-classes-per-file': ["off"]
  }
};
