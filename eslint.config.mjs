import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "quotes": "off",
      "semi": "off",
      "indent": "off",
      "comma-dangle": "off",
      "react/react-in-jsx-scope": "off",
      "no-multiple-empty-lines": "off",
      "no-trailing-spaces": "off"
    }
  }
];

export default eslintConfig;
