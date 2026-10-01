import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

/* A link that goes nowhere: href="", href="#", or the same in braces. Hrefs
   that come from data (lib/site.ts) render as placeholders when empty (D20),
   and tests/e2e/links.spec.ts checks the rendered page for both. */
const deadHref = "/^#?$/";
const deadHrefMessage =
  'A link needs a destination. Leave the data empty and render a placeholder instead (D20), not href="" or href="#".';

const config = [
  {
    ignores: ["next-env.d.ts", ".next/**", "out/**", "node_modules/**", "preview/**", "test-results/**", "playwright-report/**"],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended"),

  {
    rules: {
      "jsx-a11y/anchor-is-valid": [
        "error",
        { components: ["Link"], specialLink: ["href"], aspects: ["noHref", "invalidHref", "preferButton"] },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name='href'] > Literal[value=${deadHref}]`,
          message: deadHrefMessage,
        },
        {
          selector: `JSXAttribute[name.name='href'] > JSXExpressionContainer > Literal[value=${deadHref}]`,
          message: deadHrefMessage,
        },
        {
          selector: `JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=${deadHref}]`,
          message: deadHrefMessage,
        },
      ],
    },
  },
];

export default config;
