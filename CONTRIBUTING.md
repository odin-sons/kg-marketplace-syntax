# Contributing

## Local setup

```
git clone https://github.com/odin-sons/kg-marketplace-syntax.git
cd kg-marketplace-syntax
npm install
```

There's nothing to compile — the extension is just [`syntaxes/kg-marketplace.tmLanguage.json`](syntaxes/kg-marketplace.tmLanguage.json) (a TextMate grammar) and [`language-configuration.json`](language-configuration.json) (brackets, comment markers, folding).

## Building a `.vsix` locally

```
npm run package
```

This runs `vsce package` and drops `kg-marketplace-syntax-<version>.vsix` in the repo root. It's gitignored — don't commit it. Install it in VS Code via the Extensions panel's `...` menu → **Install from VSIX...**, or:

```
code --install-extension kg-marketplace-syntax-<version>.vsix
```

## Testing grammar changes

Reload the window (`Developer: Reload Window`) after installing to pick up changes, then use `Developer: Inspect Editor Tokens and Scopes` on an open `.cfg` file to see exactly which scope a given token resolved to — this is the fastest way to confirm a regex change did what you meant.

For iterating on the regexes themselves without a full package/install/reload loop each time, drive the actual TextMate engine (`vscode-textmate` + `vscode-oniguruma`, the same libraries VS Code itself uses — not a hand-rolled regex test, which won't catch TextMate-specific behavior) from a throwaway script:

```js
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import oniguruma from "vscode-oniguruma";
import textmate from "vscode-textmate";

const require = createRequire(import.meta.url);
await oniguruma.loadWASM(readFileSync(require.resolve("vscode-oniguruma/release/onig.wasm")).buffer);

const registry = new textmate.Registry({
  onigLib: {
    createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
    createOnigString: (s) => new oniguruma.OnigString(s),
  },
  loadGrammar: async () => JSON.parse(readFileSync("syntaxes/kg-marketplace.tmLanguage.json", "utf8")),
});

const grammar = await registry.loadGrammar("source.cfg");
let ruleStack = textmate.INITIAL;
for (const line of readFileSync("sample.cfg", "utf8").split(/\r?\n/)) {
  const { tokens, ruleStack: next } = grammar.tokenizeLine(line, ruleStack);
  for (const t of tokens) console.log(JSON.stringify(line.slice(t.startIndex, t.endIndex)), t.scopes.slice(1));
  ruleStack = next;
}
```

**Two non-obvious things this catches that a plain regex test won't:**

- Inside a `begin`/`end` block (e.g. the `Text:`/`Command:`/... dialogue-field patterns), only that block's own nested `patterns` array tokenizes the content — root-level `patterns` don't apply there unless you explicitly `include` them too. `^`/`$` inside a nested pattern still anchor to the *whole line*, not to where the content region starts, which trips up any pattern that assumes it starts at a line/string boundary.
- When two patterns could both start matching at the same character position, the one listed **earlier** in its `patterns` array wins — not the more specific one. A generic fallback pattern placed before a more specific one will silently steal its matches.

## Conventions

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, ...) — this is what drives the version bump and changelog on release (see below).
- Branches follow [Conventional Branch](https://conventionalbranch.org/) (`<type>/<description>`, e.g. `fix/quest-type-list`).
- Work happens on a branch, opened as a PR, merged locally (`git checkout main && git merge --ff-only <branch>` after rebasing if needed), then pushed — never `gh pr merge` or the GitHub UI's merge button, since that strips GPG signatures. **Exception:** the release-please PR described below, which is fine to merge on GitHub directly.

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please) — you don't run a release command yourself, you just write conventional commits and it turns them into a release.

Pushing conventional commits to `main` (via the normal PR flow above) feeds a standing PR, maintained by the `release-please` GitHub Action, titled something like `chore(main): release 0.1.0`. It accumulates every commit since the last release, and computes the version bump and `CHANGELOG.md` entry from those commits' types (`feat:` → minor, `fix:` → patch, a `BREAKING CHANGE:` footer → major). It updates that same PR in place on every push rather than opening a new one.

Review it like any other PR — check the version and changelog text make sense — then merge it. Unlike everywhere else in this file, merging it via the GitHub UI (or `gh pr merge`) is fine here: every commit in it is authored by `github-actions[bot]` via the GitHub API (that's what the action's default `GITHUB_TOKEN` produces), never signed with your key to begin with, and GitHub signs and marks those API-made commits Verified on its own. There's no local signature to lose.

Merging it does the rest automatically: tags `vX.Y.Z`, publishes a GitHub Release with the changelog section as its body, packages the extension, attaches the `.vsix` to the release, and publishes it to the VS Code Marketplace.

To force a specific version instead of what release-please computes (rare — e.g. deliberately jumping to `1.0.0`), add a `Release-As: 1.0.0` footer to a commit message, or edit the version directly in release-please's open PR before merging.

### One-time setup (credential handling — not something an agent should do)

`VSCE_PAT`: a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) from the `fogrew` Azure DevOps org, scoped to **Marketplace: Manage**, added as a repository secret (`Settings` → `Secrets and variables` → `Actions`). Without it, the GitHub Release and `.vsix` attachment still work (they only need the built-in `GITHUB_TOKEN`) — just the Marketplace publish step fails.

### `0.0.1` predates this process

It shipped straight to the Marketplace on 2025-10-09 with no GitHub Release or changelog entry. `.release-please-manifest.json` is seeded at `0.0.1` and a `v0.0.1` tag was created retroactively pointing at that commit, so release-please has a baseline to diff future commits against. The `[0.0.1]` entry in `CHANGELOG.md` was hand-written after the fact to document it, not generated.
