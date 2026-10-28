# dsh-pet-extra 🐾

基于 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet) 的桌面宠物增强版。基于 Electron + Vue 3 + TypeScript 构建。

本项目在 dsh-pet 的开源基础及动画资源上进行了深度重构，扩展了更加灵动的桌面交互体验，并优化了底层窗口控制逻辑。

## ✨ 核心特性

- **真实桌面漫游**：不仅是原地播放动画，还能根据每条动画的动作配置（`motion.dx/dy`），让宠物在桌面上自动移动。
- **多屏无缝跨屏**：支持多显示器环境。通过计算人物中心点定位屏幕，跨越不同分辨率的屏幕边界也不会丢失或卡死。
- **精准点击热区**：通过计算画面实际区域，只有宠物本体区域能响应点击/拖拽，周围透明区域完美穿透到桌面，不影响正常办公操作。
- **平滑过渡**：切换动画时带有淡入淡出效果，动作衔接不突兀。
- **丰富的内置动画**：内置 100+ 个待机、工作、节日互动动画（来源于原项目）。

## 🛠️ 环境要求

- Node.js (推荐 v18 或以上)
- npm 或 yarn

## 🚀 快速开始

### Install
```
$ npm install
```

### Development
```
$ npm run dev
```
### Build
```
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 来源与致谢
- 项目基础架构、动画资源来源于开源项目 dsh-pet。
- 感谢原作者 PC2005-cloud 的开源精神与提供的精美动画素材。

## License

本项目基于 MIT License 开源。

- 原始版权归 (c) 2026 PC2005-cloud 所有。
- 修改及增强部分版权归 (c) 2026 ShuaiBinyu 所有。