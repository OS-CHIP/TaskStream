/**
 * 简单的缓存测试页面
 */

import React from 'react'
import { selectedProjectCacheManager } from '@/components/layout/project-switcher/use-project-switcher'

export default function SimpleCacheTest() {
  const [cacheValue, setCacheValue] = React.useState<string | null>(null)
  const [testProjectId, setTestProjectId] = React.useState('test-project-123')

  // 读取缓存
  const readCache = () => {
    const value = selectedProjectCacheManager.getCachedSelectedProjectId()
    setCacheValue(value)
    
    // 添加调试信息
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.log('读取缓存值:', value)
    }
  }

  // 写入缓存
  const writeCache = () => {
    selectedProjectCacheManager.setCachedSelectedProjectId(testProjectId)
    readCache() // 重新读取
    
    // 添加调试信息
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.log('写入缓存值:', testProjectId)
    }
  }

  // 清除缓存
  const clearCache = () => {
    selectedProjectCacheManager.clearCachedSelectedProjectId()
    readCache() // 重新读取
    
    // 添加调试信息
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.log('清除缓存')
    }
  }

  // 组件挂载时读取缓存
  React.useEffect(() => {
    readCache()
  }, [])

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">项目ID缓存测试</h1>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">当前缓存值</h2>
          <p className="text-gray-600">
            {cacheValue ? `项目ID: ${cacheValue}` : '无缓存值'}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">测试操作</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testProjectId}
                onChange={(e) => setTestProjectId(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
                placeholder="输入项目ID"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={writeCache}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                写入缓存
              </button>
              <button
                onClick={readCache}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                读取缓存
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清除缓存
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">测试说明</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>输入一个项目ID，点击"写入缓存"</li>
            <li>刷新页面，查看缓存值是否保持</li>
            <li>打开浏览器开发者工具，查看控制台日志</li>
            <li>在Application/Storage标签中查看localStorage的'selected_project_id'键</li>
            <li>点击"清除缓存"测试清除功能</li>
          </ol>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">localStorage直接检查</h2>
          <button
            onClick={() => {
              const value = localStorage.getItem('selected_project_id')
              alert(`localStorage中的值: ${value || '无'}`)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            直接检查localStorage
          </button>
        </div>
      </div>
    </div>
  )
}