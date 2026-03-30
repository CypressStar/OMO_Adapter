# OMO_Adapter

`OMO_Adapter` is a lightweight Windows-first desktop utility for managing and switching model configurations for the official agents in the `oh-my-openagent` / `oh-my-opencode` plugin used by OpenCode.

This project focuses on one job only: making it fast and safe to maintain multiple Agent model presets and write the selected preset into `oh-my-opencode.json` without manually editing JSON every time.

## Quick Start

### Prerequisites

- Node.js 20+
- `opencode` available in `PATH` if you want the app to read the current official model list from the local CLI

### Run In Desktop Dev Mode

```bash
npm install
npm run dev:desktop
```

Development note:

- `build started...` may appear twice in dev mode because Electron `preload` and `main` are built separately.
- On Windows, the custom dev launcher now ignores the harmless `taskkill` "process not found" case during Electron hot restarts, so that message should no longer abort the dev session.

### Build And Launch The Desktop App

```bash
npm start
```

The desktop launch command builds the renderer and Electron entry first, then opens the local desktop shell.

## Overview

OpenCode users may configure multiple model providers in their local OpenCode config, and `oh-my-openagent` allows each official Agent to use a different model. When the number of providers and models grows, editing the Agent mapping by hand becomes slow and error-prone.

`OMO_Adapter` is intended to solve that problem with a local desktop UI that:

- Reads available provider/model choices from OpenCode's official model ecosystem and the user's local `opencode.json`
- Manages multiple reusable Agent model presets
- Applies the selected preset by writing to `oh-my-opencode.json`
- Detects when the file was manually edited outside the tool and warns about configuration drift

## Goals

- Provide a fast visual workflow for switching `omo` Agent model configurations
- Support multiple reusable presets instead of a single static config
- Keep the tool lightweight and local-first
- Preserve user control by never restarting OpenCode automatically
- Stay aligned with the official `oh-my-openagent` Agent definitions

## Non-Goals

- Managing custom non-official Agents in the UI
- Restarting or reloading OpenCode automatically
- Replacing OpenCode's own provider management
- Acting as a general-purpose OpenCode configuration editor

## Scope

### In Scope

- Desktop GUI for Windows
- Preset management for the official 11 `oh-my-openagent` Agents
- Reading provider/model options from:
  - OpenCode official provider/model capabilities
  - User-defined providers in `~/.config/opencode/opencode.json`
- Writing the selected preset into `~/.config/opencode/oh-my-opencode.json`
- Creating `~/.config/opencode/oh-my-opencode.json` if it does not exist
- Detecting drift when the target file is manually changed outside `OMO_Adapter`
- Distinguishing model sources in the UI

### Out of Scope

- Editing custom Agent definitions
- Editing provider credentials
- Editing unrelated `oh-my-opencode.json` sections such as `hooks`, `mcp`, or migrations
- Cloud sync, account system, or remote storage

## Official Agent Coverage

`OMO_Adapter` will strictly target the official Agent set defined by the upstream documentation.

Supported official Agents:

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

If extra custom Agents exist in the user's `oh-my-opencode.json`, the tool will not expose them in the UI. They should be preserved during write-back so the tool does not destroy unrelated user data.

## Core Features

### 1. Available Model Detection

The tool detects available model choices from two sources:

- OpenCode official provider/model ecosystem
- User-configured providers in `opencode.json`

The UI should distinguish these sources clearly so the user knows whether a model comes from:

- Official OpenCode support
- Local custom provider configuration

Both sources may be mixed freely within the same preset. Different Agents in one preset may point to different providers, including a mix of official providers and user-defined custom providers.

### 2. Preset Management

The tool maintains multiple Agent presets.

Each preset contains:

- Preset name
- Preset description
- Model mapping for the official 11 Agents

Default behavior:

- A built-in `default` preset exists on first launch
- Presets support `Activate`, `Edit`, `Duplicate`, and `Delete`
- The currently active preset is visually highlighted
- A bottom status bar shows which preset is currently active

### 3. Agent Model Selection

Each Agent entry in a preset displays:

- Agent name
- Agent description
- A cascaded model selector

Selector behavior:

- First level: provider
- Second level: model list under the selected provider
- Final stored value format: `provider/model`
- Mixed provider assignment is supported within the same preset

### 4. Drift Detection

If the user manually edits `oh-my-opencode.json` and the file no longer matches the preset marked as active in `OMO_Adapter`, the tool must show a clear mismatch warning.

Supported recovery actions:

- Import current file content into the active preset
- Reapply the active preset to the file

The tool must not silently overwrite drifted changes.

## UX Design

### Main Layout

- Left panel: preset list
- Right panel: preset detail editor
- Bottom bar: active preset and file state

### Preset List

Each preset item shows:

- Preset name
- Short description
- Active state
- Quick actions: activate, edit, duplicate, delete

The active preset should use a clear accent style.

### Preset Detail View

The detail view shows:

- Preset name
- Preset description
- Official Agent list in fixed order
- Per-Agent provider/model selector

### Status Bar

The bottom status bar should display concise runtime information such as:

- Current active preset
- Target file path state
- Drift state
- Last applied time

### Suggested States

- `Synced`
- `Drifted`
- `File Missing`
- `Invalid JSON`
- `Unsupported Model Reference`

## Configuration Sources

### Source A: OpenCode Config

Primary local config path:

```text
~/.config/opencode/opencode.json
```

Used for:

- User-defined providers
- User-defined model lists under those providers

### Source B: OMO Config

Primary target file path:

```text
~/.config/opencode/oh-my-opencode.json
```

Used for:

- Reading current Agent model assignments
- Applying the selected preset
- Detecting external manual modifications
- Creating the file if it is missing

