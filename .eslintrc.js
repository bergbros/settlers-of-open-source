// Overrides for TS files
const TS_OVERRIDE = {
  files: [ '**/*.ts', '**/*.tsx' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true, //[ './tsconfig.json' ], //, './soos-client/tsconfig.json', './soos-gamelogic/tsconfig.json', './soos-server/tsconfig.json' ],
    // eslint-disable-next-line no-undef
    tsconfigRootDir: __dirname,
  },
  plugins: [ '@typescript-eslint' ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // pls keep rules list in alphabetical order
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/comma-dangle': [ 'warn', 'always-multiline' ],
    '@typescript-eslint/explicit-member-accessibility': [ 'warn', { accessibility: 'no-public' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': [ 'warn', {
      // Unused variables/args/caught errors that start with an underscore are fine
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/object-curly-spacing': [ 'warn', 'always' ],
    '@typescript-eslint/quotes': [ 'warn', 'single' ],
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/semi': [ 'warn', 'always' ],
  },
};

// // Overrides for test files (*.test.ts, *.test.tsx)
// // Unused for now due to config difficulties
// const _TEST_OVERRIDE = {
//   'files': [ '**/*.test.ts', '**/*.test.tsx' ],
//   'plugins': [ 'jest' ],
//   'extends': [ 'plugin:jest/recommended' ],
//   'rules': {
//     '@typescript-eslint/no-unsafe-return': 'off',
//     '@typescript-eslint/unbound-method': 'off',
//     'jest/prefer-expect-assertions': 'off',
//   },
// };

module.exports = {
  'env': {
    'browser': false,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [ 'eslint:recommended' ],
  'overrides': [ TS_OVERRIDE ], //, TEST_OVERRIDE ],
  'parserOptions': {
    'ecmaVersion': 12,
  },
  'globals': {
    'process': true,
  },
  'ignorePatterns': [ 'built/**/*.js' ],
  'rules': {
    // pls keep rules list in alphabetical order
    'array-bracket-spacing': [ 'warn', 'always', { 'objectsInArrays': false, 'arraysInArrays': false }],
    'brace-style': [ 'warn', '1tbs' ],
    'comma-dangle': [ 'warn', 'always-multiline' ],
    'comma-spacing': [ 'warn', { 'before': false, 'after': true }],
    'comma-style': [ 'warn', 'last' ],
    'curly': [ 'warn', 'all' ],
    'eol-last': [ 'warn', 'always' ],
    'indent': [ 'warn', 2 ],
    'linebreak-style': 'off',
    'lines-between-class-members': [ 'warn', 'always', { 'exceptAfterSingleLine': true }],
    'no-case-declarations': 'off',
    'no-constant-condition': 'off',
    'no-control-regex': 'off',
    'no-empty': 'warn',
    'no-multiple-empty-lines': [ 'warn', { max: 1 }],
    'no-trailing-spaces': 'warn',
    'no-unused-vars': 'warn',
    'object-curly-spacing': [ 'warn', 'always' ],
    'padding-line-between-statements': [ 'warn', { blankLine: 'always', prev: 'var', next: 'function' }],
    'quotes': [ 'warn', 'single' ],
    'semi': [ 'warn', 'always' ],
  },
};
