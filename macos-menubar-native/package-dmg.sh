#!/bin/bash

# OpenClaw Dashboard - DMG 打包脚本

set -e

APP_NAME="OpenClaw Dashboard"
APP_BUNDLE="$APP_NAME.app"
DMG_NAME="OpenClaw-Dashboard-1.0.0"
DMG_TEMP_DIR="dmg-temp"
SOURCE_APP="dist/$APP_BUNDLE"

echo "📦 开始创建 DMG 安装包..."

# 检查应用是否存在
if [ ! -d "$SOURCE_APP" ]; then
    echo "❌ 错误: 找不到应用 $SOURCE_APP"
    echo "请先运行 ./build.sh 构建应用"
    exit 1
fi

# 清理旧的 DMG
rm -f "$DMG_NAME.dmg"
rm -rf "$DMG_TEMP_DIR"

# 创建临时 DMG 目录
mkdir -p "$DMG_TEMP_DIR"

# 复制应用到临时目录
echo "📋 复制应用..."
cp -R "$SOURCE_APP" "$DMG_TEMP_DIR/"

# 创建 Applications 链接
echo "🔗 创建 Applications 链接..."
ln -s /Applications "$DMG_TEMP_DIR/Applications"

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

echo ""
echo "✅ DMG 创建成功！"
echo ""
echo "文件位置: $DMG_NAME.dmg"
echo "文件大小: $(du -h "$DMG_NAME.dmg" | cut -f1)"
echo ""
echo "安装方法："
echo "1. 双击打开 $DMG_NAME.dmg"
echo "2. 将 $APP_NAME 拖拽到 Applications 文件夹"
echo "3. 从 Launchpad 或 Applications 启动应用"
echo ""
echo "使用说明："
echo "- 应用图标会显示在菜单栏右上角（蓝色圆点 ◉）"
echo "- 点击图标显示菜单"
echo "- 可以启动/停止 Dashboard 服务"
echo "- 可以快速打开 Dashboard (http://localhost:3000)"
