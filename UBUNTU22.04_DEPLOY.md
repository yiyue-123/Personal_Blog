# Ubuntu 22.04 部署文档

本文档用于将当前个人博客项目部署到 **Ubuntu 22.04 LTS** 服务器。

项目结构：

```text
.
├─ frontend/    # React + Vite 前端
└─ backend/     # Spring Boot 后端
```

当前项目实际依赖：

- 前端：React 18、Vite
- 后端：Spring Boot 3、Spring Security、MyBatis-Plus
- 数据库：MySQL 8.x
- 缓存：Redis
- Web 服务：Nginx
- 运行环境：JDK 17、Node.js 18+

注意：**当前项目已经不再使用 Elasticsearch**，部署时无需安装 ES。

---

## 1. 推荐部署架构

推荐采用以下方式部署：

- `Nginx` 负责：
  - 提供前端静态文件
  - 反向代理后端 `/api`
- `Spring Boot Jar` 作为后端服务运行在 `8080`
- `MySQL` 存储业务数据
- `Redis` 提供缓存
- `systemd` 托管后端进程

整体结构：

```text
Browser
  -> Nginx :80 / :443
      -> /           前端静态文件
      -> /api        Spring Boot :8080
```

---

## 2. 服务器准备

建议最低配置：

- 2 CPU
- 2 GB RAM
- 20 GB SSD

先更新系统：

```bash
sudo apt update && sudo apt upgrade -y
```

安装基础工具：

```bash
sudo apt install -y curl wget git unzip vim ufw
```

---

## 3. 安装运行环境

### 3.1 安装 JDK 17

```bash
sudo apt install -y openjdk-17-jdk
java -version
```

确认输出中包含 `17`。

### 3.2 安装 Maven

```bash
sudo apt install -y maven
mvn -version
```

### 3.3 安装 Node.js 18+

推荐使用 NodeSource 安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 3.4 安装 MySQL

```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
```

### 3.5 安装 Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
```

返回 `PONG` 即正常。

### 3.6 安装 Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. 创建部署目录

建议使用以下目录结构：

```bash
sudo mkdir -p /opt/personal-blog
sudo mkdir -p /opt/personal-blog/backend
sudo mkdir -p /opt/personal-blog/frontend
sudo mkdir -p /opt/personal-blog/logs
```

如果你使用普通用户部署，比如 `ubuntu`：

```bash
sudo chown -R $USER:$USER /opt/personal-blog
```

---

## 5. 上传项目代码

可以选择两种方式。

### 方式 A：直接 git clone

```bash
cd /opt/personal-blog
git clone <你的仓库地址> source
```

### 方式 B：本地打包上传

把本地项目上传到服务器，例如：

```bash
scp -r 个人博客 user@your-server:/opt/personal-blog/source
```

后续命令默认项目代码目录为：

```bash
/opt/personal-blog/source
```

---

## 6. 初始化数据库

登录 MySQL：

```bash
sudo mysql
```

如果你使用密码登录：

```bash
mysql -u root -p
```

执行：

```sql
CREATE DATABASE IF NOT EXISTS personal_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'blog_user'@'localhost' IDENTIFIED BY '请替换成强密码';
GRANT ALL PRIVILEGES ON personal_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

然后导入项目表结构：

```bash
mysql -u root -p personal_blog < /opt/personal-blog/source/backend/src/main/resources/schema.sql
```

说明：

- 该 SQL 会创建业务表
- 其中包含注册申请表 `t_user_register_application`
- 也包含初始化分类数据

---

## 7. 配置后端

当前后端默认配置文件在：

[application.yml](C:/Users/28995/Desktop/个人博客/backend/src/main/resources/application.yml)

部署时建议不要直接使用开发环境配置。推荐在服务器上新建一个独立配置文件：

```bash
mkdir -p /opt/personal-blog/backend/config
vim /opt/personal-blog/backend/config/application-prod.yml
```

