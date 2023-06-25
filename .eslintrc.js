// Overrides for TS files
const TS_OVERRIDE = {
  files: [ '**/*.ts', '**/*.tsx' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [ './tsconfig.json' ], //, './soos-client/tsconfig.json', './soos-gamelogic/tsconfig.json', './soos-server/tsconfig.json' ],
    // eslint-disable-next-line no-undef
    tsconfigRootDir: __dirname,
  },
  plugins: [ '@typescript-eslint' ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/comma-dangle': [ 'error', 'always-multiline' ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/object-curly-spacing': [ 'error', 'always' ],
    '@typescript-eslint/quotes': [
      'error',
      'single',
    ],
    '@typescript-eslint/semi': [
      'error',
      'always',
    ],
    '@typescript-eslint/no-unused-vars': [ 'warn', {
      // Unused variables/args/caught errors that start with an underscore are fine
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
  },
};

// Overrides for test files (*.test.ts, *.test.tsx)
// Unused for now due to config difficulties
const _TEST_OVERRIDE = {
  'files': [ '**/*.test.ts', '**/*.test.tsx' ],
  'plugins': [ 'jest' ],
  'extends': [ 'plugin:jest/recommended' ],
  'rules': {
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'jest/prefer-expect-assertions': 'off',
  },
};

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
    'array-bracket-spacing': [ 'error', 'always', { 'objectsInArrays': false, 'arraysInArrays': false }],
    'brace-style': [ 'error', '1tbs' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'comma-spacing': [ 'error', { 'before': false, 'after': true }],
    'comma-style': [ 'error', 'last' ],
    'curly': [ 'error', 'all' ],
    'eol-last': [ 'error', 'always' ],
    'indent': [ 'error', 2 ],
    'linebreak-style': 'off',
    'lines-between-class-members': [ 'warn', 'always', { 'exceptAfterSingleLine': true }],
    'no-case-declarations': 'off',
    'no-constant-condition': 'off',
    'no-control-regex': 'off',
    'no-empty': 'warn',
    'no-multiple-empty-lines': [ 'error', { max: 1 }],
    'no-trailing-spaces': 'warn',
    'no-unused-vars': 'warn',
    'object-curly-spacing': [ 'error', 'always' ],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: 'var', next: 'function' },
    ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
  },
};
