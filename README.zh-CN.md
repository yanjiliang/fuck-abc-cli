# English Optimizer CLI

[English](README.md) | [简体中文](README.zh-CN.md)

一个强大的 CLI 工具，帮助非英语母语者使用 AI 改进英文写作。只需输入文本并使用快捷键即可以不同风格即时优化！

## 功能特性

- 🎯 **交互模式** - 使用快捷键实时优化文本
- 🤖 **多种 AI 后端** - 支持本地 Ollama 或云端 API（OpenAI、GLM）
- 📝 **优化模式** - 专业、简洁、语法修正、资深开发者风格
- 📜 **历史记录** - 查看过往优化记录并学习
- 🔧 **自定义提示词** - 创建你自己的优化风格
- 🐋 **Docker 支持** - 使用 Docker 轻松设置 Ollama
- ⚡ **快速且私密** - 使用 Ollama 进行本地 AI 处理

## 前置要求

- Node.js 18+ 和 npm
- Docker（用于本地 Ollama 设置）

## YAML 提示词配置

你可以在项目根目录使用 YAML 文件配置 AI 行为：

### YAML 提示词文件

在项目根目录创建 `prompt.yaml` 文件：

```yaml
role:
  name: Native English Full-Stack Engineer Coach
  description: >
    你是一位以英语为母语的资深全栈软件工程师。
    你在前端、后端、系统设计和实际工程协作方面有丰富经验。

goals:
  - 帮助用户学习软件工程师使用的自然、口语化英语
  - 将用户的输入翻译成地道的、母语级别的英语

user_profile:
  background: 软件工程师
  native_language: 中文
  learning_goal: 提高日常工程沟通的实用英语

instructions:
  - 始终假设用户想要改进他们的英语
  - 以英语母语工程师自然表达的方式重写输入
  - 优先使用对话式、工作友好的语言，而不是学术或过于正式的英语

output_format:
  style: >
    工程团队中常用的自然、口语化英语。
    听起来像会议、Slack 或代码审查中的真实对话。

examples:
  - input: '这个需求我已经完成了，但是还需要再测试一下'
    output: "I've finished this feature, but I still need to do some more testing."

  - input: '这个问题我稍后再跟进'
    output: "I'll follow up on this later."

constraints:
  - 除非用户明确要求，否则不要过度解释
  - 不要改变原意
```

CLI 将自动检测并使用当前目录中的 `prompt.yaml` 文件（如果存在）。

### 基于文本的提示词模板

你也可以使用基于文本的提示词自定义翻译/优化行为：

### 查看当前提示词

```bash
cao prompt --show
```

### 编辑提示词模板

```bash
cao prompt --edit
# 或直接编辑
code ~/.english-optimizer/translation-prompt.txt
```

### 自定义提示词示例

**正式商务英语：**

```
你是一位专业的商务翻译。
将文本翻译/优化为正式的商务英语，使用专业术语。
文本："{text}"
```

**轻松的开发者聊天：**

```
你是一位软件开发者。
将文本翻译/优化为像 Slack 消息一样的轻松英语。
文本："{text}"
```

**技术文档：**

```
你是一位技术文档翻译员。
将文本翻译/优化为精确的技术文档英语。
文本："{text}"
```

查看 `TRANSLATION_PROMPT_EXAMPLE.md` 了解更多示例。

## 快速开始

### 1. 安装

```bash
npm install
```

### 2. 设置 Ollama（本地 AI）

```bash
# 使脚本可执行
chmod +x scripts/setup-ollama.sh

# 运行设置（启动 Ollama 并拉取模型）
./scripts/setup-ollama.sh
```

### 3. 构建 CLI

```bash
npm run build
```

### 4. 开始使用

```bash
npm start
# 或
cao
```

## 使用方法

### 即时模式（默认）

只需运行 CLI 并开始输入！按 **Cmd+键** 即时优化：

```bash
cao
# 或
npm start
```

**工作原理：**

1. 正常输入文本
2. 按 `Cmd+P` 切换到专业语气
3. 按 `Cmd+C` 切换到简洁版本
4. 按 `Cmd+G` 进行语法修正
5. 按 `Cmd+D` 切换到资深开发者风格
6. 按 **Enter** 接受优化，或继续输入以忽略

**控制：**

- `Ctrl+U` - 清除文本
- `Ctrl+C` - 退出

### 经典模式（可选）

如果你更喜欢先提交文本，然后选择优化：

```bash
cao --classic
# 或
npm start -- --classic
```

1. 输入文本（按两次 Enter 完成）
2. 按快捷键查看不同的优化：
   - `Ctrl+P` - 专业语气
   - `Ctrl+C` - 简洁版本
   - `Ctrl+G` - 语法修正
   - `Ctrl+D` - 资深开发者风格
   - `Ctrl+R` - 重置为原始文本
   - `Ctrl+H` - 查看历史
   - `Ctrl+Q` - 退出

### 查看历史

```bash
cao history
cao history -n 5  # 显示最近 5 条记录
```

### 列出自定义提示词

```bash
cao prompts
```

### 检查配置

```bash
# 显示当前配置
cao config

# 运行交互式设置向导
cao config --setup

# 测试 API 配置
cao test
```

测试命令将：

