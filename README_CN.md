# OMO_Adapter

`OMO_Adapter` 是一个轻量级的 Windows 优先桌面实用工具，用于管理和切换 OpenCode 中使用的 `oh-my-openagent` / `oh-my-opencode` 插件中官方代理的模型配置。

本项目专注于一项任务：快速且安全地维护多个代理模型预设，并将所选预设写入 `oh-my-opencode.json`，而无需每次都手动编辑 JSON。

## 概述

OpenCode 用户可以在其本地 OpenCode 配置中配置多个模型提供者，而 `oh-my-openagent` 允许每个官方代理使用不同的模型。当提供者和模型数量增长时，手动编辑代理映射变得缓慢且容易出错。

`OMO_Adapter` 旨在通过本地桌面 UI 解决这个问题，该 UI 能够：

- 从 OpenCode 官方模型生态系统和用户的本地 `opencode.json` 读取可用的提供者/模型选择
- 管理多个可重用的代理模型预设
- 通过写入 `oh-my-opencode.json` 应用所选预设
- 检测文件是否在工具外部被手动编辑，并警告配置漂移

## 目标

- 为切换 `omo` 代理模型配置提供快速的可视化工作流程
- 支持多个可重用预设，而不是单个静态配置
- 保持工具轻量级和本地优先
- 通过永不自动重启 OpenCode 来保留用户控制权
- 与官方 `oh-my-openagent` 代理定义保持一致

## 非目标

- 在 UI 中管理自定义非官方代理
- 自动重启或重新加载 OpenCode
- 替换 OpenCode 自己的提供者管理
- 充当通用 OpenCode 配置编辑器

## 范围

### 范围内

- Windows 桌面 GUI
- 官方 11 个 `oh-my-openagent` 代理的预设管理
- 从以下来源读取提供者/模型选项：
  - OpenCode 官方提供者/模型能力
  - `~/.config/opencode/opencode.json` 中用户定义的提供者
- 将所选预设写入 `~/.config/opencode/oh-my-opencode.json`
- 如果 `oh-my-opencode.json` 不存在则创建它
- 当目标文件在 `OMO_Adapter` 外部手动更改时检测漂移
- 在 UI 中区分模型来源

### 范围外

- 编辑自定义代理定义
- 编辑提供者凭据
- 编辑不相关的 `oh-my-opencode.json` 部分，如 `hooks`、`mcp` 或迁移
- 云同步、账户系统或远程存储

## 官方代理覆盖

`OMO_Adapter` 将严格针对上游文档定义的官方代理集。

支持的官方代理：

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

如果用户的 `oh-my-opencode.json` 中存在额外的自定义代理，工具将不会在 UI 中显示它们。它们应在写回期间保留，以便工具不会破坏不相关的用户数据。

## 核心功能

### 1. 可用模型检测

该工具从两个来源检测可用的模型选择：

- OpenCode 官方提供者/模型生态系统
- `opencode.json` 中用户配置的提供者

UI 应清楚地区分这些来源，以便用户知道模型是否来自：

- 官方 OpenCode 支持
- 本地自定义提供者配置

两种来源可以在同一预设中自由混合。同一预设中的不同代理可以指向不同的提供者，包括官方提供者和用户定义的自定义提供者的混合。

### 2. 预设管理

该工具维护多个代理预设。

每个预设包含：

- 预设名称
- 预设描述
- 官方 11 个代理的模型映射

默认行为：

- 首次启动时存在内置的 `default` 预设
- 预设支持 `激活`、`编辑`、`复制` 和 `删除`
- 当前活动的预设在视觉上突出显示
- 底部状态栏显示当前活动的预设

### 3. 代理模型选择

预设中的每个代理条目显示：

- 代理名称
- 代理描述
- 级联模型选择器

选择器行为：

- 第一级：提供者
- 第二级：所选提供者下的模型列表
- 最终存储值格式：`provider/model`
- 支持在同一预设中进行混合提供者分配

### 4. 漂移检测

如果用户手动编辑 `oh-my-opencode.json` 并且文件不再匹配 `OMO_Adapter` 中标记为活动的预设，工具必须显示明确的不匹配警告。

支持的恢复操作：

- 将当前文件内容导入活动预设
- 将活动预设重新应用到文件

工具绝不能静默覆盖漂移的更改。

## UX 设计

### 主布局

- 左面板：预设列表
- 右面板：预设详情编辑器
- 底部栏：活动预设和文件状态

### 预设列表

每个预设项目显示：

- 预设名称
- 简短描述
- 活动状态
- 快速操作：激活、编辑、复制、删除

活动预设应使用清晰的强调样式。

### 预设详情视图

详情视图显示：

- 预设名称
- 预设描述
- 固定顺序的官方代理列表
- 每个代理的提供者/模型选择器

### 状态栏

底部状态栏应显示简洁的运行时信息，例如：

- 当前活动预设
- 目标文件路径状态
- 漂移状态
- 最后应用时间

### 建议的状态

- `已同步`
- `已漂移`
- `文件缺失`
- `无效 JSON`
- `不支持的模型引用`

## 配置来源

### 来源 A：OpenCode 配置

主要本地配置路径：

```text
~/.config/opencode/opencode.json
```

用于：

- 用户定义的提供者
- 这些提供者下的用户定义模型列表

### 来源 B：OMO 配置

主要目标文件路径：

```text
~/.config/opencode/oh-my-opencode.json
```

