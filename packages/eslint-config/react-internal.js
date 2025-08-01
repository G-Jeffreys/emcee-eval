import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import { configWithTypeChecking } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React with TypeScript type checking.
 *
 * @param {string} tsconfigPath - Path to tsconfig.json
 * @param {string} tsconfigRootDir - Root directory for tsconfig
 * @type {function(string, string): import("eslint").Linter.Config[]}
 */
export default (tsconfigPath = "./tsconfig.json", tsconfigRootDir = import.meta.dirname) => [
  ...configWithTypeChecking(tsconfigPath, tsconfigRootDir),
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**", "build/**", "coverage/**", "vite.config.ts", "vitest.config.ts"],
  },
];
