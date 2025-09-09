// eslint.config.js
import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "@next/next/no-img-element": "off",              // 🚫 disable <img> warnings
      "@typescript-eslint/no-explicit-any": "warn"     // 🔄 turn "any" from error → warning
    }
  }
];
