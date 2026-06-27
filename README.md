# 千年诗海 · Ocean of Poetry

> 一片可以漫游的中国古诗词星海。每一位诗人是一颗星，同时代的诗人以淡金的光线相连，构成一个个星座。

沉浸式的古诗词探索网页：深墨蓝的海夜背景、低饱和的雾蓝星云、淡金微光与衬线字，克制、安静，像一座数字艺术展。不是普通的古诗搜索站。

第一版精选 **121 首**诗词，涵盖 **31 位**诗人、**5 个**朝代（先秦、唐、五代、宋、清）。

## ✨ 功能

- **诗海星图**：可拖拽、可缩放的二维诗人星图（鼠标滚轮 / 双指缩放）。星点为诗人，悬停呼吸发光，点击查看详情。
- **诗人详情**：朝代、生卒年、风格标签、代表诗作、现代释义、收藏。
- **今日一诗**：每天固定一首，可随机换一首。
- **按情绪寻找诗句**：孤独 / 思念 / 失眠 / 恋爱 / 自由 / 低落 / 治愈 / 勇气 / 离别 / 旷达。
- **穿越千年的诗词长河**：朝代时间轴与诗人 / 作品统计，可按朝代筛选星图。
- **主题漫游**：月 / 江 / 山 / 酒 / 春 / 雨 / 故乡 / 夜 / 战争 / 自然 / 人生。
- **搜索**：诗句、诗人、关键词。
- **收藏**：基于 `localStorage`，无需登录、无后端。
- 桌面端三栏布局，移动端自适应（iPhone 友好）。

## 🛠 技术栈

React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · 原生 Canvas 2D 星图

> 星图刻意采用 **Canvas 2D** 而非 WebGL / R3F：对一张二维星图 + 粒子星云而言更轻量，移动端更省电、更流畅。

## 🚀 开发

```bash
npm install
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 生产构建到 dist/
npm run preview    # 预览生产构建
```

## 📜 数据来源与版权（重要）

诗词正文**不是手工录入或由模型生成**，而是从开源数据集中提取、核对而来：

- **正文 / 题目 / 作者 / 朝代**：取自开源项目 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（唐诗三百首、宋词三百首、五代南唐、纳兰性德、诗经、楚辞等子集），繁体经 [OpenCC](https://github.com/BYVoid/OpenCC) 转换为简体，并对异体字（如 `猨→猿`、`衮衮→滚滚`）做了规整、剥离了编校方括号。
- **情绪标签 / 主题标签 / 现代释义**：为本项目**编者标注**，属主观解读，仅供欣赏参考，并非史料。
- 个别说明：李白《静夜思》采用数据集中的学术原版「床前看月光……举头望山月」，而非课本流行的「明月光……明月」版本。陶渊明（东晋）等不在该数据集中的作者，本版暂未收录，未来从可信来源补充。

数据可完整复现：

```bash
# 1. 克隆数据集（约 450MB），并指向它
git clone --depth 1 https://github.com/chinese-poetry/chinese-poetry.git
CP_DIR=./chinese-poetry npm run data:index   # 归一化 + 简体化，生成候选索引
npm run data:build                            # 按 pipeline/selection.json 提取 + 合并标注
npm run data:validate                         # 校验：空值/重复/标签合法/释义≤60字
```

- `pipeline/selection.json` — 选诗清单（作者 + 题目，必要时附首句消歧）
- `pipeline/annotations.json` — 编者标注（情绪 / 主题 / 释义），按 id 关联
- `src/data/poems.json` — 最终数据（构建产物）

### 许可

- 代码：MIT
- 诗词正文：来源 chinese-poetry，遵循其许可（CC BY-NC 等），**仅限非商业用途**。
- 编者标注（情绪 / 主题 / 释义）：CC BY-NC 4.0。

## 📦 部署到 GitHub Pages

仓库已内置 GitHub Actions（`.github/workflows/deploy.yml`）：推送到 `main` 后，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions** 即可自动部署。

本站绑定自定义域名 **shihai.snowqin.com**（`public/CNAME`），故 `base` 为 `/`。若要部署到项目页 URL（`用户名.github.io/仓库名/`），用环境变量覆盖：

```bash
BASE_PATH=/你的仓库名/ npm run build
```

---

致谢 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 及其贡献者。灵感源自把诗放进一片可漫游星海的想象。
