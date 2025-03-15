# ATM 客户端-服务器系统

## 项目概述

这是一个基于RFC-20232023协议的ATM客户端-服务器系统，采用Java后端和Electron前端架构。系统实现了基本的ATM功能，包括用户认证、余额查询、取款操作等。

## 技术栈

### 后端
- Java 11
- Socket编程
- Gson (JSON处理)
- Logback (日志记录)
- Maven (构建工具)

### 前端
- Electron
- HTML/CSS/JavaScript
- IPC通信

## 功能特性

### 客户端功能
- 用户登录认证
- 余额查询
- 取款操作
- 服务器配置管理
- 连接状态监控
- 操作日志记录

### 服务器功能
- 多客户端并发处理
- 账户数据持久化
- 交易日志记录
- 错误日志记录
- 账户密码验证
- 余额管理

## 项目结构

```
.
├── Backend/                  # 后端代码
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/atm/ # 核心业务逻辑
│   │   │   └── resources/    # 配置文件
│   └── pom.xml               # Maven配置文件
│
├── Frontend/                 # 前端代码
│   ├── main.js               # Electron主进程
│   ├── renderer.js           # 界面逻辑
│   ├── preload.js            # IPC通信
│   ├── index.html            # 界面模板
│   └── package.json          # 项目配置
│
└── docs/                     # 文档
    └── docs.md               # RFC协议文档
```

## 快速开始

### 后端启动
1. 确保已安装Java 11和Maven
2. 进入Backend目录
3. 运行 `mvn clean package`
4. 执行 `java -jar target/atm-server-1.0.0-jar-with-dependencies.jar`

### 前端启动
1. 确保已安装Node.js和Electron
2. 进入Frontend目录
3. 运行 `npm install`
4. 执行 `npm start`

## 配置说明

### 服务器配置
- 默认端口：2525
- 最大并发连接数：10
- 账户数据存储：`src/main/resources/accounts.json`
- 日志文件：
  - `transactions.log`：交易日志
  - `debug.log`：调试日志
  - `info.log`：信息日志

### 客户端配置
- 支持动态修改服务器地址和端口
- 操作日志存储在`logfile.xml`
- 自动重连机制

## 协议说明

系统遵循RFC-20232023协议，主要命令包括：

| 命令   | 格式                  | 说明                     |
|--------|-----------------------|--------------------------|
| HELO   | HELO sp <userid>      | 用户认证（卡号）         |
| PASS   | PASS sp <passwd>      | 用户认证（密码）         |
| BALA   | BALA                  | 查询余额                 |
| WDRA   | WDRA sp <amount>      | 取款操作                 |
| BYE    | BYE                   | 结束会话                 |
