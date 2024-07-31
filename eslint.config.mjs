import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest"


export default [
  { languageOptions: { sourceType: 'commonjs', globals: { ...globals.browser, ...globals.node, ...globals.jest } } },
  pluginJs.configs.recommended,
  { files: ["src/__tests__/*.js"], plugins: { jest: jest } }
];
