# Personal Blog

一个前后端分离的个人博客项目，仓库当前仅保留前端与后端开发所需代码及配置文件。

## 项目结构

```text
.
├─ frontend/    # React + Vite 前端
└─ backend/     # Spring Boot 后端
```

## 技术栈

### 前端

- React 18
- React Router DOM
- Vite

### 后端

- Spring Boot 3
- Spring Security
- MyBatis-Plus
- MySQL
- Redis
- Elasticsearch
- Knife4j

## 运行环境

### 前端

- Node.js 18+
- npm

### 后端

- JDK 17
- Maven 3.9+
- MySQL 8.x
- Redis
- Elasticsearch

## 本地启动

### 1. 启动后端

进入 `backend` 目录后运行：

```bash
mvn spring-boot:run
```

默认端口：

```text
8080
```

当前 `application.yml` 中已配置的本地依赖示例：

- MySQL: `localhost:3306/personal_blog`
- Redis: `localhost:6379`

### 2. 启动前端

进入 `frontend` 目录后运行：

```bash
npm install
npm run dev
```

### 3. 前端打包

```bash
cd frontend
npm run build
```

### 4. 后端打包

```bash
cd backend
mvn clean package
```

## 说明

- 仓库已通过 `.gitignore` 排除设计稿、文档目录、IDE 配置以及构建产物。
- `backend/src/main/resources/application.yml` 中包含本地开发默认配置，提交到公开仓库前建议根据实际情况调整数据库、Redis 和 JWT 配置。
