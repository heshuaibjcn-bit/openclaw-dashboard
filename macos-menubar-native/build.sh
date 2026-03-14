#!/bin/bash

# OpenClaw Dashboard - macOS 菜单栏应用构建脚本

set -e

PROJECT_NAME="OpenClaw-Dashboard"
BUNDLE_NAME="OpenClaw Dashboard.app"
BUILD_DIR="build"
DIST_DIR="dist"

echo "🔨 开始构建 OpenClaw Dashboard 菜单栏应用..."

# 清理旧构建
echo "🧹 清理旧构建..."
rm -rf "$BUILD_DIR" "$DIST_DIR"

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p "$BUILD_DIR/$BUNDLE_NAME/Contents/MacOS"
mkdir -p "$BUILD_DIR/$BUNDLE_NAME/Contents/Resources"

# 编译 Swift 代码
echo "⚙️  编译 Swift 代码..."
swiftc -o "$BUILD_DIR/$BUNDLE_NAME/Contents/MacOS/$PROJECT_NAME" \
    Sources/main.swift \
    -framework Cocoa \
    -framework AppKit \
    -O \
    -target arm64-apple-macos10.15

# 复制 Info.plist
echo "📋 复制 Info.plist..."
cp Info.plist "$BUILD_DIR/$BUNDLE_NAME/Contents/"

# 设置可执行权限
chmod +x "$BUILD_DIR/$BUNDLE_NAME/Contents/MacOS/$PROJECT_NAME"

# 创建分发目录
mkdir -p "$DIST_DIR"
cp -R "$BUILD_DIR/$BUNDLE_NAME" "$DIST_DIR/"

echo ""
echo "✅ 构建成功！"
echo ""
echo "应用位置: $DIST_DIR/$BUNDLE_NAME"
echo ""
echo "使用方法："
echo "1. 双击运行: open '$DIST_DIR/$BUNDLE_NAME'"
echo "2. 或者拖拽到 Applications 文件夹"
echo ""
echo "📍 图标将显示在菜单栏右上角（蓝色圆点）"
