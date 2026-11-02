// One lint setup for the whole repo: the package, the showcase and the docs site.
// Catches real bugs (undefined names, unused code), broken hook rules and accessibility mistakes.
// Run it with `pnpm lint`; CI runs it on every pull request and push to main.
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: [
      "**/node_modules/**", "**/dist/**", "**/out/**", "**/.next/**", "**/.turbo/**", "**/build/**",
      // generated data
      "packages/design-system/src/core/country-names.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    settings: { react: { version: "19" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/prop-types": "off", // plain JavaScript; props are documented in the docs
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": ["error", { args: "none", ignoreRestSiblings: true, caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }], // try { localStorage… } catch {} is deliberate
      // Dialogs, menus and search fields move focus in when they open, as WAI-ARIA recommends
      "jsx-a11y/no-autofocus": "off",
      // Scrolling regions (a chat log, a code block) take focus so they can be scrolled with the keyboard
      "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["pre"], roles: ["tabpanel", "log", "region"] }],
    },
  },
  // Build scripts and config files run in Node
  {
    files: ["**/scripts/**", "**/*.config.{js,mjs}", "tokens/**", "apps/docs/app/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  // The showcase service worker
  { files: ["apps/showcase/public/sw.js"], languageOptions: { globals: { ...globals.serviceworker } } },
];