- 验证你的 API 配置是否有效
- 测试与 API 提供商的连接
- 运行简单的优化测试
- 如果出现问题，显示详细的错误消息

设置向导将引导你完成：

- 选择 AI 提供商（本地 Ollama 或云端 API）
- 配置 API 设置
- 设置首选项

## 配置

CLI 可以通过以下方式配置：

1. **环境变量**（`.env` 文件）
2. **配置文件**（`~/.english-optimizer/config.yaml` 或 `~/.english-optimizer/config.json`）

### 使用云端 API（OpenAI、GLM、DeepSeek 等）

默认情况下，CLI 使用本地 Ollama。要使用云端 API，你需要配置它们。

**快速设置：**

1. 复制示例环境文件：

```bash
cp .env.example .env
```

2. 使用你的 API 配置编辑 `.env`：

```env
AI_PROVIDER=api
API_PROVIDER=openai  # 或 'glm'、'custom'
API_KEY=your_api_key_here
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o
```

详细的 API 配置说明，请参见 [API_SETUP.md](API_SETUP.md)

### 环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# AI 提供商：本地使用 'ollama'，云端使用 'api'
AI_PROVIDER=ollama

# Ollama 配置（本地）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# API 配置（云端 - OpenAI/GLM）
# AI_PROVIDER=api
# API_PROVIDER=openai
# API_KEY=your_api_key_here
# API_BASE_URL=https://api.openai.com/v1
# API_MODEL=gpt-3.5-turbo

# GLM（智谱 AI）
# API_PROVIDER=glm
# API_KEY=your_glm_api_key
# API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
# API_MODEL=glm-4
```

### 配置文件

配置文件可以是 YAML 或 JSON 格式，会自动创建在 `~/.english-optimizer/config.yaml`（或 `config.json`）：

```yaml
ai:
  provider: 'ollama'
  ollama:
    baseUrl: 'http://localhost:11434'
    model: 'llama3.2:3b'
  api:
    provider: 'openai'
    apiKey: ''
    baseUrl: 'https://api.openai.com/v1'
    model: 'gpt-3.5-turbo'

hotkeys:
  professional: 'p'
  concise: 'c'
  grammar: 'g'
  senior_developer: 'd'
  reset: 'r'
  history: 'h'
  quit: 'q'

features:
  enableHistory: true
  historyPath: ~/.english-optimizer/history.json
  enableCustomPrompts: true
  customPromptsPath: ~/.english-optimizer/prompts.json
  useYAMLPrompt: true
```

## 自定义提示词

你可以在 `~/.english-optimizer/prompts.json` 创建自定义优化提示词：

```json
[
  {
    "name": "Academic",
    "description": "以适合研究论文的学术风格重写",
    "prompt": "请以学术风格重写以下文本...",
    "hotkey": "a"
  },
  {
    "name": "Friendly",
    "description": "使文本更加友好和随意",
    "prompt": "请重写以下文本使其听起来更友好...",
    "hotkey": "f"
  }
]
```

## Docker 命令

```bash
# 启动 Ollama
docker-compose up -d

# 停止 Ollama
docker-compose down

# 查看日志
docker-compose logs -f ollama

# 重启 Ollama
docker-compose restart
```

## 生产部署

使用云端 API 而不是本地 Ollama：

1. 更新你的 `.env` 文件：

   ```env
   AI_PROVIDER=api
   API_PROVIDER=openai  # 或 'glm' 用于智谱 AI
   API_KEY=your_actual_api_key
   API_MODEL=gpt-3.5-turbo  # 或你喜欢的模型
   ```

2. CLI 将自动使用云端 API

## 开发

```bash
# 监视并重新构建
npm run watch

# 在开发模式下运行
npm run dev

# 代码检查
npm run lint
```

## 项目结构

```
english-optimizer-cli/
├── src/
│   ├── index.ts              # CLI 入口点
│   ├── core/
│   │   ├── editor.ts         # 带快捷键的交互式编辑器
│   │   └── optimizer.ts      # 优化编排
│   ├── ai/
│   │   ├── provider.ts       # AI 提供商工厂
│   │   ├── ollama.ts         # Ollama 集成
│   │   └── api-provider.ts   # OpenAI/GLM 集成
│   ├── prompts/
│   │   ├── templates.ts      # 内置提示词模板
│   │   └── custom.ts         # 自定义提示词加载器
│   ├── config/
│   │   └── config.ts         # 配置管理
│   ├── history/
│   │   └── logger.ts         # 历史记录
│   └── utils/
│       └── display.ts        # 输出格式化
├── docker-compose.yml        # Ollama Docker 设置
├── scripts/
│   └── setup-ollama.sh      # 设置脚本
└── package.json
```

## 故障排除

### Ollama 连接失败

```bash
# 检查 Ollama 是否运行
docker-compose ps

# 重启 Ollama
docker-compose restart

# 检查 Ollama 日志
docker-compose logs ollama
```

### 未找到模型

```bash
# 手动拉取模型
docker exec -it english-optimizer-ollama ollama pull llama3.2:3b
```

### API 密钥问题

确保你的 `.env` 文件有正确的 API 密钥，且 API 提供商 URL 准确。

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 作者

为世界各地的非英语母语者用 ❤️ 创建。
