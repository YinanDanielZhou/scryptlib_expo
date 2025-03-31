/* eslint-env node */
module.exports = {
    "env": {
        "react-native": true,
        "es2021": true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {

        "@typescript-eslint/no-explicit-any": ["off"]
    },
    ignorePatterns: ["patches/**/*", "test/**/*"],
    root: true,
};