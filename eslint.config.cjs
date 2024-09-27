/* ESLint v9+ Flat Config */
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const eslintPluginPrettier = require("eslint-plugin-prettier");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "uploads/**",
      "**/*.js"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // No project option => rules do not require type information
        sourceType: "module"
      }
    },
    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier,
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      // Prettier formatting as warnings
      "prettier/prettier": "warn",

      // General
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" }
      ],

      // Imports
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],

      // Allow promises in Express handlers (rule requires type info, so disable here)
      "@typescript-eslint/no-misused-promises": "off",
      // Disable other type-aware rules that error without a project
      "@typescript-eslint/await-thenable": "off"
    }
  },
  // Disable rules that conflict with Prettier
  eslintConfigPrettier
];
