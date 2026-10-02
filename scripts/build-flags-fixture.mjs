/**
 * Test-only: a second static export, to out-flags/, with the sections that
 * lib/site.ts switches off (features) switched on and given something to
 * show — tests/e2e/flags-fixture.json. tests/e2e/flags.spec.ts runs against
 * it to prove the sections come back. Playwright runs this before serving
 * out-flags/ (playwright.config.ts); it never touches out/.
 *
 *   node scripts/build-flags-fixture.mjs
 *
 * Shares .next/ with `npm run build`, so don't run the two at once.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/e2e/flags-fixture.json"), "utf8"));
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next", { paths: [root] });

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_TEST_OVERRIDE: JSON.stringify(fixture),
    MUGU_EXPORT_DIR: "out-flags",
  },
});
process.exit(result.status ?? 1);
