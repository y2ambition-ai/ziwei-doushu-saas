#!/bin/bash

# 紫微斗数 SaaS - 开发环境启动脚本
# 使用方法: ./init.sh

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║  紫微斗数 SaaS - 开发环境启动              ║"
echo "╚═══════════════════════════════════════════╝"

# 检查 Node.js 版本
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 需要 Node.js 18+"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 未安装 pnpm，正在安装..."
    npm install -g pnpm
fi
echo "✅ pnpm 版本: $(pnpm -v)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
pnpm install

# 检查环境变量
echo ""
echo "🔐 检查环境变量..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  .env.local 不存在，从 .env.example 复制..."
        cp .env.example .env.local
        echo "📝 请编辑 .env.local 填入真实配置"
    else
        echo "⚠️  未找到 .env.example，请手动创建 .env.local"
    fi
else
    echo "✅ .env.local 已存在"
fi

# 数据库迁移 (如果 Prisma 已配置)
echo ""
echo "🗄️  检查数据库..."
if [ -f "prisma/schema.prisma" ]; then
    echo "运行 Prisma 生成..."
    pnpm prisma generate

    if [ -n "$DATABASE_URL" ]; then
        echo "推送数据库 schema..."
        pnpm prisma db push --skip-generate
    else
        echo "⚠️  DATABASE_URL 未设置，跳过数据库迁移"
    fi
else
    echo "⚠️  Prisma schema 不存在，跳过"
fi

# 启动开发服务器
echo ""
echo "🚀 启动开发服务器..."
echo "═══════════════════════════════════════════"
echo ""

pnpm dev
