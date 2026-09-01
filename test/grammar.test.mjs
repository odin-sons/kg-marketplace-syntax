// Regression test for the TextMate grammar, run against the real engine
// (vscode-textmate + vscode-oniguruma - the same libraries VS Code itself
// uses, not a hand-rolled regex test). See CONTRIBUTING.md for why that
// distinction matters - two real bugs only showed up this way.
//
// Each assertion is (line index, exact token text, expected scope). A token
// must exist on that line whose text matches exactly and whose scopes
// include the expected one. Line indices are 0-based, matching fixtures/sample.cfg.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import oniguruma from "vscode-oniguruma";
import textmate from "vscode-textmate";

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("vscode-oniguruma/release/onig.wasm");

const FIXTURE_PATH = new URL("./fixtures/sample.cfg", import.meta.url);

const assertions = [
  // Quest type / title line
  { line: 2, text: "Kill", scope: "storage.type" },
  { line: 3, text: "Wolf Culling", scope: "entity.name.class" },
  { line: 11, text: "KillAndCollect", scope: "storage.type" },

  // Quest reward fields - regression: dialog-options' generic Word:-fallback
  // used to shadow these (root array ordering).
  { line: 6, text: "Item", scope: "keyword.control.quest-reward" },
  { line: 6, text: "Skill_EXP", scope: "keyword.control.quest-reward" },
  { line: 13, text: "RandomItem", scope: "keyword.control.quest-reward" },

  // Bare conditions on unlock-requirement / quest-event lines
  { line: 8, text: "QuestFinished", scope: "support.function.condition" },
  { line: 8, text: "SkillMore", scope: "support.function.condition" },
  { line: 15, text: "HasItem", scope: "support.function.condition" },

  // || operator
  { line: 15, text: "||", scope: "keyword.operator.logical.or" },

  // Quest header tag, still inside a valid section
  { line: 10, text: "Autocomplete", scope: "constant.language" },
  { line: 10, text: "[final_boss = ", scope: "entity.name.section" },

  // Dialogue fields
  { line: 20, text: "Text", scope: "keyword.control" },
  { line: 20, text: "Command", scope: "keyword.control" },
  // Regression: the first command in a Command: field has nothing but the
  // begin-match before it in the content region, so a separator-anchored
  // match (the original, buggy design) never fired here.
  { line: 20, text: "OpenUI", scope: "support.function.command" },

  { line: 22, text: "@inrange", scope: "keyword.control.trigger" },
  { line: 23, text: "!", scope: "keyword.operator.logical.not" },
  { line: 23, text: "HasQuest", scope: "support.function.condition" },
  { line: 24, text: '"Village Elder"', scope: "string.quoted.double" },

  // Quest event fields - same shadowing regression as the reward fields
  { line: 28, text: "OnAcceptQuest", scope: "keyword.control.quest-event" },
  { line: 28, text: "GiveItemWithData", scope: "support.function.command" },
  { line: 29, text: "HasAchievement", scope: "support.function.condition" },
  { line: 29, text: "GiveItem", scope: "support.function.command" },

  // Territories
  { line: 34, text: "Rectangle", scope: "storage.type.territory-shape" },
  { line: 36, text: "exp", scope: "entity.other.attribute-name" },
  { line: 36, text: "heightbounds", scope: "entity.other.attribute-name" },
  { line: 36, text: "TopLeftBottomRight", scope: "constant.language.gradient-direction" },
  { line: 37, text: "NoAttack", scope: "constant.language" },
  { line: 37, text: "NoInteractPortals", scope: "constant.language" },

  // Comments
  { line: 0, text: "# Quests", scope: "comment.line.number-sign" },
];

async function main() {
  await oniguruma.loadWASM(readFileSync(wasmPath).buffer);

  const registry = new textmate.Registry({
    onigLib: {
      createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
      createOnigString: (s) => new oniguruma.OnigString(s),
    },
    loadGrammar: async () =>
      JSON.parse(readFileSync(new URL("../syntaxes/kg-marketplace.tmLanguage.json", import.meta.url), "utf8")),
  });

  const grammar = await registry.loadGrammar("source.cfg");
  const lines = readFileSync(FIXTURE_PATH, "utf8").split(/\r?\n/);

  const tokensByLine = [];
  let ruleStack = textmate.INITIAL;
  for (const line of lines) {
    const result = grammar.tokenizeLine(line, ruleStack);
    tokensByLine.push(
      result.tokens.map((t) => ({ text: line.slice(t.startIndex, t.endIndex), scopes: t.scopes.slice(1) }))
    );
    ruleStack = result.ruleStack;
  }

  let failed = 0;
  for (const { line, text, scope } of assertions) {
    const tokens = tokensByLine[line] ?? [];
    const match = tokens.find((t) => t.text === text);
    if (!match) {
      console.error(`FAIL line ${line} ${JSON.stringify(lines[line])}: no token with text ${JSON.stringify(text)}`);
      failed++;
    } else if (!match.scopes.includes(scope)) {
      console.error(
        `FAIL line ${line} ${JSON.stringify(text)}: expected scope ${scope}, got [${match.scopes.join(", ")}]`
      );
      failed++;
    }
  }

  console.log(`${assertions.length - failed}/${assertions.length} assertions passed`);
  // process.exitCode (not process.exit()) so the WASM module's own async
  // cleanup finishes normally instead of aborting mid-teardown - the abort
  // still leaves a nonzero exit code, just with a spurious native crash
  // line in the output.
  if (failed > 0) process.exitCode = 1;
}

main();
