import apiClient, { ApiClient, apiClient as namedClient } from './api-client'

// 兼容层：保持历史导入路径 "@/lib/request"
export default apiClient
export { ApiClient, namedClient as apiClient }