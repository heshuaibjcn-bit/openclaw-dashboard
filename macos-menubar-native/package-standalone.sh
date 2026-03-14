#!/bin/bash

# OpenClaw Dashboard - 打包自包含版本脚本

set -e

APP_NAME="OpenClaw Dashboard"
APP_BUNDLE="$APP_NAME.app"
BUILD_DIR="build"
DIST_DIR="dist"
RESOURCES_DIR="$BUILD_DIR/$APP_BUNDLE/Contents/Resources"

echo "📦 开始打包自包含版本..."

# 清理旧构建
echo "🧹 清理旧构建..."
rm -rf "$BUILD_DIR" "$DIST_DIR"

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p "$BUILD_DIR/$APP_BUNDLE/Contents/MacOS"
mkdir -p "$RESOURCES_DIR"

# 编译 Swift 代码
echo "⚙️  编译 Swift 代码..."
swiftc -o "$BUILD_DIR/$APP_BUNDLE/Contents/MacOS/OpenClaw-Dashboard" \
    Sources/main.swift \
    -framework Cocoa \
    -framework AppKit \
    -O \
    -target arm64-apple-macos10.15

# 复制 Info.plist
echo "📋 复制 Info.plist..."
cp Info.plist "$BUILD_DIR/$APP_BUNDLE/Contents/"

# 设置可执行权限
chmod +x "$BUILD_DIR/$APP_BUNDLE/Contents/MacOS/OpenClaw-Dashboard"

# 检查是否需要打包 Node.js
echo ""
echo "📦 Node.js 和依赖打包..."

# 检测 Node.js 安装
if [ -f "$HOME/.nvm/versions/node/v24.14.0/bin/node" ]; then
    NODE_VERSION="v24.14.0"
    NODE_SRC="$HOME/.nvm/versions/node/$NODE_VERSION"
elif [ -f "/opt/homebrew/bin/node" ]; then
    NODE_VERSION=$(node -v)
    NODE_SRC="/opt/homebrew"
elif [ -f "/usr/local/bin/node" ]; then
    NODE_VERSION=$(node -v)
    NODE_SRC="/usr/local"
else
    echo "⚠️  未找到 Node.js，跳过打包"
    NODE_SRC=""
fi

if [ -n "$NODE_SRC" ]; then
    echo "找到 Node.js $NODE_VERSION"

    # 复制 Node.js 可执行文件
    if [ -d "$NODE_SRC" ]; then
        echo "复制 Node.js 到 Resources..."
        mkdir -p "$RESOURCES_DIR/bin"

        # 复制 node 和 npm
        cp "$NODE_SRC/bin/node" "$RESOURCES_DIR/bin/" 2>/dev/null || true
        cp "$NODE_SRC/bin/npm" "$RESOURCES_DIR/bin/" 2>/dev/null || true

        # 如果是 nvm 安装，还需要复制相关的文件
        if [[ "$NODE_SRC" == *".nvm"* ]]; then
            # 复制 nvm 安装的 node 完整结构
            echo "复制 nvm Node.js 文件..."
            cp -R "$NODE_SRC" "$RESOURCES_DIR/" 2>/dev/null || true
        fi
    fi

    # 复制项目的 node_modules
    echo "复制 node_modules..."
    DASHBOARD_PATH="/Users/alex/openclaw-dashboard"
    if [ -d "$DASHBOARD_PATH/node_modules" ]; then
        echo "正在复制，这可能需要几分钟..."
        # 使用 rsync 来高效复制
        if command -v rsync &> /dev/null; then
            rsync -av --exclude='.cache' --exclude='.local' \
                "$DASHBOARD_PATH/node_modules/" \
                "$RESOURCES_DIR/node_modules/" 2>/dev/null || \
                cp -R "$DASHBOARD_PATH/node_modules" "$RESOURCES_DIR/" 2>/dev/null || true
        else
            ditto "$DASHBOARD_PATH/node_modules" "$RESOURCES_DIR/node_modules" 2>/dev/null || true
        fi
    fi
fi

# 创建分发目录
mkdir -p "$DIST_DIR"
cp -R "$BUILD_DIR/$APP_BUNDLE" "$DIST_DIR/"

# 计算大小
APP_SIZE=$(du -sh "$DIST_DIR/$APP_BUNDLE" | cut -f1)
NODE_MODULES_SIZE=$(du -sh "$RESOURCES_DIR/node_modules" 2>/dev/null | cut -f1 || echo "0")

echo ""
echo "✅ 打包完成！"
echo ""
echo "应用位置: $DIST_DIR/$APP_BUNDLE"
echo "应用大小: $APP_SIZE"
echo "node_modules: $NODE_MODULES_SIZE"
echo ""
echo "📋 使用说明："
echo "1. 双击运行应用"
echo "2. 应用会自动查找 Node.js："
echo "   - 优先使用打包的 Node.js"
echo "   - 如未打包，使用系统的 Node.js"
echo "3. 点击菜单栏图标启动 Dashboard"
echo ""
echo "下一步："
echo "  运行 ./package-dmg-standalone.sh 创建 DMG"