# 使用云端API配置指南

## 方法1: 使用配置文件

在用户目录创建或编辑配置文件：

```bash
# 创建配置目录
mkdir -p ~/.english-optimizer

# 创建或编辑配置文件
code ~/.english-optimizer/config.yaml
# 或者使用其他编辑器
```

### OpenAI 配置

```yaml
ai:
  provider: 'api'
  api:
    provider: 'openai'
    apiKey: 'sk-your-openai-api-key-here'
    baseUrl: 'https://api.openai.com/v1'
    model: 'gpt-3.5-turbo'
    # 或者使用更新的模型
    model: 'gpt-4o'
    model: 'gpt-4o-mini'
```

### GLM (智谱AI) 配置

```yaml
ai:
  provider: 'api'
  api:
    provider: 'glm'
    apiKey: 'your-glm-api-key-here'
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
    model: 'glm-4'
    # 或者使用更便宜的模型
    model: 'glm-4-flash'
```

### DeepSeek 配置

```yaml
ai:
  provider: 'api'
  api:
    provider: 'custom'
    apiKey: 'your-deepseek-api-key-here'
    baseUrl: 'https://api.deepseek.com/v1'
    model: 'deepseek-chat'
```

### Claude (Anthropic) 配置

注意：Claude 使用不同的API格式，可能需要调整代码

```yaml
ai:
  provider: 'api'
  api:
    provider: 'custom'
    apiKey: 'your-anthropic-api-key-here'
    baseUrl: 'https://api.anthropic.com/v1'
    model: 'claude-3-5-sonnet-20241022'
```

### 其他兼容OpenAI格式的API

如果服务使用OpenAI兼容格式：

```yaml
ai:
  provider: 'api'
  api:
    provider: 'custom'
    apiKey: 'your-api-key-here'
    baseUrl: 'https://your-api-endpoint.com/v1'
    model: 'your-model-name'
```

## 方法2: 使用环境变量

在项目目录创建 `.env` 文件：

```bash
cp .env.example .env
code .env
```

### OpenAI 环境变量

```env
AI_PROVIDER=api
API_PROVIDER=openai
API_KEY=sk-your-openai-api-key-here
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o
```

### GLM 环境变量

```env
AI_PROVIDER=api
API_PROVIDER=glm
API_KEY=your-glm-api-key-here
API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
API_MODEL=glm-4
```

### DeepSeek 环境变量

```env
AI_PROVIDER=api
API_PROVIDER=custom
API_KEY=your-deepseek-api-key-here
API_BASE_URL=https://api.deepseek.com/v1
API_MODEL=deepseek-chat
```

## 常用大模型API配置

### OpenAI (GPT系列)

- API Key: https://platform.openai.com/api-keys
- Base URL: `https://api.openai.com/v1`
- Models: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`

### GLM-4 (智谱AI)

- API Key: https://open.bigmodel.cn/usercenter/apikeys
- Base URL: `https://open.bigmodel.cn/api/paas/v4`
- Models: `glm-4`, `glm-4-flash`, `glm-3-turbo`

### DeepSeek

- API Key: https://platform.deepseek.com/
- Base URL: `https://api.deepseek.com/v1`
- Models: `deepseek-chat`, `deepseek-coder`

### 阿里通义千问

- API Key: https://dashscope.console.aliyun.com/
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Models: `qwen-turbo`, `qwen-plus`, `qwen-max`

### 月之暗面 (Moonshot/Kimi)

- API Key: https://platform.moonshot.cn/
- Base URL: `https://api.moonshot.cn/v1`
- Models: `moonshot-v1-8k`, `moonshot-v1-32k`, `moonshot-v1-128k`

## 验证配置

配置完成后，测试是否工作：

```bash
# 检查配置
cao config

# 启动CLI测试
cao
```

## 切换回本地LLM

如果想切回本地Ollama：

```yaml
ai:
  provider: 'ollama'
  ollama:
    baseUrl: 'http://localhost:11434'
    model: 'llama3.2:3b'
```

或者使用环境变量：

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```
