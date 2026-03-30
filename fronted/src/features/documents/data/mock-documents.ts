import { type Document } from '../types/document'

// 模拟文档数据
export const mockDocuments: Document[] = [
  {
    id: '1',
    title: '用户登录模块技术方案',
    type: '技术方案',
    status: '已发布',
    author: '张三',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-16T14:20:00'),
    description: '详细描述用户登录模块的技术实现方案，包括认证流程、安全策略等',
    content: `# 用户登录模块技术方案

## 1. 项目概述

用户登录模块是系统的核心功能之一，负责用户的身份验证和权限管理。

## 1.1 功能需求

- 用户名密码登录
- 多种登录方式（微信、QQ等）
- 记住登录状态
- 登录安全验证

## 1.2 技术栈

**前端技术：**
- React 18
- TypeScript
- Ant Design
- Axios

**后端技术：**
- Node.js
- Express
- JWT
- Redis

## 2. 系统架构

### 2.1 整体架构图

\`\`\`mermaid
graph TD
    A[用户界面] --> B[认证服务]
    B --> C[用户数据库]
    B --> D[Redis缓存]
    B --> E[第三方认证]
\`\`\`

### 2.2 认证流程

1. 用户输入登录信息
2. 前端验证表单数据
3. 发送登录请求到后端
4. 后端验证用户凭据
5. 生成JWT令牌
6. 返回用户信息和令牌
7. 前端存储令牌并跳转

## 3. 安全策略

### 3.1 密码安全

- 密码加密存储（bcrypt）
- 密码强度验证
- 防暴力破解机制

### 3.2 会话管理

- JWT令牌机制
- 令牌过期时间控制
- 刷新令牌机制

### 3.3 安全防护

- CSRF防护
- XSS防护
- SQL注入防护
- 接口限流

## 4. 实现细节

### 4.1 前端实现

\`\`\`typescript
interface LoginForm {
  username: string
  password: string
  remember: boolean
}

const handleLogin = async (values: LoginForm) => {
  try {
    const response = await authAPI.login(values)
    localStorage.setItem('token', response.token)
    navigate('/dashboard')
  } catch (error) {
    message.error('登录失败')
  }
}
\`\`\`

### 4.2 后端实现

\`\`\`javascript
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  
  // 验证用户凭据
  const user = await User.findOne({ username })
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }
  
  // 生成JWT令牌
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })
  
  res.json({ token, user: { id: user.id, username: user.username } })
})
\`\`\`

## 5. 测试方案

### 5.1 单元测试

- 登录表单验证测试
- API接口测试
- 令牌生成和验证测试

### 5.2 集成测试

- 完整登录流程测试
- 安全防护测试
- 性能压力测试

## 6. 部署方案

### 6.1 环境配置

- 开发环境
- 测试环境
- 生产环境

### 6.2 部署步骤

1. 代码构建和打包
2. 服务器环境准备
3. 数据库初始化
4. 应用部署和启动
5. 监控和日志配置

## 7. 维护和优化

### 7.1 性能优化

- 缓存策略优化
- 数据库查询优化
- 前端资源优化

### 7.2 安全加固

- 定期安全审计
- 漏洞扫描和修复
- 安全策略更新

---

**文档版本**: v1.2  
**最后更新**: 2024-01-16  
**负责人**: 张三`,
    tags: ['认证', '安全', '前端'],
    version: 'v1.2',
    fileSize: 2048576, // 2MB
    downloadUrl: '/api/documents/1/download',
    attachments: [
      {
        id: 'att1',
        name: '登录流程图.pdf',
        size: 524288, // 512KB
        type: 'application/pdf',
        url: '/api/documents/1/attachments/att1'
      },
      {
        id: 'att2',
        name: '界面设计稿.png',
        size: 1048576, // 1MB
        type: 'image/png',
        url: '/api/documents/1/attachments/att2'
      }
    ]
  },
  {
    id: '2',
    title: '项目需求分析文档',
    type: '需求文档',
    status: '审核中',
    author: '李四',
    createdAt: new Date('2024-01-14T09:15:00'),
    description: '项目整体需求分析，包括功能需求、非功能需求等',
    content: `# 项目需求分析文档

## 1. 项目背景

本项目旨在构建一个现代化的文档管理系统，提供高效的文档创建、编辑、查看和管理功能。

## 2. 功能需求

### 2.1 核心功能
- 文档创建和编辑
- 文档查看和预览
- 文档搜索和筛选
- 用户权限管理

### 2.2 扩展功能
- 文档版本控制
- 协作编辑
- 评论和反馈
- 文档导出

## 3. 非功能需求

### 3.1 性能要求
- 页面加载时间 < 2秒
- 支持1000+并发用户
- 99.9%系统可用性

### 3.2 安全要求
- 用户身份验证
- 数据加密传输
- 访问权限控制`,
    tags: ['需求', '分析'],
    version: 'v1.0',
    fileSize: 1536000, // 1.5MB
    downloadUrl: '/api/documents/2/download',
  },
  {
    id: '3',
    title: 'UI设计规范文档',
    type: '设计文档',
    status: '已发布',
    author: '王五',
    createdAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-14T11:30:00'),
    description: '项目UI设计规范，包括颜色、字体、组件等设计标准',
    content: `# UI设计规范文档

## 1. 设计原则

### 1.1 一致性
保持界面元素的一致性，包括颜色、字体、间距等。

### 1.2 简洁性
界面设计简洁明了，避免不必要的装饰元素。

## 2. 颜色规范

### 2.1 主色调
- 主色：#3366ff
- 辅助色：#f0f2f5
- 成功色：#52c41a
- 警告色：#faad14
- 错误色：#ff4d4f

### 2.2 文字颜色
- 主要文字：#262626
- 次要文字：#595959
- 辅助文字：#8c8c8c

## 3. 字体规范

### 3.1 字体族
- 中文：PingFang SC, Microsoft YaHei
- 英文：-apple-system, BlinkMacSystemFont, Segoe UI

### 3.2 字体大小
- 标题：24px, 20px, 16px
- 正文：14px
- 辅助文字：12px`,
    tags: ['设计', 'UI', '规范'],
    version: 'v2.1',
    fileSize: 3145728, // 3MB
    downloadUrl: '/api/documents/3/download',
  },
  {
    id: '4',
    title: '接口测试用例文档',
    type: '测试文档',
    status: '草稿',
    author: '赵六',
    createdAt: new Date('2024-01-12T13:20:00'),
    description: '后端接口测试用例集合，包括正常流程和异常流程测试',
    content: `# 接口测试用例文档

## 1. 测试概述

本文档包含系统所有API接口的测试用例，覆盖正常流程和异常流程。

## 2. 用户认证接口

### 2.1 登录接口

**接口地址**: POST /api/auth/login

**测试用例**:

#### TC001: 正常登录
- **输入**: 正确的用户名和密码
- **预期结果**: 返回200状态码和用户token

#### TC002: 用户名错误
- **输入**: 错误的用户名
- **预期结果**: 返回401状态码和错误信息

#### TC003: 密码错误
- **输入**: 错误的密码
- **预期结果**: 返回401状态码和错误信息

## 3. 文档管理接口

### 3.1 获取文档列表

**接口地址**: GET /api/documents

**测试用例**:

#### TC101: 获取所有文档
- **输入**: 无参数
- **预期结果**: 返回200状态码和文档列表

#### TC102: 分页查询
- **输入**: page=1&pageSize=10
- **预期结果**: 返回指定页的文档数据`,
    tags: ['测试', '接口', 'API'],
    version: 'v0.8',
    fileSize: 1024000, // 1MB
    downloadUrl: '/api/documents/4/download',
  },
  {
    id: '5',
    title: '系统部署手册',
    type: '用户手册',
    status: '已发布',
    author: '孙七',
    createdAt: new Date('2024-01-11T08:00:00'),
    description: '系统部署的详细步骤和注意事项',
    content: `# 系统部署手册

## 1. 环境准备

### 1.1 服务器要求
- CPU: 4核心以上
- 内存: 8GB以上
- 硬盘: 100GB以上
- 操作系统: Ubuntu 20.04 LTS

### 1.2 软件依赖
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Nginx 1.18+

## 2. 部署步骤

### 2.1 代码部署

\`\`\`bash
# 克隆代码仓库
git clone https://github.com/company/project.git
cd project

# 安装依赖
npm install

# 构建项目
npm run build
\`\`\`

### 2.2 数据库配置

\`\`\`sql
-- 创建数据库
CREATE DATABASE project_db;

-- 创建用户
CREATE USER project_user WITH PASSWORD 'password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE project_db TO project_user;
\`\`\`

### 2.3 环境变量配置

\`\`\`bash
# .env文件配置
DATABASE_URL=postgresql://project_user:password@localhost:5432/project_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
PORT=3000
\`\`\`

## 3. 启动服务

### 3.1 启动应用

\`\`\`bash
# 使用PM2启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status
\`\`\`

### 3.2 配置Nginx

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

## 4. 监控和维护

### 4.1 日志管理
- 应用日志: /var/log/project/app.log
- 错误日志: /var/log/project/error.log
- 访问日志: /var/log/nginx/access.log

### 4.2 备份策略
- 数据库备份: 每日自动备份
- 代码备份: Git版本控制
- 配置文件备份: 定期手动备份`,
    tags: ['部署', '运维', '手册'],
    version: 'v1.5',
    fileSize: 2560000, // 2.5MB
    downloadUrl: '/api/documents/5/download',
  },
]

