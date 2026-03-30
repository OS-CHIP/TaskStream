import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function ProjectMembersSearchExample() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Array<{ email: string; userName: string; roleName: string }>>([])

  const searchProjectMembersExample = async () => {
    try {
      setLoading(true)

      const response = await apiClient.postFormData<Array<{
        email: string
        userName: string
        roleName: string
      }>>('/project/queryProjectUsersByName', {
        id: 1,
        userName: keyword || ''
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '搜索项目成员失败')
      }

      toast.success(`找到 ${response.data?.length || 0} 个匹配的成员`)
      setMembers(response.data || [])
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="输入用户名关键词" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Button onClick={searchProjectMembersExample} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>

      <ul className="list-disc list-inside">
        {members.map((m, idx) => (
          <li key={`${m.userName}-${idx}`}>{m.userName} - {m.email} - {m.roleName}</li>
        ))}
      </ul>
    </div>
  )
}