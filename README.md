# KG Marketplace Syntax Highlighting

[![Test grammar](https://github.com/odin-sons/kg-marketplace-syntax/actions/workflows/test.yml/badge.svg)](https://github.com/odin-sons/kg-marketplace-syntax/actions/workflows/test.yml)

A Visual Studio Code extension that adds syntax highlighting for `.cfg` configuration files of the [**KG's Valheim Marketplace**](https://kg.sayless.eu/marketplace/#Start%20Page).

## Description

This extension makes it easier to read and edit configuration files used in KG Marketplace by highlighting various syntax elements such as quest types, sections, comments, variables, and special tags.

## Key Features

- **Comments**: Lines starting with `#` are highlighted as comments.
- **Profiles**: Section headers enclosed in square brackets (e.g., `[Trader]`) are highlighted for better file navigation.
- **Quest Types**: Recognizes and highlights main quest types such as `Talk`, `Kill`, `Collect`, `Craft`, and others.
- **Dialogue Options**: Keywords in dialogues such as `Text:`, `Transition:`, `Command:`, `Icon:`, `Condition:`, and others are highlighted for clarity.
- **Formatting Tags**:
    - **Color**: `<color=#RRGGBB>...</color>`
    - **Bold**: `<b>...</b>`
    - **Italic**: `<i>...</i>`
    - **Font Size**: `<size=NUMBER>...</size>`
    - **Images**: `<image=path/to/image>`
- **Variables**: Variables enclosed in percent signs (e.g., `%player_name%`) are highlighted.
- **Numbers and Coordinates**: Numeric values and coordinates in `X, Y, Z` format are highlighted.
- **Territory Flags**: Special flags such as `Circle`, `PvpOnly`, `NoBuild`, and others are recognized and highlighted.

## Installation

1.  Open Visual Studio Code.
2.  Go to the **Extensions** section (Ctrl+Shift+X).
3.  Search for "KG Marketplace Syntax" in the Marketplace.
4.  Click **Install**.

Alternatively, you can install it from a file by packaging it with `npx @vscode/vsce package` and installing it via `Install from VSIX...`. See [CONTRIBUTING.md](CONTRIBUTING.md) for a full local build setup.

## Usage

After installation, the extension is automatically activated for all files with the `.cfg` extension. Just open any such file, and you will see the syntax highlighting.

---

**Enjoy!**
