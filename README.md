# DsPet - 桌面智能宠物

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Release](https://img.shields.io/github/v/release/ShuaiBinyu/dsh-pet-extra)](https://github.com/ShuaiBinyu/dsh-pet-extra/releases)

DsPet 是一款基于 Electron + Vue 3 的桌面宠物应用。角色可以在桌面自由拖拽和漫游，支持透明鼠标穿透、丰富互动动画，以及使用兼容 OpenAI 格式的模型进行本地或云端 AI 对话。

项目灵感来源于 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet)，保留并增强桌宠交互体验，并加入原生聊天窗口、语音合成、系统状态感知和自动位移等功能。

## 功能特性

### 桌面交互

- 无边框透明窗口，始终置顶显示
- 鼠标穿透未命中的透明区域，仅人物热区接收交互
- 左键拖拽移动，拖拽时暂停自动位移并保留进度
- 单击切换互动动画
- 动画可携带位移参数，在工作区内平滑漫游
- 屏幕边界限制与多显示器支持
- 右键菜单支持打开聊天、打开设置和退出应用

### AI 聊天

- 支持 DeepSeek、Ollama 等兼容 OpenAI `chat/completions` 格式的服务
- 支持自定义 API Base URL 和模型名称
- 聊天记录持久化到本地，重启应用后可继续查看最近聊天
- 使用最多 21 条上下文记录，包括系统提示词
- 自动向模型提供当前日期和时间
- 支持一键清空聊天记忆
- 聊天窗口支持透明无边框界面、打字状态和输入框自动聚焦

### 语音合成

- 优先使用火山引擎豆包语音
- 火山引擎不可用或未配置时，降级使用 Microsoft Edge TTS（晓伊）
- 支持切换 Vivi、甜美小源、湾湾小何等音色
- 火山引擎音频保存到本地缓存，Edge TTS 失败时显示文字气泡
- 缓存最多保留 500 条；设置页可查看占用并一键清理
- 检测系统空闲状态；用户恢复操作时停止当前语音和气泡

## 快捷键与操作

| 操作 | 快捷键或方式 |
| --- | --- |
| 显示或隐藏 AI 聊天窗口 | `Ctrl+Shift+C` / `Cmd+Shift+C` |
| 隐藏聊天窗口并保留记忆 | `Esc` |
| 彻底销毁聊天窗口 | `Ctrl+W` / `Cmd+W` |
| 聊天窗口发送消息 | `Enter` |
| 聊天窗口换行 | `Shift+Enter` |
| 左键拖拽桌宠 | 按住桌宠拖动 |
| 打开桌宠菜单 | 在桌宠上点击鼠标右键 |

## 下载与安装

