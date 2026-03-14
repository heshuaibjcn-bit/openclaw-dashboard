#!/bin/bash

# OpenClaw Dashboard 启动脚本

# 记录启动日志
echo "[$(date)] 启动 Dashboard..." >> /tmp/dashboard-start.log

# 切换到项目目录
cd /Users/alex/openclaw-dashboard || {
    echo "[$(date)] 错误：无法切换到项目目录" >> /tmp/dashboard-start.log
    exit 1
}

# 加载 nvm 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 记录环境信息
echo "[$(date)] PATH: $PATH" >> /tmp/dashboard-start.log
echo "[$(date)] NVM_DIR: $NVM_DIR" >> /tmp/dashboard-start.log
echo "[$(date)] 当前目录: $(pwd)" >> /tmp/dashboard-start.log
which npm >> /tmp/dashboard-start.log 2>&1

# 启动 Dashboard
echo "[$(date)] 执行 npm run dev..." >> /tmp/dashboard-start.log
npm run dev 2>&1 | tee -a /tmp/dashboard-start.log &

# 记录进程 ID
echo "[$(date)] Dashboard 进程已启动" >> /tmp/dashboard-start.log