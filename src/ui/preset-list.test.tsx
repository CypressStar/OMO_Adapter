import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PresetList } from "./preset-list";

describe("PresetList", () => {
  test("hides the activate button for the active preset and keeps actions for inactive presets", () => {
    render(
      <PresetList
        presets={[
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
          },
          {
            id: "secondary",
            name: "Secondary",
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
        ]}
        activePresetId="default"
        selectedPresetId="default"
        onSelect={vi.fn()}
        onActivate={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onCreate={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /activate preset default/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /activate preset secondary/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /duplicate preset default/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete preset default/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /move preset default/i })
    ).toBeInTheDocument();
  });

  test("selects a preset when clicking anywhere on the card body and truncates long names", () => {
    const onSelect = vi.fn();

    render(
      <PresetList
        presets={[
          {
            id: "default",
            name: "Preset Name That Keeps Growing Copy Copy Copy Copy Copy",
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
        ]}
        activePresetId="default"
        selectedPresetId="default"
        onSelect={onSelect}
        onActivate={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMove={vi.fn()}
        onCreate={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText("desc").at(-1)!);

    expect(onSelect).toHaveBeenCalledWith("default");
    expect(screen.getByText("Preset Name That Keeps Grow...")).toBeInTheDocument();
    expect(screen.getByTitle("Preset Name That Keeps Growing Copy Copy Copy Copy Copy"))
      .toBeInTheDocument();
  });
});
