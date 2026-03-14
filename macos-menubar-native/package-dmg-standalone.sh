#!/bin/bash

# OpenClaw Dashboard - 打包自包含 DMG 脚本

set -e

APP_NAME="OpenClaw Dashboard"
DMG_NAME="OpenClaw-Dashboard-Standalone"
DMG_TEMP_DIR="dmg-temp"
SOURCE_APP="dist/OpenClaw Dashboard.app"

echo "📦 开始创建自包含 DMG 安装包..."

# 检查应用是否存在
if [ ! -d "$SOURCE_APP" ]; then
    echo "❌ 错误: 找不到应用 $SOURCE_APP"
    echo "请先运行 ./package-standalone.sh"
    exit 1
fi

# 清理旧的 DMG
rm -f "$DMG_NAME.dmg"
rm -rf "$DMG_TEMP_DIR"

# 创建临时 DMG 目录
mkdir -p "$DMG_TEMP_DIR"

# 复制应用到临时目录
echo "📋 复制应用 (这可能需要几分钟)..."
cp -R "$SOURCE_APP" "$DMG_TEMP_DIR/"

# 创建 Applications 链接
echo "🔗 创建 Applications 链接..."
ln -s /Applications "$DMG_TEMP_DIR/Applications"

# 创建 README
cat > "$DMG_TEMP_DIR/README.txt" << 'EOF'
OpenClaw Dashboard - macOS 菜单栏应用
===================================

安装方法：
1. 将 "OpenClaw Dashboard" 拖拽到 Applications 文件夹
2. 从 Launchpad 启动应用

功能说明：
- 菜单栏图标：红色龙虾 + 白色眼睛
- 左键或右键点击图标显示菜单
- 查看运行状态
- 启动/停止 Dashboard
- 快速打开 Dashboard

系统要求：
- macOS 10.15 (Catalina) 或更高版本
- 已包含 Node.js 运行时
- 已包含所有依赖

首次使用：
1. 启动应用后，点击菜单栏图标
2. 选择"启动服务"
3. 等待 3-5 秒让服务完全启动
4. 点击"打开 Dashboard"查看界面

注意：
- 此版本已包含所有依赖，可离线运行
- 应用大小约 1.7GB（包含完整 node_modules）
- 首次启动可能需要 10-15 秒

技术支持：
https://github.com/heshuaibjcn-bit/openclaw-dashboard
EOF

# 创建 DMG
echo "💿 创建 DMG 文件..."
hdiutil create \
    -volname "$APP_NAME" \
    -srcfolder "$DMG_TEMP_DIR" \
    -ov \
    -format UDZO \
    "$DMG_NAME.dmg"

# 清理临时目录
rm -rf "$DMG_TEMP_DIR"

APP_SIZE=$(du -sh "$DMG_NAME.dmg" | cut -f1)

echo ""
echo "✅ 自包含 DMG 创建成功！"
echo ""
echo "文件位置: $DMG_NAME.dmg"
echo "文件大小: $APP_SIZE"
echo ""
echo "📋 安装方法："
echo "1. 双击打开 $DMG_NAME.dmg"
echo "2. 将 $APP_NAME 拖拽到 Applications 文件夹"
echo "3. 从 Launchpad 启动应用"
echo ""
echo "✨ 特点："
echo "- 完全自包含，无需安装 Node.js"
echo "- 包含所有依赖（node_modules）"
echo "- 包含 Node.js 运行时"
echo "- 一键安装，开箱即用"