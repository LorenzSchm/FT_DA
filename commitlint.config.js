module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-case': [2, 'always', 'lower-case'],
    'body-max-length': [2, 'always', 100],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert'
      ]
    ]
  }
};
