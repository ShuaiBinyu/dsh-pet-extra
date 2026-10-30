# dsh-pet-extra 🐾

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/github/v/release/ShuaiBinyu/dsh-pet-extra)](https://github.com/ShuaiBinyu/dsh-pet-extra/releases)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-2B2E3A?logo=electron)](https://www.electronjs.org/)

基于 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet) 的桌面宠物增强版。本项目在原有的开源基础及动画资源上进行了深度重构，不仅扩展了更加灵动的桌面交互体验，还加入了**物理级鼠标穿透、全局快捷键控制**以及**随身 AI 聊天伴侣**功能。

## ✨ 核心特性

### 🖥️ 桌面交互增强
- **物理级鼠标穿透**：通过动态计算鼠标坐标与宠物热区（Hit-Area），透明区域完美穿透到下层桌面，不阻挡你正常的办公点击；只有当鼠标触碰宠物本体时，窗口才会实体化并响应拖拽。
- **真实桌面漫游**：不仅是原地播放动画，还能根据每条动画的动作配置（`motion.dx/dy`），让宠物在桌面上自动移动。底层采用了**亚像素累积算法**，确保移动丝滑不卡顿。
- **多屏无缝跨屏**：支持多显示器环境。通过计算人物中心点定位屏幕，跨越不同分辨率的屏幕边界也不会丢失或卡死。
- **状态机右键菜单**：右键点击宠物定住并唤出菜单，左键点击或鼠标移出窗口区域自动关闭菜单，互不干扰，体验极其顺滑。

### 🤖 AI 智能伴侣
- **随叫随到的聊天窗**：极简无边框设计，仅有对话气泡和输入框。全局快捷键一键唤出/隐藏，不打断你的心流。
- **无缝持久化记忆**：聊天记录实时落盘，即便彻底关闭聊天窗口甚至重启软件，之前的对话上下文依然保留。
- **智能上下文管理**：内置滑动窗口机制（默认保留最近 20 条对话），精准控制 Token 消耗，防止 AI 记忆过载或“变鱼”。
- **时间感知**：自动向 AI 注入真实系统时间，让它的回答更具时效性。
- **打字机效果**：流畅的等待动画与消息淡入效果。

---

## ⌨️ 快捷键与交互指南

- **`Ctrl + Shift + C` (Mac: `Cmd + Shift + C`)**：全局唤醒 / 隐藏 AI 聊天窗口。
- **`Esc`**：隐藏聊天窗口（保存当前记忆，下次秒开）。
- **`Ctrl + W` (Mac: `Cmd + W`)**：彻底销毁聊天窗口，释放内存（下次打开为全新会话）。
- **左键拖拽**：抓住宠物任意部位拖动。
- **双击宠物**：触发内置的互动动画。
- **右键宠物**：唤出设置菜单（打开聊天、配置 API、退出桌宠）。

---

## 📥 下载与安装

请前往 [Releases 页面](https://github.com/ShuaiBinyu/dsh-pet-extra/releases) 下载适合你系统的安装包。

- **Windows**: 下载 `...-setup.exe` 并双击安装。
- **macOS**: 下载 `.dmg` 文件。

> **⚠️ 必看：macOS 用户提示**
> 因为本项目未购买苹果开发者证书签名，Mac 用户首次打开时系统会提示**“已损坏，无法打开”**。这不是软件问题，请打开终端执行以下命令解除隔离（请将路径替换为你实际的 App 路径，或者键入 `sudo xattr -cr` 后将应用拖入终端）：
> ```bash
> sudo xattr -cr /Applications/dsh-pet-extra.app
> ```
> 输入登录密码后回车即可正常运行。

---

## 🛠️ 本地开发

### 环境要求
- Node.js (推荐 v22 或以上)
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/ShuaiBinyu/dsh-pet-extra.git
cd dsh-pet-extra

# 安装依赖
npm install

# 启动开发环境
npm run dev

### 编译打包
```
# For windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```
## 技术栈说明

- 前端渲染：Vue 3 + TypeScript + Vite
- 底层框架：Electron
- 动画与状态：原生 requestAnimationFrame 驱动，配合自定义拖拽 Hook (usePetDrag, usePetMotion)
- 数据持久化：electron-store (本地 JSON 文件存储)

## 来源与致谢
- 项目基础架构、动画资源来源于开源项目 dsh-pet。
- 感谢原作者 PC2005-cloud 的开源精神与提供的精美动画素材。

## License

本项目基于 MIT License 开源。

- 原始版权归 (c) 2026 PC2005-cloud 所有。
- 修改及增强部分版权归 (c) 2026 ShuaiBinyu 所有。
