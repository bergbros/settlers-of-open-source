const TS_OVERRIDE = {
  files: ['**/*.ts', '**/*.tsx'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
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
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/quotes': [
      'error',
      'single',
    ],
    '@typescript-eslint/semi': [
      'error',
      'always',
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};

const TEST_OVERRIDE = {
  'files': ['**/__tests__/**'],
  'plugins': ['jest'],
  'extends': ['plugin:jest/recommended'],
  'rules': {
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
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
  'extends': ['eslint:recommended'],
  'overrides': [TS_OVERRIDE, TEST_OVERRIDE],
  'parserOptions': {
    'ecmaVersion': 12,
  },
  'globals': {
    'process': true,
  },
  'ignorePatterns': ['built/**/*.js'],
  'rules': {
    'comma-dangle': ['error', 'always-multiline'],
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    'no-trailing-spaces': 'warn',
    'no-constant-condition': 'off',
  },
};
