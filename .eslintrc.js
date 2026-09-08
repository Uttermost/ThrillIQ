// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  // web-admin/ is a separate Next.js project with its own dependencies —
  // not installed at the repo root, so this config can't resolve its
  // imports and shouldn't try to lint it.
  ignorePatterns: ['web-admin/'],
};
