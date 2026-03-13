# OpenClaw Dashboard - 全自主开发验证流程

## 项目背景
OpenClaw 是一个 AI Agent 框架，本 Dashboard 用于管理和监控 OpenClaw 系统。
> 目标：通过全自主 AI 开发流程，验证和改进 OpenClaw Dashboard 的功能

---
## 🤖 MANDATORY: Agent 工作流程
每次新的 AI agent 会话必须遵循此工作流程：

### Step 1: 初始化环境
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器在 http://localhost:3000
```
**不要跳过此步骤**。确保服务器正常运行后再继续。

### Step 2: 选择下一个任务
读取 `task.json` 并选择**一个**任务。
选择标准（按优先级）：
1. 选择 `status: "pending"` 的任务
2. 考虑依赖关系 - 基础功能应优先完成
3. 选择最高优先级的未完成任务

### Step 3: 实现任务
- 仔细阅读任务描述和验收标准
- 实现满足所有要求的功能
- 遵循现有代码模式和规范
- 确保 TypeScript 类型安全
- 添加适当的错误处理

### Step 4: 全面测试
实现后，验证任务的所有验收标准：

**测试要求：**
1. **UI 修改（新建页面、组件、交互）：**
   - 使用浏览器测试（推荐安装 Playwright MCP）
   - 验证页面正确加载和渲染
   - 测试表单提交、按钮点击等交互
   - 检查响应式布局
   - 验证颜色、样式一致性

2. **API 修改（新建端点、数据逻辑）：**
   - 使用 curl 或浏览器测试 API
   - 验证响应格式正确
   - 测试错误处理
   - 检查数据验证

3. **配置修改（环境变量、设置）：**
   - 验证配置正确加载
   - 测试不同配置值

**所有修改必须通过：**
- ✅ `npm run lint` 无错误
- ✅ `npm run build` 构建成功
- ✅ 功能测试验证正常
- ✅ 代码审查（无明显问题）

**测试清单：**
- [ ] 代码无 TypeScript 错误
- [ ] lint 通过
- [ ] build 成功
- [ ] 功能在浏览器中正常工作
- [ ] 颜色和样式符合设计规范
- [ ] 中英文翻译正确

### Step 5: 更新进度
将工作记录到 `progress.txt`：
```markdown
## [日期] - 任务: [任务名称]
### 完成内容:
- [具体修改内容]

### 测试方法:
- [如何测试的]

### 遇到的问题:
- [问题和解决方案]

### 备注:
- [任何相关信息]
```

### Step 6: 提交更改（包含 task.json 更新）
**重要：所有更改必须在同一个 commit 中提交！**

流程：
1. 更新 `task.json`，将任务 `status` 从 `"pending"` 改为 `"completed"`
2. 更新 `progress.txt` 记录工作内容
3. 一次性提交所有更改：
```bash
git add .
git commit -m "[任务名称] - 完成"
```

**规则：**
- 只有所有验收标准通过后才标记 `status: "completed"`
- 永远不要删除或修改任务描述
- 永远不要从列表中移除任务
- 一个任务的所有内容必须在同一个 commit 中

---
## 🚫 阻塞处理（Blocking Issues）

**如果任务无法完成或需要人工介入：**

### 需要停止并请求人工帮助的情况：
1. **缺少环境配置**
   - OpenClaw 本地环境未安装
   - 需要真实的 OpenClaw Gateway 连接
   - 需要特定 API 密钥

2. **外部依赖不可用**
   - OpenClaw API 服务变更
   - 需要本地运行 OpenClaw 实例

3. **测试无法进行**
   - 功能依赖真实的 OpenClaw 环境
   - 需要 AI Agent 运行时才能测试

### 阻塞时的正确操作：
**禁止：**
- ❌ 提交 git commit
- ❌ 将 task.json 的 status 设为 "completed"
- ❌ 假装任务已完成

**必须：**
- ✅ 在 progress.txt 中记录当前进度和阻塞原因
- ✅ 输出清晰的阻塞信息
- ✅ 停止任务，等待人工介入

### 阻塞信息格式：
```
🚫 任务阻塞 - 需要人工介入
**当前任务**: [任务名称]
**已完成的工作**:
- [已完成的代码/配置]

**阻塞原因**:
- [具体说明]

**需要人工帮助**:
1. [具体步骤 1]
2. [具体步骤 2]

**解除阻塞后**:
- 运行 [命令] 继续任务
```

---
## 📁 项目结构
```
/
├── CLAUDE.md          # 本文件 - 工作流程说明
├── task.json         # 任务定义（唯一真相源）
├── progress.txt      # 进度日志
├── src/
│   ├── app/          # Next.js App Router 页面
│   │   └── [locale]/ # 国际化路由
│   ├── components/   # React 组件
│   ├── lib/          # 工具库和 API
│   └── messages/     # 翻译文件
└── package.json
```

## 🛠️ 常用命令
```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 运行 linter

# 测试
curl http://localhost:3000/api/health    # 测试 API
```

## 📋 代码规范
- TypeScript 严格模式
- React 函数式组件 + Hooks
- Tailwind CSS 样式
- 颜色规范：
  - 🟢 连接/活跃/健康: `bg-green-500`
  - 🔴 断开/未活跃/错误: `bg-red-500`
  - 🟡 降级/警告: `bg-yellow-500`
  - ⚪ 未活跃/待处理: `text-gray-500`
- 翻译规范：
  - 所有用户可见文本必须使用翻译键
  - 位置：`src/messages/en.json` 和 `src/messages/zh.json`

## 🎯 关键规则
1. **每次会话一个任务** - 专注于完成一个任务
2. **测试后再标记完成** - 所有验收标准必须通过
3. **UI 修改必须浏览器测试** - 新建或大幅修改页面必须测试
4. **记录到 progress.txt** - 帮助后续 AI 了解工作
5. **一次提交一个任务** - 所有更改在同一 commit
6. **永不删除任务** - 只改变 status
7. **阻塞时停止** - 需要人工介入时不要提交

## 🌐 国际化（i18n）
项目使用 next-intl 支持中英文切换：
- 英文：`/en/*`
- 中文：`/zh/*`
- 添加新文本时，同时更新 en.json 和 zh.json

## 🔌 OpenClaw 集成
项目连接到本地 OpenClaw 实例：
- Gateway API: `http://127.0.0.1:18789`
- 文件路径: `~/.openclaw/`
- Agents: `~/.openclaw/agents/`
- 配置: `~/.openclaw/openclaw.json`

---
**开始开发前，请确保：**
1. ✅ 已阅读并理解本文件
2. ✅ OpenClaw 本地环境已安装（可选，用于测试）
3. ✅ 依赖已安装（`npm install`）
4. ✅ 开发服务器正在运行（`npm run dev`）
