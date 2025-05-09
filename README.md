# DOTA Annotation Tool

这是一个基于 Vite + React 构建的图像/视频标注工具，适用于 DOTA 等数据集的标注任务。项目采用前后端分离架构，支持标注数据保存、播放控制、表单交互等功能。

---

## 📟 项目结构

```
dota_annotation/
├── backend/               # 后端代码（例如 Flask、FastAPI、Node.js 可选实现）
│   └── main.py            # 示例后端脚本
├── caption_1.json         # 示例标注数据文件
├── frontend/              # 前端项目（基于 React + Vite）
│   ├── src/components/    # 核心组件：视频播放器、标注表单等
│   └── vite.config.js     # Vite 配置
└── README.md
```

---

## 🚀 快速启动

### 1. 克隆项目

```bash
git clone https://github.com/Wangjhbh/dota_annotation.git
cd dota_annotation
```

---

### 2. 运行前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 [http://localhost:5173](http://localhost:5173)

---

## 🛠 构建和部署

构建生产环境静态资源：

```bash
npm run build
```

构建结果会输出到 `frontend/dist/` 目录。

你可以将其部署到：

* 任意静态服务器（如 nginx、Apache、Node 后端）
* Netlify、Vercel、GitHub Pages 等平台

---

## 🌐 后端配置（可选）

如果你需要保存或加载标注数据，可启用 `backend/main.py`：

```bash
# 进入 backend 目录
cd ../backend

# 运行 Python 后端（例如 Flask/FastAPI）
python main.py
```

你可以自行扩展该脚本，实现数据的存储、数据库接入等功能。

---

## 📆 依赖说明（前端）

前端使用下列主要依赖：

* React
* Vite
* localStorage (本地存储标注状态)

---

## 🧐 数据路径

/home/wjh/project/dota_annotation
/home/wjh/project/dota_annotation/caption_1.json
/home/data/下面有视频数据

启动代码

终端1:~/project/dota_annotation/backend$ uvicorn main:app --reload --host 0.0.0.0 --port 8000

终端2:~/project/dota_annotation/frontend$ npm run dev