前往 [GitHub Releases](https://github.com/ShuaiBinyu/dsh-pet-extra/releases) 下载对应版本：

- Windows：`DsPet-Setup-<version>.exe`
- macOS：`DsPet-<version>-<arch>.dmg`

### macOS 未签名应用提示

当前打包配置未启用 Apple Developer 代码签名和公证。首次打开未签名的 `.app` 时，macOS 可能提示“已损坏，无法打开”或阻止运行。

如果应用已安装到“应用程序”中，可在终端执行：

```bash
sudo xattr -cr /Applications/DsPet.app
```

如果实际安装名称不同，请将上面的路径替换为应用的实际路径。

> macOS 上鼠标穿透、全局快捷键、多显示器等行为可能受系统权限和窗口管理策略影响。

## 应用配置

在桌宠上右键，选择“配置 API”，即可设置以下内容：

### OpenAI 兼容大模型

| 字段 | 示例 | 说明 |
| --- | --- | --- |
| API Key | `sk-...` | 云端服务需要；本地 Ollama 可留空 |
| Base URL | `https://api.deepseek.com` | 会在末尾拼接 `/chat/completions` |
| Model | `deepseek-chat` | 填写服务支持的模型名 |

本地 Ollama 示例：

```text
Base URL: http://127.0.0.1:11434/v1
API Key: 留空
Model: qwen2.5:7b
```

API Key 和火山引擎 Access Token 会通过 Electron `safeStorage` 加密后保存；普通配置和聊天记录保存在 Electron 用户数据目录中。

### 火山引擎豆包语音

在设置页填写：

- 火山引擎 APP ID
- 火山引擎 Access Token
- 豆包语音音色

未填写火山引擎凭证时，应用会尝试使用 Edge TTS。未配置云端大模型且 Base URL 非本地地址时，发送消息会提示先配置 API。

## 本地开发

### 环境要求

- Node.js 24（与 GitHub Actions 发布流程一致）
- npm
- macOS 或 Windows 平台的本地桌面环境

### 安装与运行

```bash
git clone https://github.com/ShuaiBinyu/dsh-pet-extra.git
cd dsh-pet-extra
npm install
npm run dev
```

## 编译与打包

项目已接入 electron-builder。打包前会先执行类型检查和 Electron/Vite 构建。

```bash
# 创建未打包目录版本
npm run build:unpack

# 打包 Windows 安装程序
npm run build:win

# 打包 macOS DMG
npm run build:mac

# 打包 Linux AppImage、Snap 和 deb
npm run build:linux
```

产物默认生成在 `dist/` 目录。当前仓库中的 Windows 和 macOS 构建配置分别会生成：

- Windows：`DsPet-Setup-<version>.exe`
- macOS：`DsPet-<version>-<arch>.dmg`

打包前建议确认：

1. `package.json` 中的 `version` 与本次发布版本一致
2. `electron-builder.yml` 中的应用 ID、名称和图标正确
3. 在干净环境中通过 `npm run typecheck`
4. 在目标平台上实际验证安装、启动和核心功能

## 自动发布

仓库提供 GitHub Actions 自动构建与发布流程：

- 推送 `v*` 标签时触发
- macOS 和 Windows 分别在对应 Runner 上构建
- 构建产物通过 electron-builder 自动上传到 GitHub Release
- 需要仓库提供工作流写入 Release 的权限和 `GITHUB_TOKEN`

发布示例：

```bash
git add .
git commit -m "chore: release v1.0.5"
npm version 1.0.5
git push origin main
git push origin v1.0.5
```

建议先确认提交中包含需要发布的更新，然后再执行版本标签操作。若仓库当前未包含提交版本变更，`npm version` 可能不会创建预期的新标签。

如果需要手动上传，可运行目标平台的打包命令，然后在 GitHub 仓库的 Releases 页面创建新 Release，并附加 `dist/` 中的产物。

## 技术栈

- Electron
- Vue 3
- TypeScript
- Vite / electron-vite
- electron-store
- electron-builder
- Electron `safeStorage`
- 火山引擎 TTS WebSocket 协议
- Microsoft Edge TTS

主要目录：

```text
src/main/               主进程、窗口、IPC、存储和服务
src/preload/            渲染进程安全 API 暴露
src/renderer/           Vue 桌面宠物与聊天界面
resources/              应用运行资源
build/                  electron-builder 图标和 macOS 权限配置
cartoon-role/           鲸洛可角色版权说明
.github/workflows/      Windows 与 macOS 自动构建流程
```

## 安全与隐私

- 聊天消息保存在本地 Electron 配置中
- API Key 和火山引擎 Access Token 使用平台加密存储
- 聊天和语音请求需要网络连接时会直接访问用户配置的服务
- 火山引擎和 Edge TTS 返回的音频可能缓存到本机
- 发布时不要提交任何真实 API Key、Access Token 或个人配置文件

## 来源与许可

- 项目创作灵感和基础实现来源于 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet)
- 项目增强与修改版权归 ShuaiBinyu
- 原项目基础版权归 PC2005-cloud

**许可说明：**

- 源代码使用 MIT License，见 [LICENSE](./LICENSE)
- 原始字符“鲸洛可（Whiloco）”及角色相关视觉资产不属于 MIT License
- 角色资产仅按角色目录中的独立许可提供，见 [cartoon-role/LICENSE](./cartoon-role/LICENSE)
- 未经授权，不得将角色视觉资产用于商业用途或以第三方名义重新发布
