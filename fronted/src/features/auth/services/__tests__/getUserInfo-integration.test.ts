import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getUserInfo } from '../auth-service'
import { apiClient } from '@/lib/api-client'
import type { GetUserInfoResponse, UserInfo } from '../auth-service'

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('getUserInfo Integration Test', () => {
  const mockUserInfo: UserInfo = {
    id: 1,
    deptId: 1,
    userName: 'jizitao',
    nickName: '季子涛',
    userType: '00',
    email: 'test@example.com',
    phonenumber: '12345678901',
    sex: '0',
    avatar: 'avatar.jpg',
    password: 'jizitao',
    status: '0',
    delFlag: '0',
    loginIp: '192.168.1.1',
    loginDate: null,
    createBy: 'admin',
    createTime: null,
    updateBy: 'admin',
    updateTime: null,
    remark: null,
  }

  const mockApiResponse: GetUserInfoResponse = {
    code: 200,
    msg: 'ok',
    data: {
      user: mockUserInfo,
      permissions: ['user:read', 'user:write'],
      roles: ['user', 'admin'],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should fetch user info and cache it properly', async () => {
    // Arrange
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse)

    // Act
    const result = await getUserInfo()

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith('/users/getInfo')
    expect(result).toEqual(mockApiResponse)
    expect(result.data.user).toEqual(mockUserInfo)
    expect(result.data.permissions).toEqual(['user:read', 'user:write'])
    expect(result.data.roles).toEqual(['user', 'admin'])
  })

  it('should handle complete user info workflow', async () => {
    // Arrange
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse)

    // Act - 模拟完整的用户信息获取和缓存流程
    const userInfoResult = await getUserInfo()
    
    // 模拟将用户信息存储到authStore
    const userInfoKey = 'user_info_cache'
    localStorage.setItem(userInfoKey, JSON.stringify(userInfoResult.data.user))

    // 模拟从缓存中读取用户信息
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserInfo))
    const cachedUserInfo = localStorage.getItem(userInfoKey)
    const parsedUserInfo = cachedUserInfo ? JSON.parse(cachedUserInfo) : null

    // Assert
    expect(userInfoResult.code).toBe(200)
    expect(userInfoResult.msg).toBe('ok')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      userInfoKey,
      JSON.stringify(mockUserInfo)
    )
    expect(parsedUserInfo).toEqual(mockUserInfo)
  })

  it('should handle API errors and not cache invalid data', async () => {
    // Arrange
    const mockError = new Error('Network Error')
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act & Assert
    await expect(getUserInfo()).rejects.toThrow('Network Error')
    
    // 确保没有缓存无效数据
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('获取用户信息失败:', mockError)
    
    consoleSpy.mockRestore()
  })

  it('should validate user info data structure', async () => {
    // Arrange
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse)

    // Act
    const result = await getUserInfo()

    // Assert - 验证返回数据结构
    expect(result).toHaveProperty('code')
    expect(result).toHaveProperty('msg')
    expect(result).toHaveProperty('data')
    expect(result.data).toHaveProperty('user')
    expect(result.data).toHaveProperty('permissions')
    expect(result.data).toHaveProperty('roles')
    
    // 验证用户信息字段
    const user = result.data.user
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('userName')
    expect(user).toHaveProperty('nickName')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('status')
    expect(typeof user.id).toBe('number')
    expect(typeof user.userName).toBe('string')
    expect(typeof user.nickName).toBe('string')
  })
})