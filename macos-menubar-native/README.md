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

**下载：** 从 [GitHub Releases](https://github.com/heshuaibjcn-bit/openclaw-dashboard/releases) 下载最新的 `OpenClaw-Dashboard-Standalone.dmg`

**文件大小：** ~807 MB

**特点：**
- ✅ 完全自包含，开箱即用
- ✅ 内置 Node.js v24.14.0 运行时
- ✅ 包含所有依赖（node_modules）
- ✅ 无需任何预装软件
- ✅ 支持端口配置

**安装步骤：**
1. 从 [GitHub Releases](https://github.com/heshuaibjcn-bit/openclaw-dashboard/releases) 下载最新版本
2. 双击打开 `OpenClaw-Dashboard-Standalone.dmg`
3. 将 `OpenClaw Dashboard` 拖拽到 Applications 文件夹
4. 从 Launchpad 启动应用
5. 点击菜单栏图标，选择"启动服务"

**版本管理：**
- 使用 GitHub Releases 进行版本发布
- 每个版本包含完整的 DMG 安装包
- 发布格式：`v{version}-standalone`（如 `v1.0.0-standalone`）

### 方式二：源代码部署（推荐开发者）

**代码：** 从 `main` 分支获取最新源代码

**特点：**
- ✅ 最新功能和更新
- ✅ 体积小，便于修改
- ✅ 需要系统已安装 Node.js
- ✅ 使用系统的 Node.js 和依赖

**系统要求：**
- macOS 12.0 (Monterey) 或更高版本
- Node.js v24.14.0+ 已安装
- Next.js 项目依赖已安装

**开发步骤：**
```bash
# 克隆仓库
git clone https://github.com/heshuaibjcn-bit/openclaw-dashboard.git
cd macos-menubar-native

# 构建应用
./build.sh

# 打包应用
./package-dmg.sh
```

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

## 版本管理策略

本项目采用 **Git 分支 + GitHub Releases** 的双版本管理方式：

### 1. 源代码版本（main 分支）
- **位置**: [main 分支](https://github.com/heshuaibjcn-bit/openclaw-dashboard/tree/main)
- **内容**: 完整的源代码（Swift、脚本、配置文件）
- **用途**: 开发者部署和自定义构建
- **更新**: 频繁更新，包含最新功能和修复

### 2. 发布版本（GitHub Releases）
- **位置**: [Releases 页面](https://github.com/heshuaibjcn-bit/openclaw-dashboard/releases)
- **内容**: 已打包的 DMG 安装文件
- **用途**: 最终用户直接安装使用
- **更新**: 稳定版本发布

### 版本对应关系

| 版本类型 | Git Tag | Release 名称 | 文件名 |
|---------|---------|--------------|--------|
| 自包含版 | `v1.0.0-standalone` | v1.0.0-standalone | OpenClaw-Dashboard-Standalone.dmg |
| 源代码版 | `v1.0.0` | v1.0.0 | 源代码压缩包 |

### 开发流程

```bash
# 1. 开发新功能（在 main 分支）
git checkout main
# ... 进行开发和测试

# 2. 创建源代码版本标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. 构建自包含版本
./package-standalone.sh
./package-dmg-standalone.sh

# 4. 创建发布版本（包含 DMG）
gh release create v1.0.0-standalone OpenClaw-Dashboard-Standalone.dmg \
  --title "OpenClaw Dashboard - Standalone macOS App v1.0.0" \
  --notes "Release notes here..."
```

## 版本对比

| 特性 | 源代码版 | 自包含版 |
|------|---------|----------|
| 获取方式 | main 分支 | GitHub Releases |
| 大小 | ~100KB（源代码） | ~807MB（DMG） |
| Node.js | 需要安装 | 已内置 v24.14.0 |
| 依赖 | 需要 npm install | 已内置 |
| 构建工具 | Swift 编译器 | 无需 |
| 目标用户 | 开发者 | 普通用户 |
| 更新频率 | 实时更新 | 稳定版本 |
| 离线运行 | 否 | 是 |
| 自定义 | 完全支持 | 有限支持 |

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

### v1.0.0-standalone (2025-03-14)
**发布版本** - 可从 [GitHub Releases](https://github.com/heshuaibjcn-bit/openclaw-dashboard/releases/tag/v1.0.0-standalone) 下载

- ✅ 完全自包含的 macOS 应用（~807MB）
- ✅ 内置 Node.js v24.14.0 和所有依赖
- ✅ 精美的龙虾 + 眼睛图标设计
- ✅ 左键和右键点击都可显示菜单
- ✅ 实时状态监控（绿色/灰色指示器）
- ✅ 服务启动/停止功能
- ✅ 快速打开 Dashboard
- ✅ 端口配置功能（默认 3000，可自定义）
- ✅ 服务器就绪检测（支持 HTTP 2xx/3xx）
- ✅ 中文本地化界面

### v1.0.0 (源代码版本)
**开发版本** - 可从 [main 分支](https://github.com/heshuaibjcn-bit/openclaw-dashboard) 获取

- 完整的源代码
- 开发脚本和构建工具
- 便于开发者自定义和扩展

## 许可证

MIT