### Source Classification

The model selector should visually distinguish:

- `Official`
- `Custom from opencode.json`

## Data Model

### Internal Preset Record

```json
{
  "id": "default",
  "name": "Default",
  "description": "Official default agent model mapping",
  "agentModels": {
    "sisyphus": "openai/gpt-5.4@opencode-high",
    "hephaestus": "openai/gpt-5.4@opencode-high"
  },
  "createdAt": "2026-03-28T00:00:00.000Z",
  "updatedAt": "2026-03-28T00:00:00.000Z"
}
```

### Internal Runtime State

Suggested runtime state:

- Available providers and models
- Preset collection
- Active preset id
- Last applied file fingerprint
- Drift status
- File parse status

## Write Strategy

Write behavior must be conservative.

Rules:

- Only update the `model` field of the official 11 Agents
- Preserve unrelated top-level sections such as `hooks`, `mcp`, and `_migrations`
- Preserve custom Agent entries that are outside the official 11-Agent scope
- Create `oh-my-opencode.json` with the required baseline structure if the file does not exist
- Use safe write flow: generate content, validate JSON, write temp file, replace target file

This avoids corrupting the user's existing `oh-my-opencode.json`.

## Drift Detection Design

Drift should be detected by comparing:

- The currently active preset in `OMO_Adapter`
- The actual model mapping currently stored in `oh-my-opencode.json`

Drift scenarios:

- User manually changed one or more Agent models in the file
- File was changed by another tool
- File references models no longer available in the current provider list

Recommended comparison unit:

- Only compare the official 11 Agents
- Ignore custom Agents for mismatch calculation

## Technical Stack

### Recommended Choice

- Desktop framework: `Tauri 2`
- Frontend language: `TypeScript`
- UI framework: `React`
- Build tool: `Vite`
- State management: `Zustand`
- Schema validation: `Zod`

### Why Tauri

- Lightweight compared with Electron
- Good fit for a small local configuration utility
- Strong Windows support
- Easier to keep the package size and memory usage low
- Leaves room for future macOS/Linux support

### Why TypeScript

- Fast UI iteration
- Strong typing for config structures
- Good ecosystem for desktop frontends
- Easy to maintain clear data contracts between UI and local file operations

## Architecture

### High-Level Modules

1. `config-source`
   - Reads OpenCode and OMO config files
   - Extracts available providers/models
   - Normalizes official Agent mappings

2. `preset-store`
   - Stores local presets
   - Tracks active preset
   - Handles duplicate/delete/update actions

3. `drift-detector`
   - Compares active preset with current target file
   - Produces sync status and conflict actions

4. `writer`
   - Applies the selected preset to `oh-my-opencode.json`
   - Preserves unrelated file content
   - Uses safe atomic write flow

5. `ui`
   - Preset list
   - Preset editor
   - Status bar
   - Conflict prompts

## Platform Strategy

The first release targets Windows, but the architecture should isolate OS-specific file path resolution so future cross-platform support is possible.

Suggested path strategy:

- Windows: use known default config paths
- Future macOS/Linux: inject a platform path resolver instead of hardcoding Windows paths everywhere

## Validation Rules

- A preset must always contain mappings for all 11 official Agents
- A model value must match the format `provider/model`
- The selected model must exist in the current available provider/model map
- If a model becomes unavailable, the UI should surface it instead of silently removing it
- Invalid JSON in external config files should produce a clear error state

## Error Handling

The tool should explicitly handle:

- Missing `opencode.json`
- Missing `oh-my-opencode.json`
- Auto-create `oh-my-opencode.json` when it is missing and the user applies a preset
- Invalid JSON in either file
- Missing provider in current config
- Missing model in current provider
- File permission failure during write
- Drift detected before write

## Milestones

### Phase 1

- Scaffold desktop app
- Read both config files
- Parse official and custom provider/model lists
- Show a single built-in `default` preset

### Phase 2

- Add preset CRUD
- Add active preset state
- Add write-back to `oh-my-opencode.json`

### Phase 3

- Add drift detection
- Add import/reapply conflict actions
- Add status bar and validation states

### Phase 4

- Polish UX
- Add path abstraction for future cross-platform support
- Add packaging for Windows distribution

## Risks and Decisions

### Key Decisions

- Only official 11 Agents are managed in the UI
- Custom Agents are preserved but not edited
- OpenCode is never restarted by the tool
- Manual providers remain owned by `opencode.json`

### Main Risks

- Upstream `oh-my-openagent` may change the official Agent list in the future
- OpenCode provider/model metadata sources may evolve
- Users may expect unsupported custom Agent editing if the file already contains them

## References

- [OpenCode Config Docs](https://opencode.ai/docs/config/)
- [OpenCode Models Docs](https://opencode.ai/docs/models/)
- [OpenCode Providers Docs](https://opencode.ai/docs/providers/)
- [oh-my-openagent Features Reference](https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/docs/reference/features.md)
- [AI SDK Providers](https://ai-sdk.dev/providers)
- [Models.dev](https://models.dev/)

## Current Status

This repository currently contains the product definition and technical design for `OMO_Adapter`.

Implementation has started.

Current implementation note:

- The approved design recommends `Tauri 2` for the long-term desktop shell.
- The first working bootstrap in this repository currently uses an `Electron + React + Vite` shell because the local development environment did not have the Rust/MSVC toolchain required to start `Tauri` work immediately.
- Core config logic is kept in shell-agnostic TypeScript modules so the desktop shell can still be migrated later without rewriting the domain layer.
- The Windows dev workflow uses a custom Electron launcher to avoid false restart failures when the previous Electron PID has already exited before `taskkill` runs.