用于：

- 读取当前代理模型分配
- 应用所选预设
- 检测外部手动修改
- 如果文件缺失则创建它

### 来源分类

模型选择器应在视觉上区分：

- `官方`
- `来自 opencode.json 的自定义`

## 数据模型

### 内部预设记录

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

### 内部运行时状态

建议的运行时状态：

- 可用的提供者和模型
- 预设集合
- 活动预设 ID
- 最后应用的文件指纹
- 漂移状态
- 文件解析状态

## 写入策略

写入行为必须是保守的。

规则：

- 仅更新官方 11 个代理的 `model` 字段
- 保留不相关的顶级部分，如 `hooks`、`mcp` 和 `_migrations`
- 保留官方 11 个代理范围之外的自定义代理条目
- 如果文件不存在，则使用所需的基线结构创建 `oh-my-opencode.json`
- 使用安全写入流程：生成内容、验证 JSON、写入临时文件、替换目标文件

这避免破坏用户现有的 `oh-my-opencode.json`。

## 漂移检测设计

漂移应通过比较以下内容来检测：

- `OMO_Adapter` 中当前活动的预设
- `oh-my-opencode.json` 中当前存储的实际模型映射

漂移场景：

- 用户在文件中手动更改了一个或多个代理模型
- 文件被另一个工具更改
- 文件引用了当前提供者列表中不再可用的模型

建议的比较单位：

- 仅比较官方 11 个代理
- 忽略自定义代理进行不匹配计算

## 技术栈

### 推荐选择

- 桌面框架：`Tauri 2`
- 前端语言：`TypeScript`
- UI 框架：`React`
- 构建工具：`Vite`
- 状态管理：`Zustand`
- 模式验证：`Zod`

### 为什么选择 Tauri

- 与 Electron 相比轻量级
- 非常适合小型本地配置实用工具
- 强大的 Windows 支持
- 更容易保持包大小和内存使用率低
- 为未来的 macOS/Linux 支持留出空间

### 为什么选择 TypeScript

- 快速 UI 迭代
- 配置结构的强类型
- 桌面前端的良好生态系统
- 易于维护 UI 和本地文件操作之间的清晰数据契约

## 架构

### 高级模块

1. `config-source`
   - 读取 OpenCode 和 OMO 配置文件
   - 提取可用的提供者/模型
   - 规范化官方代理映射

2. `preset-store`
   - 存储本地预设
   - 跟踪活动预设
   - 处理复制/删除/更新操作

3. `drift-detector`
   - 比较活动预设与当前目标文件
   - 生成同步状态和冲突操作

4. `writer`
   - 将所选预设应用到 `oh-my-opencode.json`
   - 保留不相关的文件内容
   - 使用安全的原子写入流程

5. `ui`
   - 预设列表
   - 预设编辑器
   - 状态栏
   - 冲突提示

## 平台策略

第一个版本针对 Windows，但架构应隔离特定于操作系统的文件路径解析，以便未来支持跨平台。

建议的路径策略：

- Windows：使用已知的默认配置路径
- 未来的 macOS/Linux：注入平台路径解析器，而不是在任何地方硬编码 Windows 路径

## 验证规则

- 预设必须始终包含所有 11 个官方代理的映射
- 模型值必须匹配格式 `provider/model`
- 所选模型必须存在于当前可用的提供者/模型映射中
- 如果模型变得不可用，UI 应显示它而不是静默删除它
- 外部配置文件中的无效 JSON 应产生明确的错误状态

## 错误处理

工具应显式处理：

- 缺少 `opencode.json`
- 缺少 `oh-my-opencode.json`
- 当文件缺失且用户应用预设时自动创建 `oh-my-opencode.json`
- 任一文件中的无效 JSON
- 当前配置中缺少提供者
- 当前提供者中缺少模型
- 写入期间的文件权限失败
- 写入前检测到漂移

## 里程碑

### 第一阶段

- 搭建桌面应用
- 读取两个配置文件
- 解析官方和自定义提供者/模型列表
- 显示单个内置的 `default` 预设

### 第二阶段

- 添加预设 CRUD
- 添加活动预设状态
- 添加写回到 `oh-my-opencode.json`

### 第三阶段

- 添加漂移检测
- 添加导入/重新应用冲突操作
- 添加状态栏和验证状态

### 第四阶段

- 完善 UX
- 添加路径抽象以支持未来的跨平台
- 添加 Windows 分发的打包

## 风险和决策

### 关键决策

- UI 中仅管理官方 11 个代理
- 自定义代理被保留但不被编辑
- 工具永不重启 OpenCode
- 手动提供者仍由 `opencode.json` 拥有

### 主要风险

- 上游 `oh-my-openagent` 可能会在将来更改官方代理列表
- OpenCode 提供者/模型元数据源可能会演变
- 如果文件已包含不支持的代理，用户可能期望自定义代理编辑

## 参考资料

- [OpenCode 配置文档](https://opencode.ai/docs/config/)
- [OpenCode 模型文档](https://opencode.ai/docs/models/)
- [OpenCode 提供者文档](https://opencode.ai/docs/providers/)
- [oh-my-openagent 功能参考](https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/docs/reference/features.md)
- [AI SDK 提供者](https://ai-sdk.dev/providers)
- [Models.dev](https://models.dev/)

## 当前状态

此存储库当前包含 `OMO_Adapter` 的产品定义和技术设计。

实现尚未开始。
