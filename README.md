# OMO_Adapter

[简体中文](./README_CN.md)

`OMO_Adapter` is a local desktop utility for managing and switching model presets for the 11 official agents used by `oh-my-openagent` / `oh-my-opencode` in OpenCode.

It is built for one job: stop editing agent model mappings by hand every time you want to switch providers or rebalance models across agents.

## What It Does

- Reads available provider and model choices from OpenCode's local configuration
- Distinguishes official provider models and custom providers from `opencode.json`
- Manages multiple reusable agent presets
- Applies the selected preset to the local OMO config files
- Detects drift when the active file was changed outside the tool
- Preserves unrelated config content instead of rewriting the whole file blindly

## Core Workflow

`OMO_Adapter` is designed around a simple local workflow:

1. Load the available provider and model catalog
2. Edit or duplicate a preset for the official agent set
3. Activate a preset to write it into the active OMO config
4. Re-apply or import when manual edits cause drift

The tool does not restart OpenCode for you. If a new agent mapping requires OpenCode to restart, that remains a manual user action.

## Official Agent Coverage

`OMO_Adapter` only manages the official OMO agent set:

1. `Sisyphus`
2. `Hephaestus`
3. `Oracle`
4. `Librarian`
5. `Explore`
6. `Multimodal-Looker`
7. `Prometheus`
8. `Metis`
9. `Momus`
10. `Atlas`
11. `Sisyphus-Junior`

Custom or extra agent entries that already exist in the target config are not exposed in the UI.

## Config Files

OpenCode provider source:

```text
~/.config/opencode/opencode.json
```

OMO target files written by the tool:

```text
~/.config/opencode/oh-my-opencode.json
~/.config/opencode/oh-my-opencode.jsonc
```

`OMO_Adapter` reads provider information from `opencode.json`, then writes the selected official agent mapping to both OMO target files.

## Safety Rules

- Only the official 11 agents are managed by the tool
- Mixed provider assignment is supported inside a single preset
- Drift is surfaced instead of silently overwritten
- Missing target files are created automatically when needed
- Unrelated sections such as `hooks`, `mcp`, and non-managed custom entries are preserved

## Scope

In scope:

- Local preset management for official OMO agents
- Local provider/model detection
- Local file write-back and drift handling
- Windows-first desktop usage with room for future cross-platform expansion

Out of scope:

- Managing custom agent definitions
- Editing provider credentials
- Acting as a general OpenCode config editor
- Restarting OpenCode automatically

## References

- [OpenCode Config Docs](https://opencode.ai/docs/config/)
- [OpenCode Models Docs](https://opencode.ai/docs/models/)
- [OpenCode Providers Docs](https://opencode.ai/docs/providers/)
- [oh-my-openagent Features Reference](https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/docs/reference/features.md)
- [AI SDK Providers](https://ai-sdk.dev/providers)
- [Models.dev](https://models.dev/)
