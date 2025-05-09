from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# 允许跨域，前端才能访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路径配置
DATA_DIR = "/home/dataset/DoTA/Video"
ANNOTATION_FILE = "/home/wjh/project/dota_annotation/caption_1.json"

# 加载全部注释数据
def load_annotations():
    if not os.path.exists(ANNOTATION_FILE):
        return []
    with open(ANNOTATION_FILE, "r") as f:
        return json.load(f)

# 保存所有注释数据
def save_annotations(data):
    with open(ANNOTATION_FILE, "w") as f:
        json.dump(data, f, indent=2)

# 工具：从视频名提取短名字
def extract_video_name(full_path):
    return os.path.basename(full_path)

# 工具：找到指定视频名字对应的注释条目
def find_annotation_by_video_name(annotations, video_name):
    for idx, entry in enumerate(annotations):
        if extract_video_name(entry.get("video", "")) == video_name:
            return idx, entry
    return None, None

# 获取所有视频名字
@app.get("/videos")
def list_videos():
    annotations = load_annotations()
    video_names = [extract_video_name(item["video"]) for item in annotations]
    return {"videos": video_names}

@app.get("/annotations/all")
def get_all_annotations():
    annotations = load_annotations()
    return annotations

# 获取单个视频对应的注释数据
@app.get("/annotations/{video_name}")
def get_annotation(video_name: str):
    annotations = load_annotations()
    idx, entry = find_annotation_by_video_name(annotations, video_name)
    if entry is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return entry

# 保存单个视频对应的注释数据
@app.post("/annotations/{video_name}")
def update_annotation(video_name: str, annotation: dict):
    annotations = load_annotations()
    idx, entry = find_annotation_by_video_name(annotations, video_name)
    if entry is None:
        raise HTTPException(status_code=404, detail="Annotation not found")

    # 更新这一条
    annotations[idx] = annotation
    save_annotations(annotations)
    return {"status": "success"}

# 静态文件托管，把服务器目录 /home/dataset/DoTA/Video 映射到 /videos
app.mount("/videos", StaticFiles(directory="/home/dataset/DoTA/Video"), name="videos")
