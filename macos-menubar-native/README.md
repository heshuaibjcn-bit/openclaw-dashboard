# OpenClaw Dashboard - macOS 菜单栏应用

## 功能特性

- **精美图标** - 红色龙虾 + 白色眼睛设计
- **菜单栏集成** - 在 macOS 菜单栏显示
- **服务控制** - 启动/停止 Dashboard 服务
- **状态监控** - 实时显示 Dashboard 运行状态
- **快速访问** - 一键打开 Dashboard (localhost:3000)
- **轻量级** - 仅 43KB（开发版）或自包含版本
- **便捷操作** - 左键或右键点击显示菜单

## 安装方法

### 方式一：自包含版本（推荐普通用户）

**文件：** `OpenClaw-Dashboard-Standalone.dmg` (796MB)

**特点：**
- ✅ 完全自包含，开箱即用
- ✅ 内置 Node.js 运行时
- ✅ 包含所有依赖（node_modules）
- ✅ 无需任何预装软件

**安装步骤：**
1. 双击打开 `OpenClaw-Dashboard-Standalone.dmg`
2. 将 `OpenClaw Dashboard` 拖拽到 Applications 文件夹
3. 从 Launchpad 启动应用
4. 点击菜单栏图标，选择"启动服务"

### 方式二：轻量版本（推荐开发者）

**文件：** `OpenClaw-Dashboard-1.0.0.dmg` (43KB)

**特点：**
- ✅ 体积小，下载快
- ✅ 需要系统已安装 Node.js
- ✅ 使用系统的 Node.js 和依赖

**系统要求：**
- macOS 10.15 (Catalina) 或更高版本
- Node.js 已安装（推荐通过 nvm 安装）
- Next.js 项目依赖已安装

## 使用说明

### 图标说明
菜单栏图标显示为：
- **红色椭圆** - 龙虾身体
- **白色圆圈 + 黑色瞳孔** - 眼睛
- **红色线条** - 触须
- **小椭圆** - 钳子

### 显示菜单
**左键或右键点击**图标即可显示菜单

### 菜单功能

1. **状态显示**
   - ● Dashboard 运行中 (绿色圆点)
   - ○ Dashboard 已停止 (灰色圆点)

2. **启动服务**（自包含版）
   - 点击启动 Dashboard 开发服务器
   - 使用内置的 Node.js 和依赖
   - 等待 3-5 秒让服务完全启动

3. **启动服务**（轻量版）
   - 使用系统的 Node.js
   - 需要已安装 Node.js 和依赖

4. **停止服务**
   - 点击停止 Dashboard 服务

5. **打开 Dashboard**
   - 在浏览器中打开 http://localhost:3000

6. **退出**
   - 完全退出菜单栏应用

## 系统要求

### 自包含版本
- macOS 10.15 (Catalina) 或更高版本
- 无需其他软件

### 轻量版本
- macOS 10.15 (Catalina) 或更高版本
- Node.js 已安装
- 在项目目录运行过 `npm install`

## 故障排除

### 自包含版本

**应用未显示图标**
- 打开"活动监视器"查找"OpenClaw-Dashboard"进程
- 如果进程存在但图标不可见，重启应用

**启动服务失败**
- 查看应用日志：`log stream --predicate 'process == "OpenClaw-Dashboard"'`
- 确保有足够的内存（建议 4GB+）
- 关闭其他占用 3000 端口的应用

**Dashboard 无法访问**
- 等待 10-15 秒让服务完全启动
- 检查防火墙设置
- 尝试停止服务后重新启动

### 轻量版本

**应用未显示图标**
- 确保已通过 `nvm` 或 Homebrew 安装 Node.js
- 检查环境变量：`echo $PATH`

**启动服务失败**
- 确保在项目目录运行过 `npm install`
- 手动测试：`cd /Users/alex/openclaw-dashboard && npm run dev`
- 检查端口 3000 是否被占用

**找不到 Node.js**
```bash
# 通过 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

```bash
# 通过 Homebrew 安装
brew install node
```

## 开发

### 构建应用
```bash
./build.sh
```

### 打包 DMG
```bash
# 轻量版
./package-dmg.sh

# 自包含版
./package-standalone.sh
./package-dmg-standalone.sh
```

### 项目结构
```
macos-menubar-native/
├── Sources/
│   └── main.swift           # 主程序代码
├── Info.plist              # 应用配置
├── build.sh                # 构建脚本
├── package-dmg.sh          # 轻量版 DMG 打包
├── package-standalone.sh   # 自包含版打包
├── package-dmg-standalone.sh # 自包含版 DMG 打包
├── dist/                   # 构建输出
│   └── OpenClaw Dashboard.app
├── OpenClaw-Dashboard-1.0.0.dmg        # 轻量版 DMG (43KB)
└── OpenClaw-Dashboard-Standalone.dmg   # 自包含版 DMG (796MB)
```

## 版本对比

| 特性 | 轻量版 | 自包含版 |
|------|--------|----------|
| 大小 | 43KB | 796MB |
| Node.js | 需要安装 | 已内置 |
| 依赖 | 需要 npm install | 已内置 |
| 目标用户 | 开发者 | 普通用户 |
| 离线运行 | 否 | 是 |

## 功能状态

| 功能 | 轻量版 | 自包含版 |
|------|--------|----------|
| 菜单栏图标 | ✅ | ✅ |
| 左键点击 | ✅ | ✅ |
| 状态检测 | ✅ | ✅ |
| 打开 Dashboard | ✅ | ✅ |
| 停止服务 | ✅ | ✅ |
| 启动服务 | ✅ | ✅ |

## 更新日志

### v1.0.0 (当前版本)
- ✅ 精美的龙虾 + 眼睛图标设计
- ✅ 左键和右键点击都可显示菜单
- ✅ 实时状态监控
- ✅ 服务启动/停止功能
- ✅ 快速打开 Dashboard
- ✅ 自包含版本（包含 Node.js 和所有依赖）
- ✅ 仅 43KB 超小体积（轻量版）

## 许可证

MIT
