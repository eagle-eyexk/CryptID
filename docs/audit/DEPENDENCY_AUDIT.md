# Dependency Audit

- **Scan date:** 2026-11-04
- **Scanner:** OSV dependency audit
- **Manifest:** `package.json` and lockfile
- **Result:** 0 critical, 17 high, 12 moderate, 4 low advisory records. Counts are advisory records, not unique vulnerable packages.

## High findings

| Package version(s) reported | High records | Scanner-provided fixed version | Notes |
| --- | ---: | --- | --- |
| `body-parser` 2.3.0 | 1 | 2.4.0 | Current package override pins the reported version. |
| `decode-uri-component` 0.5.0 | 1 | 0.5.1 | Current package override pins the reported version. |
| `drizzle-orm` 0.39.3 | 1 | 0.45.2 | Review ORM query/data handling and compatibility before update. |
| `image-size` 1.2.1 | 2 | 2.0.3 | Major-version change; currently associated with dormant integration scaffolding. |
| `node-forge` 1.4.0 | 6 | 1.4.1 (reported for most records) | Current package override pins the reported version; confirm each advisory’s fix and dependency path. |
| `undici` 6.28.1 | 3 | 6.29.1 | Current package override pins the reported version. |
| `uuid` 3.4.0 and 7.0.3 | 2 | 11.1.1 | Major-version change; trace consumers before changing. |
| `zod` 3.25.76 | 1 | 4.6.6 | Major-version change; validate all schemas and integration code. |

The corresponding high advisory identifiers reported were:

- `body-parser`: GHSA-27r3-jxmh-p828
- `decode-uri-component`: GHSA-qr28-fpjm-wq7f
- `drizzle-orm`: GHSA-gpj5-g38j-94v9
- `image-size`: GHSA-5p2g-fcmc-qvqq, GHSA-w3rx-r6r6-pgpr
- `node-forge`: GHSA-5x38-2vff-x55p, GHSA-7wch-p9px-956x, GHSA-86w9-cpqp-85rv, GHSA-8hrf-8g6f-7xwp, GHSA-hqq3-7jhf-c5jx, GHSA-jc66-7q78-782g
- `undici`: GHSA-2m5v-pch6-74hx, GHSA-qrxm-fqhp-jwvm, GHSA-xjj6-f33q-929c
- `uuid`: GHSA-w5hq-g745-h8pq (reported against two installed major versions)
- `zod`: GHSA-mrhx-c7xc-m3w5

## Other findings

- **Moderate (12):** `brace-expansion`, `deepmerge`, `esbuild`, `glob`, `minimatch`, `qs`, and `undici`.
- **Low (4):** `@babel/core` and `node-forge`.
- SAST reported 0 findings; HoundDog reported 0 findings in the same audit run. See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for limits and product risks not covered by package scanning.

## Remediation approach

1. Preserve the lockfile and record the current scan as the baseline.
2. Trace each affected package to direct or transitive consumers. Resolve vulnerable overrides first; changing a direct package alone may not change the installed tree.
3. Apply compatible, non-major fixes in one small change set. Do not use a blanket `npm audit fix --force`.
4. Evaluate major upgrades (`image-size`, `uuid`, and `zod`) separately, including any generated integration consumers.
5. Run lint, TypeScript, server build, web build, and focused tests after each coherent update. Rerun all three security scanners and record any accepted exception with owner, scope, and expiry.
6. Do not activate dormant integration routes as part of dependency remediation.

This report records the scanner output at the baseline date. Re-run the audit before implementation or release because advisory and fixed-version data changes over time.
