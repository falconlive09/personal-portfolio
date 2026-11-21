import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// Flat config (ESLint 9+/10). Replaces the old .eslintrc.json with the same settings.
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
