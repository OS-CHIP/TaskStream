/// <reference types="vite/client" />

// 这里可按需扩展你项目的环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  // 添加你的其它 VITE_ 前缀变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}