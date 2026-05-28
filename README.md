# dd-trace esbuild plugin ESM reproduction

Minimal reproduction for [DataDog/dd-trace-js#8680](https://github.com/DataDog/dd-trace-js/issues/8680).

When using the dd-trace esbuild plugin with `format: "esm"` and `minify: true`, the bundled output crashes at startup:

```
ReferenceError: arguments is not defined
```

## Reproduce

```sh
npm install
npm run repro   # builds with esbuild, then runs the output
```

### Expected

The program prints `Command: function`.

### Actual

```
ReferenceError: arguments is not defined
```

## Test matrix

Run `node test-matrix.mjs` to test all four combinations:

| format | minify | result |
|--------|--------|--------|
| cjs    | false  | OK     |
| cjs    | true   | OK     |
| esm    | false  | OK     |
| **esm**| **true**| **CRASH: `ReferenceError: arguments is not defined`** |

Only `format: "esm"` + `minify: true` triggers the crash.

## Root cause

In `packages/datadog-esbuild/index.js`, the `onLoad` handler wraps instrumented CJS modules with:

```js
(function() {
  ${fileCode}
})(...arguments);
```

The CJS/ESM decision is based on the **source file** (`isESMFile` checks file extension and `package.json` `"type"` field), not the **output format**.

Without `minify`, esbuild's `__commonJS` wrapper accidentally provides a function scope where `arguments` is available. With `minify: true`, esbuild inlines and restructures the CJS wrappers, exposing the `arguments` reference at ESM top-level — causing the crash.

`isESMBuild()` (line 65) correctly detects ESM output but is only used for the banner — never in the `onLoad` wrapping logic.

## Workaround

Use `format: "cjs"` — the `(function(){...})(...arguments)` wrapper is valid CJS.

## Versions

- dd-trace: 5.98.0 (also confirmed on master / 5.104.0)
- esbuild: 0.25.4
- Node.js: 24
