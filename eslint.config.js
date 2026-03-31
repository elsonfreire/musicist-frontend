import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "import-helpers/order-imposts": [
        "warn",
        {
          newlinesBetween: "always",
          groups: [
            "/^react/",
            "module",
            "/^@/",
            "/^hooks/",
            "/^services/",
            "/^models/",
            "/^utils/",
            "/^pages/",
            "/^components/",
            "/^design/",
            "/^state/",
            "/^common/",
            "/^assets/",
            "/^./styles/",
            "/^./components/",
            "/^./state/",
            "/^./utils/",
            ["parent", "sibling", "index"],
          ],
          alphabetize: { order: "asc", ignoreCase: false },
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
    },
  },
]);