建议内容如下：

```yaml
server:
  port: 8080

spring:
  application:
    name: personal-blog-backend
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/personal_blog?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: blog_user
    password: 请替换成数据库密码
    driver-class-name: com.mysql.cj.jdbc.Driver
  data:
    redis:
      host: 127.0.0.1
      port: 6379
  cache:
    type: redis

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      id-type: auto

knife4j:
  enable: true

blog:
  jwt:
    secret: 请替换成长度足够的随机密钥
    expire-seconds: 86400
    issuer: personal-blog
  admin:
    username: admin
    password: 请替换成管理员初始密码
    nickname: Administrator
```

说明：

- 首次启动时，如果系统中没有 `ADMIN` 账号，后端会自动初始化管理员账号
- 生产环境务必修改 `blog.jwt.secret`
- 生产环境务必修改 `blog.admin.password`

---

## 8. 打包后端

进入后端目录：

```bash
cd /opt/personal-blog/source/backend
mvn clean package -DskipTests
```

打包完成后，Jar 通常位于：

```bash
target/blog-backend-0.0.1-SNAPSHOT.jar
```

复制到部署目录：

```bash
cp target/blog-backend-0.0.1-SNAPSHOT.jar /opt/personal-blog/backend/blog-backend.jar
```

---

## 9. 启动后端（手动验证）

先手动运行一次，确认配置正常：

```bash
java -jar /opt/personal-blog/backend/blog-backend.jar \
  --spring.config.location=file:/opt/personal-blog/backend/config/application-prod.yml
```

看到类似日志说明启动成功：

```text
Tomcat started on port(s): 8080
Started BlogApplication
```

测试接口：

```bash
curl http://127.0.0.1:8080/api/articles
```

测试 Knife4j：

```bash
curl http://127.0.0.1:8080/v3/api-docs
```

如果接口正常，再继续配置 `systemd`。

---

## 10. 配置 systemd 托管后端

创建服务文件：

```bash
sudo vim /etc/systemd/system/personal-blog-backend.service
```

写入：

```ini
[Unit]
Description=Personal Blog Backend
After=network.target mysql.service redis-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/personal-blog/backend
ExecStart=/usr/bin/java -jar /opt/personal-blog/backend/blog-backend.jar --spring.config.location=file:/opt/personal-blog/backend/config/application-prod.yml
Restart=always
RestartSec=5
SuccessExitStatus=143
StandardOutput=append:/opt/personal-blog/logs/backend.log
StandardError=append:/opt/personal-blog/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

如果你的登录用户不是 `ubuntu`，把 `User=ubuntu` 改成实际用户。

重新加载并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable personal-blog-backend
sudo systemctl start personal-blog-backend
sudo systemctl status personal-blog-backend
```

查看日志：

```bash
tail -f /opt/personal-blog/logs/backend.log
tail -f /opt/personal-blog/logs/backend-error.log
```

---

## 11. 打包前端

进入前端目录：

```bash
cd /opt/personal-blog/source/frontend
npm install
npm run build
```

打包产物在：

```bash
dist/
```

复制到部署目录：

```bash
mkdir -p /opt/personal-blog/frontend/dist
cp -r dist/* /opt/personal-blog/frontend/dist/
```

---

## 12. 配置 Nginx

创建站点配置：

```bash
sudo vim /etc/nginx/sites-available/personal-blog
```

