# OMO_Adapter

[English](./README.md)

`OMO_Adapter` 是一个本地桌面工具，用于管理和切换 OpenCode 中 `oh-my-openagent` / `oh-my-opencode` 的 11 个官方 Agent 模型预设。

它只专注一件事：不再每次都手动改 Agent 的模型映射文件，而是用预设快速切换不同 provider 和 model 组合。

## 工具作用

- 从 OpenCode 本地配置读取可用的 provider 和 model
- 区分官方 provider 模型与 `opencode.json` 中的自定义 provider
- 管理多套可复用的 Agent 预设
- 将选中的预设写入本地 OMO 配置文件
- 在用户手动改过文件后检测 drift 并给出提示
- 尽量保留无关配置内容，而不是粗暴重写整个文件

## 核心流程

`OMO_Adapter` 的本地使用流程很简单：

1. 读取当前可用的 provider/model 目录
2. 为官方 Agent 集合编辑、复制或新建预设
3. 激活预设并写入当前 OMO 配置
4. 如果手动修改导致 drift，再选择重新应用或导入文件内容

工具不会替你自动重启 OpenCode。若新的 Agent 配置需要重启才能生效，这一步仍由用户自己决定何时执行。

## 官方 Agent 范围

`OMO_Adapter` 只管理以下 11 个官方 Agent：

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

如果目标配置文件里已经存在额外的自定义 Agent，工具不会在 UI 中管理它们。

## 配置文件

OpenCode provider 来源文件：

```text
~/.config/opencode/opencode.json
```

工具写入的 OMO 目标文件：

```text
~/.config/opencode/oh-my-opencode.json
~/.config/opencode/oh-my-opencode.jsonc
```

`OMO_Adapter` 会从 `opencode.json` 读取 provider 信息，并把选中的官方 Agent 模型映射同时写入这两个 OMO 目标文件。

## 安全边界

- 只管理官方 11 个 Agent
- 支持同一套预设中混合使用不同 provider
- 检测到 drift 时会提示，不会静默覆盖
- 目标文件不存在时会按需创建
- `hooks`、`mcp` 以及未被管理的自定义内容会尽量保留

## 项目范围

范围内：

- 官方 OMO Agent 的本地预设管理
- 本地 provider/model 检测
- 本地配置写回与 drift 处理
- Windows 优先的桌面使用场景，同时保留未来跨平台余地

范围外：

- 管理自定义 Agent 定义
- 编辑 provider 凭据
- 作为通用 OpenCode 配置编辑器使用
- 自动重启 OpenCode

## 参考资料

- [OpenCode Config Docs](https://opencode.ai/docs/config/)
- [OpenCode Models Docs](https://opencode.ai/docs/models/)
- [OpenCode Providers Docs](https://opencode.ai/docs/providers/)
- [oh-my-openagent Features Reference](https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/docs/reference/features.md)
- [AI SDK Providers](https://ai-sdk.dev/providers)
- [Models.dev](https://models.dev/)
