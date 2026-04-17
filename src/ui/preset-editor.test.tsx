import { fireEvent, render, screen } from "@testing-library/react";
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
          },
          agentReasoningEfforts: {}
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

  test("changing reasoning to medium clears the stored override", () => {
    const onChange = vi.fn();

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
          },
          agentReasoningEfforts: {
            hephaestus: "high"
          }
        }}
        drift={null}
        showDriftWarning={false}
        canApply
        onChange={onChange}
        onSave={vi.fn()}
        onApply={vi.fn()}
        onReapply={vi.fn()}
        onImport={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Hephaestus Reasoning"), {
      target: { value: "medium" }
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        agentReasoningEfforts: {}
      })
    );
  });

  test("reasoning selector only exposes the four supported Codex levels", () => {
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
          },
          agentReasoningEfforts: {}
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

    const reasoningSelect = screen.getByLabelText("Hephaestus Reasoning");

    expect(screen.getAllByRole("option", { name: "medium (default)" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "low" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "high" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "xhigh" }).length).toBeGreaterThan(0);
    expect(reasoningSelect).not.toHaveTextContent("none");
    expect(reasoningSelect).not.toHaveTextContent("minimal");
  });

  test("shows custom provider display names but keeps raw provider ids for selection", () => {
    const onChange = vi.fn();

    render(
      <PresetEditor
        providerCatalog={{
          providerOrder: ["cch"],
          providers: {
            cch: {
              id: "cch",
              label: "oai",
              source: "custom",
              models: ["gpt-5.4"]
            }
          }
        }}
        draftPreset={{
          id: "default",
          name: "Default",
          description: "desc",
          agentModels: {
            sisyphus: "cch/gpt-5.4",
            hephaestus: "cch/gpt-5.4",
            oracle: "cch/gpt-5.4",
            librarian: "cch/gpt-5.4",
            explore: "cch/gpt-5.4",
            "multimodal-looker": "cch/gpt-5.4",
            prometheus: "cch/gpt-5.4",
            metis: "cch/gpt-5.4",
            momus: "cch/gpt-5.4",
            atlas: "cch/gpt-5.4",
            "sisyphus-junior": "cch/gpt-5.4"
          },
          agentReasoningEfforts: {}
        }}
        drift={null}
        showDriftWarning={false}
        canApply
        onChange={onChange}
        onSave={vi.fn()}
        onApply={vi.fn()}
        onReapply={vi.fn()}
        onImport={vi.fn()}
      />
    );

    expect(
      screen.getAllByRole("option", { name: "oai" }).length
    ).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Hephaestus Provider"), {
      target: { value: "cch" }
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        agentModels: expect.objectContaining({
          hephaestus: "cch/gpt-5.4"
        })
      })
    );
  });
});