写入以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com your-server-ip;

    root /opt/personal-blog/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /doc.html {
        proxy_pass http://127.0.0.1:8080/doc.html;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /v3/api-docs {
        proxy_pass http://127.0.0.1:8080/v3/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /swagger-resources/ {
        proxy_pass http://127.0.0.1:8080/swagger-resources/;
    }

    location /webjars/ {
        proxy_pass http://127.0.0.1:8080/webjars/;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/personal-blog /etc/nginx/sites-enabled/personal-blog
sudo nginx -t
sudo systemctl reload nginx
```

---

## 13. 配置防火墙

如果启用了 `ufw`：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

一般不建议对公网开放 `8080`、`3306`、`6379`。

---

## 14. HTTPS 配置（推荐）

安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

为域名签发证书：

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot 会自动修改 Nginx 配置并配置续期。

测试续期：

```bash
sudo certbot renew --dry-run
```

---

## 15. 部署完成后的访问地址

假设域名为 `https://your-domain.com`：

- 前端首页：

```text
https://your-domain.com/
```

- 后端接口：

```text
https://your-domain.com/api/articles
```

- Knife4j：

```text
https://your-domain.com/doc.html
```

- OpenAPI JSON：

```text
https://your-domain.com/v3/api-docs
```

---

## 16. 发布更新流程

后续更新时建议按以下顺序：

### 更新后端

```bash
cd /opt/personal-blog/source/backend
git pull
mvn clean package -DskipTests
cp target/blog-backend-0.0.1-SNAPSHOT.jar /opt/personal-blog/backend/blog-backend.jar
sudo systemctl restart personal-blog-backend
sudo systemctl status personal-blog-backend
```

### 更新前端

```bash
cd /opt/personal-blog/source/frontend
git pull
npm install
npm run build
rm -rf /opt/personal-blog/frontend/dist/*
cp -r dist/* /opt/personal-blog/frontend/dist/
sudo systemctl reload nginx
```

---

## 17. 常见问题排查

### 17.1 后端启动失败

看服务状态：

```bash
sudo systemctl status personal-blog-backend
```

看日志：

```bash
tail -n 200 /opt/personal-blog/logs/backend.log
tail -n 200 /opt/personal-blog/logs/backend-error.log
```

常见原因：

- MySQL 用户名或密码错误
- 数据库未创建
- `t_user_register_application` 等新表未导入
- Redis 未启动
- `application-prod.yml` 配置路径错误

### 17.2 前端页面打开 404

通常是 Nginx 没加：

```nginx
try_files $uri $uri/ /index.html;
```

### 17.3 `/api` 返回 502

说明 Nginx 反向代理到了一个不可用的后端。

检查：

```bash
curl http://127.0.0.1:8080/api/articles
sudo systemctl status personal-blog-backend
```

### 17.4 `doc.html` 打不开

检查两件事：

1. 后端服务是否正常启动
2. Nginx 是否代理了：
   - `/doc.html`
   - `/v3/api-docs`
   - `/swagger-resources/`
   - `/webjars/`

### 17.5 注册申请功能报错

检查数据库是否已经执行最新 `schema.sql`，尤其是：

```text
t_user_register_application
```

这张表如果不存在，注册申请与管理员审批都会失败。

---

## 18. 生产环境建议

上线前建议至少做这些调整：

- 修改数据库密码
- 修改 JWT 密钥
- 修改管理员初始密码
- 不要对公网暴露 MySQL / Redis
- 使用 HTTPS
- 为 Nginx 增加安全响应头
- 开启日志轮转
- 定期备份 MySQL 数据库

可选增强：

- 使用 Docker Compose 统一部署
- 给后端增加 `.env` 或外部配置管理
- 增加接口限流
- 增加监控和告警

---

## 19. 一次性最短部署命令清单

如果你已经会 Linux，最短路径大概是：

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk maven mysql-server redis-server nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

```bash
mkdir -p /opt/personal-blog
cd /opt/personal-blog
git clone <repo> source
```

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS personal_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p personal_blog < /opt/personal-blog/source/backend/src/main/resources/schema.sql
```

```bash
cd /opt/personal-blog/source/backend
mvn clean package -DskipTests
```

```bash
cd /opt/personal-blog/source/frontend
npm install
npm run build
```

然后按本文的 `application-prod.yml`、`systemd`、`Nginx` 三步完成即可。

