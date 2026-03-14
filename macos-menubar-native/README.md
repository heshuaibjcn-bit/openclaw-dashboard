# OpenClaw Dashboard - macOS 菜单栏应用

## 功能特性

- **精美图标** - 红色龙虾 + 白色眼睛设计
- **菜单栏集成** - 在 macOS 菜单栏显示
- **服务控制** - 启动/停止 Dashboard 服务
- **状态监控** - 实时显示 Dashboard 运行状态
- **快速访问** - 一键打开 Dashboard (localhost:3000)
- **轻量级** - 仅 44KB，原生 Swift 性能
- **便捷操作** - 左键或右键点击显示菜单

## 安装方法

1. 双击打开 `OpenClaw-Dashboard-1.0.0.dmg`
2. 将 `OpenClaw Dashboard` 拖拽到 Applications 文件夹
3. 从 Launchpad 或 Applications 启动应用

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

2. **启动服务**
   - 点击尝试启动 Dashboard 开发服务器
   - 如果启动失败，请使用手动方式：
     ```bash
     cd /Users/alex/openclaw-dashboard
     npm run dev
     ```

3. **停止服务**
   - 点击停止所有 Dashboard 进程

4. **打开 Dashboard**
   - 在浏览器中打开 http://localhost:3000
   - 此功能始终可用

5. **退出**
   - 完全退出菜单栏应用

## 系统要求

- macOS 10.15 (Catalina) 或更高版本
- Node.js 已安装（推荐通过 nvm 安装）
- Next.js 项目依赖已安装

## 故障排除

### 应用未显示图标
- 打开"活动监视器"查找"OpenClaw-Dashboard"进程
- 如果进程存在但图标不可见，重启应用

### 菜单无法显示
- 尝试左键点击图标
- 或者尝试右键点击图标
- 两种方式都应该能显示菜单

### 启动服务失败
如果点击"启动服务"后出现错误或无响应：

**方法 1：手动启动**
```bash
cd /Users/alex/openclaw-dashboard
npm run dev
```

**方法 2：使用启动脚本**
```bash
/Users/alex/openclaw-dashboard/macos-menubar-native/start-dashboard.sh
```

**方法 3：检查环境**
- 确保已通过 nvm 安装 Node.js
- 确保 Next.js 依赖已安装：`npm install`
- 检查端口 3000 是否被占用

### Dashboard 无法访问
- 确保 Dashboard 服务正在运行
- 尝试在浏览器访问 http://localhost:3000
- 检查防火墙设置

## 开发

### 构建应用
```bash
./build.sh
```

### 打包 DMG
```bash
./package-dmg.sh
```

### 项目结构
```
macos-menubar-native/
├── Sources/
│   └── main.swift           # 主程序代码
├── Info.plist              # 应用配置
├── build.sh                # 构建脚本
├── package-dmg.sh          # DMG 打包脚本
├── start-dashboard.sh      # Dashboard 启动脚本
├── dist/                   # 构建输出
│   └── OpenClaw Dashboard.app
└── OpenClaw-Dashboard-1.0.0.dmg  # 安装包
```

## 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 菜单栏图标 | ✅ 完美 | 精美龙虾+眼睛设计 |
| 左键点击 | ✅ 完美 | 显示菜单 |
| 右键点击 | ✅ 完美 | 显示菜单 |
| 状态检测 | ✅ 完美 | 实时检测运行状态 |
| 停止服务 | ✅ 完美 | 停止所有进程 |
| 打开 Dashboard | ✅ 完美 | 打开浏览器 |
| 启动服务 | ⚠️ 有限 | 建议手动启动 |

## 更新日志

### v1.0.0 (当前版本)
- ✅ 精美的龙虾 + 眼睛图标设计
- ✅ 左键和右键点击都可显示菜单
- ✅ Dashboard 服务状态检测
- ✅ 停止 Dashboard 功能
- ✅ 打开 Dashboard 功能
- ✅ 仅 44KB 超小体积
- ⚠️ 启动服务功能需要手动操作

## 许可证

MIT
