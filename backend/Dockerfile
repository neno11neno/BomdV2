FROM node:18

# 建立 app 資料夾
WORKDIR /app

# 先複製 package.json & lock 檔，分層加快建構
COPY package*.json ./

# 安裝 npm 套件
RUN npm install

# 安裝 PostgreSQL client（可選，若沒用到 pg_dump 可移除）
RUN apt-get update && apt-get install -y postgresql-client

# 再複製其他檔案
COPY . .

# 啟動應用程式
CMD ["node", "index.js"]
