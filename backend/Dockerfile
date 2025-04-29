FROM node:18

# 建立 app 資料夾並加入程式
WORKDIR /app
COPY . .

# 安裝 PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# 安裝 npm 套件
RUN npm install

# 啟動應用程式
CMD ["node", "index.js"]
