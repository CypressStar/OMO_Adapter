import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PresetEditor } from "./preset-editor";

describe("PresetEditor", () => {
  test("surfaces unsupported model references instead of hiding them", () => {
    render(
      <PresetEditor
        providerCatalog={{
          providerOrder: ["openai"],
          providers: {
            openai: {
              id: "openai",
              source: "official",
              models: ["gpt-5.4@opencode-high"]
            }
          }
        }}
        draftPreset={{
          id: "default",
          name: "Default",
          description: "desc",
          agentModels: {
            sisyphus: "openai/gpt-legacy",
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
        }}
        drift={null}
        showDriftWarning={false}
        canApply
        onChange={vi.fn()}
        onSave={vi.fn()}
        onApply={vi.fn()}
        onReapply={vi.fn()}
        onImport={vi.fn()}
      />
    );

    expect(screen.getByText(/unsupported model/i)).toBeInTheDocument();
    expect(screen.getAllByText(/gpt-legacy/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /import from file/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^apply$/i })).toBeInTheDocument();
  });
});
