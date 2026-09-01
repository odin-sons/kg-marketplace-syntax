# Changelog

## [0.1.0](https://github.com/odin-sons/kg-marketplace-syntax/compare/kg-marketplace-syntax-v0.0.1...kg-marketplace-syntax-v0.1.0) (2026-09-01)


### Features

* rewrite syntax grammar to match the mod's current config format ([3eec89e](https://github.com/odin-sons/kg-marketplace-syntax/commit/3eec89e8709c0597b0b728f75c911b7b30613c6e))


### Bug Fixes

* correct invalid JSON escape in folding markers ([7ea71f9](https://github.com/odin-sons/kg-marketplace-syntax/commit/7ea71f99041a7d63d818e006716390c7f103ba99))
* quest-title highlighting via begin/end instead of a cross-line lookbehind ([3d4408b](https://github.com/odin-sons/kg-marketplace-syntax/commit/3d4408b7efb0edc206fcf3dc81cdec21afd54a32))

## [0.0.1](https://github.com/odin-sons/kg-marketplace-syntax/releases/tag/v0.0.1) (2025-10-09)

Initial release, published directly to the VS Code Marketplace without a GitHub Release. Syntax highlighting for comments, `[Section]` headers, quest types, dialogue fields (`Text:`, `Transition:`, `Command:`, ...), `<color>`/`<b>`/`<i>`/`<size>`/`<image>` formatting tags, `%variable%` placeholders, numbers/coordinates, and territory flags.
