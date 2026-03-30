```markdown
md# 🌊 TaskStream —— 灵活可编排的任务流引擎

> 🔹 一个轻量、安全、可嵌入的**任务调度与工作流执行平台**  
> 🔹 后端服务模块 `kxy-tb`（Spring Boot + Sa-Token + MyBatis-Plus）已开箱就绪


## 🚀 快速开始（`kxy-tb` 后端服务）

```

### ✅ 环境要求

|组件|版本|说明|
|--|--|--|
|JDK|17+|[Eclipse Temurin 17](https://adoptium.net/)|
|Maven|2.6.13|构建工具|
|MySQL|8.0|存储任务定义、执行日志、用户信息等|
|Redis|6.2|Sa-Token 会话管理、分布式锁、缓存加速|
|MinIO|7.1|附件上传/下载（如任务输入文件、执行结果包）|

✅ 默认访问地址：`http://localhost:10086`

---

## ⚡ 核心能力（`kxy-tb` 模块）

|能力|技术实现|**典型**场景|
|--|--|--|
|**任务生命周期管理**|自定义 `Task` 实体 + MyBatis-Plus CRUD|创建/启动/暂停/重试/终止任务实例|
|**多级权限控制**|Sa-Token JWT + `@SaCheckPermission("task:edit")`|按角色分配「任务创建」「审批」「查看日志」权限|
|**分布式执行协调**|Redis 分布式锁 + `@Transactional`|防止并发重复触发同一任务|
|**大文件附件处理**|MinIO + 断点续传 + 预签名 URL|上传 GB 级输入数据、下载执行结果包|
|**异步通知**|Spring Mail（阿里云企业邮箱）|任务完成/失败时邮件告警|

---

## 📁 项目结构（`kxy-tb` 模块）

```
kxy-tb/                            
├── src/main/java/com/example/demo/
│   ├── config/                    # 工具类
│   ├── constant/                  # 常量
│   ├── controller/                # 接口层
│   ├── domain/                    # 实体类
│   ├── mail/                      # 邮件服务
│   ├── mapper/                    # MyBatis-Plus 映射器
│   ├── result/                    # 返回结果封装类
│   ├── service/                   # 业务逻辑
│   ├── utils/                     # 工具类
│   └── TBApplication.java         # Spring Boot 启动类
├── src/main/resources/
│   └── application.yml            # 全局配置（含 MySQL/Redis/MinIO/JWT）
├── pom.xml                        # JDK 17 / SB 2.6.13 / Sa-Token 1.44.0 / MP 3.5.5
└── README.md                      
```