import type { ProviderCatalog, ProviderSource } from "./types.ts";

export interface ProviderModelRef {
  providerId: string;
  modelId: string;
}

export type ProviderModelRefStatus =
  | {
      kind: "supported";
      rawValue: string;
      providerId: string;
      modelId: string;
    }
  | {
      kind: "invalid-format";
      rawValue: string;
    }
  | {
      kind: "unsupported-provider";
      rawValue: string;
      providerId: string;
      modelId: string;
    }
  | {
      kind: "unsupported-model";
      rawValue: string;
      providerId: string;
      modelId: string;
    };

export function parseProviderModelRef(value: string): ProviderModelRef {
  const slashIndex = value.indexOf("/");

  if (slashIndex <= 0 || slashIndex === value.length - 1) {
    throw new Error(`Invalid provider/model reference: ${value}`);
  }

  return {
    providerId: value.slice(0, slashIndex),
    modelId: value.slice(slashIndex + 1)
  };
}

export function resolveProviderModelRefStatus(
  providerCatalog: ProviderCatalog,
  value: string
): ProviderModelRefStatus {
  try {
    const { providerId, modelId } = parseProviderModelRef(value);
    const provider = providerCatalog.providers[providerId];

    if (!provider) {
      return {
        kind: "unsupported-provider",
        rawValue: value,
        providerId,
        modelId
      };
    }

    if (!provider.models.includes(modelId)) {
      return {
        kind: "unsupported-model",
        rawValue: value,
        providerId,
        modelId
      };
    }

    return {
      kind: "supported",
      rawValue: value,
      providerId,
      modelId
    };
  } catch {
    return {
      kind: "invalid-format",
      rawValue: value
    };
  }
}

export function buildProviderCatalog(input: {
  cliModels: string[];
  customProviderIds: string[];
  providerDisplayNamesById: Record<string, string>;
}): ProviderCatalog {
  const customProviderSet = new Set(input.customProviderIds);
  const providers: ProviderCatalog["providers"] = {};

  for (const modelRef of input.cliModels) {
    const { providerId, modelId } = parseProviderModelRef(modelRef);
    const source: ProviderSource = customProviderSet.has(providerId)
      ? "custom"
      : "official";

    const current = providers[providerId] ?? {
      id: providerId,
      label: input.providerDisplayNamesById[providerId] ?? providerId,
      source,
      models: []
    };

    if (!current.models.includes(modelId)) {
      current.models.push(modelId);
    }

    current.models.sort((left, right) => left.localeCompare(right));
    providers[providerId] = current;
  }

  const providerOrder = Object.keys(providers).sort((left, right) =>
    left.localeCompare(right)
  );

  return {
    providerOrder,
    providers
  };
}
