# AniVoice

[한국어](./README.md) | [English](./README.en.md) | [日本語](./README.ja.md)

**将你喜欢的动漫配音成任何语言。** 一个开源Web服务，在保留角色原声的同时，支持8种以上语言的AI配音。

基于 [Perso.ai](https://developers.perso.ai) API 构建。

## 主要功能

- **AI配音** — 上传视频后，保持角色声音特征进行多语言配音
- **口型同步** — 自动调整口型以匹配配音音频
- **字幕编辑** — 逐句编辑翻译字幕并重新生成语音
- **资料库** — 发布配音成果，与其他用户分享
- **积分系统** — 基于视频时长的按量计费
- **多语言界面** — 支持韩语、英语、日语、中文

## 支持的配音语言

日语、韩语、英语、西班牙语、葡萄牙语、印度尼西亚语、阿拉伯语、中文

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Vite, Tailwind CSS 4 |
| 状态管理 | Zustand |
| 路由 | React Router 7 |
| 认证 | Firebase Authentication |
| 数据库 | Turso (libSQL) |
| AI配音 | Perso.ai API |
| 部署 | Vercel (Serverless Functions) |
| 测试 | Vitest |
| 国际化 | i18next |

## 快速开始

### 前提条件

- Node.js 18+
- [Perso.ai](https://developers.perso.ai) API密钥
- Firebase项目（用于认证）
- Turso数据库（可选 — 支持本地模拟模式）

### 安装

```bash
git clone https://github.com/your-username/anivoice.git
cd anivoice
npm install
```

### 环境变量配置

复制 `.env.example` 创建 `.env` 文件。

```bash
cp .env.example .env
```

```env
# Perso API（服务端）
XP_API_KEY=your_perso_api_key
PERSO_API_BASE_URL=https://api.perso.ai

# Perso代理路径（客户端）
VITE_PERSO_PROXY_PATH=/api/perso

# Firebase（客户端）
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Firebase（服务端 — 令牌验证）
FIREBASE_PROJECT_ID=your_project_id

# Turso DB
TURSO_DATABASE_URL=libsql://your_db.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```

> 无需Firebase也可使用模拟认证模式进行本地开发。

### 开发服务器

```bash
npm run dev
```

### 构建

```bash
npm run build
npm run preview
```

### 测试

```bash
npm run test
npm run test:watch
```

## 项目结构

```
anivoice/
├── api/                    # Vercel Serverless Functions
│   ├── _lib/               # 共享工具（数据库、认证、积分）
│   ├── user/               # 用户API
│   ├── projects/           # 项目CRUD + 发布
│   ├── library/            # 公开资料库
│   ├── credits/            # 积分扣除·购买·记录
│   ├── tags/               # 标签列表
│   └── perso.ts            # Perso API代理
├── src/
│   ├── components/         # UI组件
│   ├── pages/              # 页面组件
│   ├── services/           # API客户端（Perso、Firebase、后端）
│   ├── stores/             # Zustand存储
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   ├── i18n/               # 翻译文件
│   ├── types/              # TypeScript类型定义
│   └── App.tsx             # 路由 & 布局
├── .env.example            # 环境变量模板
├── vercel.json             # Vercel部署配置
└── vite.config.ts          # Vite配置（含代理）
```

## 配音工作流

```
上传视频 → 语言设置 → AI配音 → 字幕编辑 → 下载/分享
```

1. **上传** — 将MP4、MOV、WebM文件上传至Azure Blob Storage
2. **设置** — 选择源语言（自动检测）+ 目标语言，开关口型同步
3. **配音** — 通过Perso API进行翻译和配音，实时轮询进度
4. **编辑** — 逐句修改翻译结果，重新生成语音
5. **结果** — 下载配音视频、音频、字幕，或发布到资料库

## API架构

Perso API密钥仅在服务端使用。客户端请求通过Vite代理（开发）或Vercel Serverless Functions（生产）进行转发。

```
[客户端] → /api/perso/* → [Vercel Function] → api.perso.ai
                           (注入XP-API-KEY)
```

## 部署

部署到Vercel：

1. 将GitHub仓库连接到Vercel
2. 设置环境变量（参考 `.env.example`）
3. 自动部署完成

安全头、SPA路由和API重写已在 `vercel.json` 中配置。

## 参与贡献

欢迎贡献！请按照以下步骤：

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 提交规范

- `feat:` 新功能
- `fix:` 修复Bug
- `refactor:` 代码重构
- `chore:` 构建或配置更改
- `docs:` 文档更新

## 许可证

MIT License。可自由使用和修改。

## 致谢

- [Perso.ai](https://perso.ai) — AI配音引擎
- [Firebase](https://firebase.google.com) — 认证
- [Turso](https://turso.tech) — 数据库
- [Vercel](https://vercel.com) — 部署平台