// 模拟分页数据
export const mockPaginationData = {
  page: 1,
  pageSize: 10,
  total: 5,
}

// 模拟筛选选项
export const mockFilterOptions = {
  types: [
    { label: '全部类型', value: '全部类型' },
    { label: '技术方案', value: '技术方案' },
    { label: '需求文档', value: '需求文档' },
    { label: '设计文档', value: '设计文档' },
    { label: '测试文档', value: '测试文档' },
    { label: '用户手册', value: '用户手册' },
    { label: '项目计划', value: '项目计划' },
    { label: '会议纪要', value: '会议纪要' },
    { label: '其他', value: '其他' },
  ],
  statuses: [
    { label: '全部状态', value: '全部状态' },
    { label: '草稿', value: '草稿' },
    { label: '审核中', value: '审核中' },
    { label: '已发布', value: '已发布' },
    { label: '已归档', value: '已归档' },
  ],
}

// 模拟作者列表
export const mockAuthors = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '孙七',
]

// 获取模拟文档列表的函数
export function getMockDocuments(filters?: {
  search?: string
  type?: string
  status?: string
  author?: string
}) {
  let filteredDocuments = [...mockDocuments]

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredDocuments = filteredDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description?.toLowerCase().includes(searchTerm) ||
        doc.author.toLowerCase().includes(searchTerm)
    )
  }

  if (filters?.type && filters.type !== '全部类型') {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.type === filters.type
    )
  }

  if (filters?.status && filters.status !== '全部状态') {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.status === filters.status
    )
  }

  if (filters?.author) {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.author === filters.author
    )
  }

  return filteredDocuments
}

// 格式化文件大小的工具函数
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期的工具函数
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取单个文档的函数
export function getDocument(documentId: string): Document | null {
  const document = mockDocuments.find(doc => doc.id === documentId)
  return document || null
}