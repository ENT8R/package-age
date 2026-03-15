import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2025,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/semi': 1,
      '@stylistic/semi-style': 2,
      '@stylistic/semi-spacing': 1,
      '@stylistic/quotes': ['warn', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: 'never',
      }],
      '@stylistic/brace-style': 2,
      '@stylistic/indent': ['error', 2],
      '@stylistic/spaced-comment': 1,
      '@stylistic/no-multi-spaces': 1,
      '@stylistic/wrap-iife': ['error', 'inside'],
      '@stylistic/linebreak-style': 1,
      '@stylistic/template-curly-spacing': 1,

      'camelcase': 2,
      'eqeqeq': ['error', 'smart'],
      'curly': ['error', 'all'],
      'dot-notation': 2,
      'no-array-constructor': 2,
      'no-throw-literal': 2,
      'no-self-compare': 2,
      'no-useless-call': 1,
      'consistent-return': 2,
      'no-new-wrappers': 2,
      'no-script-url': 2,
      'no-console': 1,
      'no-void': 1,
      'vars-on-top': 1,
      'yoda': ['error', 'never'],
      /* 'no-warning-comments': 1, */ // should be enabled later
      'require-await': 1,
      'no-loop-func': 2,
      'no-eval': 2,
      'no-implied-eval': 2,
      'no-var': 1,
      'prefer-const': 2,
      'prefer-arrow-callback': 1,
      'prefer-rest-params': 2,
      'prefer-spread': 2,
      'prefer-template': 1,
      'symbol-description': 2,
      'object-shorthand': 1,
      'prefer-promise-reject-errors': 2,
      /* 'prefer-destructuring': 1, */ // https://github.com/eslint/eslint/issues/10250
      'no-object-constructor': 2,
    },
  }
]);
