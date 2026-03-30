import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import App from "./App";
import { useAppStore } from "./ui/store";
import type { OmoAdapterBridge } from "./ui/bridge";
import type { AppSnapshot } from "./integration/contracts";

const driftedSnapshot: AppSnapshot = {
  providerCatalog: {
    providerOrder: ["openai"],
    providers: {
      openai: {
        id: "openai",
        source: "official" as const,
        models: ["gpt-5.4@opencode-high"]
      }
    }
  },
  configuredProviderIds: ["openai"],
  presets: [
    {
      id: "default",
      name: "Default",
      description: "desc",
      agentModels: {
        sisyphus: "openai/gpt-5.4@opencode-high",
        hephaestus: "openai/gpt-5.4@opencode-high",
        oracle: "openai/gpt-5.4@opencode-high",
        librarian: "openai/gpt-5.4@opencode-high",
        explore: "openai/gpt-5.4@opencode-high",
        "multimodal-looker": "openai/gpt-5.4@opencode-high",
        prometheus: "openai/gpt-5.4@opencode-high",
        metis: "openai/gpt-5.4@opencode-high",
        momus: "openai/gpt-5.4@opencode-high",
        atlas: "openai/gpt-5.4@opencode-high",
        "sisyphus-junior": "openai/gpt-5.4@opencode-high"
      }
    }
  ],
  activePresetId: "default",
  drift: {
    status: "drifted" as const,
    changedAgents: ["sisyphus"]
  },
  fileModels: {
    sisyphus: "anthropic/claude-sonnet-4-5"
  },
  fileState: {
    omoExists: true
  }
};

const syncedSnapshot: AppSnapshot = {
  ...driftedSnapshot,
  lastAppliedAt: "2026-03-28T12:34:56.000Z",
  drift: {
    status: "synced" as const,
    changedAgents: []
  }
};

describe("App", () => {
  beforeEach(() => {
    useAppStore.setState({
      snapshot: null,
      selectedPresetId: null,
      draftPreset: null,
      pendingConflictAction: null,
      status: "idle",
      errorMessage: null
    });
    delete window.omoAdapter;
  });

  test("renders the preset list and bottom status bar", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Default" })).toBeInTheDocument();
    expect(screen.getByText(/active preset/i)).toBeInTheDocument();
    expect(screen.getByText(/last applied/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByTestId("action-rail")).toContainElement(
      screen.getByRole("button", { name: /settings/i })
    );
  });

  test("closes the settings menu when clicking outside and shows refresh feedback", async () => {
    window.omoAdapter = {
      loadSnapshot: async () => syncedSnapshot,
      refreshProviderCatalog: async () => syncedSnapshot,
      savePreset: async () => syncedSnapshot,
      createPreset: async () => syncedSnapshot,
      duplicatePreset: async () => syncedSnapshot,
      deletePreset: async () => syncedSnapshot,
      movePreset: async () => syncedSnapshot,
      setActivePreset: async () => syncedSnapshot,
      applyActivePreset: async () => syncedSnapshot,
      importFileToActivePreset: async () => syncedSnapshot,
      onConfigChanged: () => () => {}
    } satisfies OmoAdapterBridge;

    render(<App />);

    fireEvent.click((await screen.findAllByRole("button", { name: /settings/i }))[0]);
    expect(screen.getByRole("button", { name: /refresh model catalog/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByRole("button", { name: /refresh model catalog/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /settings/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /refresh model catalog/i }));

    expect(await screen.findByText(/catalog refreshed/i)).toBeInTheDocument();
  });

  test("shows drift only after saving edits to the active preset", async () => {
    window.omoAdapter = {
      loadSnapshot: async () => driftedSnapshot,
      refreshProviderCatalog: async () => driftedSnapshot,
      savePreset: async () => driftedSnapshot,
      createPreset: async () => driftedSnapshot,
      duplicatePreset: async () => driftedSnapshot,
      deletePreset: async () => driftedSnapshot,
      movePreset: async () => driftedSnapshot,
      setActivePreset: async () => driftedSnapshot,
      applyActivePreset: async () => driftedSnapshot,
      importFileToActivePreset: async () => driftedSnapshot,
      onConfigChanged: () => () => {}
    } satisfies OmoAdapterBridge;

    render(<App />);

    expect(
      screen.queryByText(/current OMO file differs from the active preset/i)
    ).not.toBeInTheDocument();

    fireEvent.change((await screen.findAllByDisplayValue("Default"))[0], {
      target: { value: "Default Revised" }
    });
    fireEvent.click(screen.getAllByRole("button", { name: /save preset/i })[0]);

    expect(
      (
        await screen.findAllByText(/current OMO file differs from the active preset/i)
      ).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 agent changed/i).length).toBeGreaterThan(0);
  });

  test("refreshes when the bridge emits a config change event", async () => {
    let currentSnapshot = syncedSnapshot;
    let onConfigChanged: (() => void) | undefined;

    window.omoAdapter = {
      loadSnapshot: async () => currentSnapshot,
      refreshProviderCatalog: async () => currentSnapshot,
      savePreset: async () => currentSnapshot,
      createPreset: async () => currentSnapshot,
      duplicatePreset: async () => currentSnapshot,
      deletePreset: async () => currentSnapshot,
      movePreset: async () => currentSnapshot,
      setActivePreset: async () => currentSnapshot,
      applyActivePreset: async () => currentSnapshot,
      importFileToActivePreset: async () => currentSnapshot,
      onConfigChanged: (listener) => {
        onConfigChanged = listener;
        return () => {
          onConfigChanged = undefined;
        };
      }
    } satisfies OmoAdapterBridge;

    render(<App />);
    expect((await screen.findAllByText(/active preset/i)).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/current OMO file differs from the active preset/i)
    ).not.toBeInTheDocument();

    currentSnapshot = driftedSnapshot;

    onConfigChanged?.();

    expect(
      screen.queryByText(/current OMO file differs from the active preset/i)
    ).not.toBeInTheDocument();
  });
});
