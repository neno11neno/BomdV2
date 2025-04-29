# 🛠️ 步驟說明（超清楚）

### 前端
```
docker build -t md-collab-frontend ./frontend
docker save -o frontend.tar md-collab-frontend
```

### 後端
```
docker build -t md-collab-backend ./backend
docker save -o backend.tar md-collab-backend
```


## 🐧 在 Linux 離線機器中執行
```
docker load -i frontend.tar
docker load -i backend.tar
```
