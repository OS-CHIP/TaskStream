import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { doLogin, getUserInfo } from '@/features/auth/services/auth-service'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { projectsService } from '@/features/projects/services/projects.service'
import { selectedProjectCacheManager } from '@/components/layout/project-switcher/use-project-switcher'
import { Loader2 } from 'lucide-react'
import '@/features/auth/i18n/register'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

// 动态创建表单校验（支持 i18n）
function createFormSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(1, t('auth.signIn.validation.usernameRequired')),
    password: z
      .string()
      .min(1, t('auth.signIn.validation.passwordRequired'))
      .min(7, t('auth.signIn.validation.passwordMin')),
  })
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { t } = useTranslation()
  const formSchema = createFormSchema(t)

  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoadingMessage('正在登录...')
    
    try {
      // 第一步：执行登录
      const res = await doLogin({ username: data.username, password: data.password })
      if (res?.code === 200) {
        const token = res?.data?.accessToken
        const user = res?.data?.user
        const { setAccessToken, setUser, setUserInfo } = useAuthStore.getState().auth
        
        // 设置认证信息
        if (token) {
          setAccessToken(token)
          // 设置token到cookie，有效期7天
          // setCookie('token', token, 7)
        }
        if (user) setUser(user)

        // 1.5步：获取并缓存用户信息 (UserInfo)
        try {
          const userInfoRes = await getUserInfo()
          if (userInfoRes.code === 200 && userInfoRes.data?.user) {
             setUserInfo(userInfoRes.data.user)
             if (import.meta.env.DEV) {
               console.log('用户信息获取并缓存成功', userInfoRes.data.user)
             }
          }
        } catch (userInfoError) {
          console.error('获取用户信息失败 (非阻塞):', userInfoError)
        }
        
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('登录成功', res)
        }
        
        // 第二步：加载项目列表
        setLoadingMessage('正在加载项目数据...')
        
        try {
          const projectsResult = await projectsService.list({ status: '1' })
          
          if (projectsResult.items.length === 0) {
            // 没有项目，重定向到项目创建页面
            toast.success('登录成功！请先创建一个项目')
            window.location.href = '/projects'
            return
          }
          
          // 第三步：设置默认项目
          setLoadingMessage('正在初始化项目环境...')
          
          // 尝试从缓存恢复项目ID
          const cachedProjectId = selectedProjectCacheManager.getCachedSelectedProjectId()
          let targetProject = null
          
          if (cachedProjectId) {
            // 查找缓存的项目是否还存在
            targetProject = projectsResult.items.find(p => p.id === cachedProjectId)
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log('从缓存恢复项目:', { cachedProjectId, found: !!targetProject })
            }
          }
          
          // 如果没有找到缓存的项目，选择第一个项目
          if (!targetProject) {
            targetProject = projectsResult.items[0]
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log('选择第一个项目作为默认项目:', { projectId: targetProject.id, projectName: targetProject.name })
            }
          }
          
          // 设置项目ID到localStorage
          selectedProjectCacheManager.setCachedSelectedProjectId(targetProject.id)
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('项目ID已设置到localStorage:', targetProject.id)
          }
          
          // 第四步：重定向到任务列表
          toast.success('登录成功')
          
          // 短暂延迟确保localStorage写入完成
          setTimeout(() => {
            window.location.href = '/tasks'
          }, 100)
          
        } catch (projectError) {
          // 项目列表加载失败
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('加载项目列表失败:', projectError)
          }
          
          toast.error('加载项目数据失败，请重试')
          setIsLoading(false)
          setLoadingMessage('')
        }
        
      } else {
        const msg = res?.msg || '登录失败'
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('登录返回非成功状态', res)
        }
        toast.error(msg)
        setIsLoading(false)
        setLoadingMessage('')
      }
    } catch (error) {
      // 已由拦截器统一处理并记录日志，这里仅确保状态恢复
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('登录异常', error)
      }
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signIn.form.username.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('auth.signIn.form.username.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>{t('auth.signIn.form.password.label')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('auth.signIn.form.password.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                {t('auth.signIn.form.forgot')}
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading} type='submit'>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('auth.signIn.form.submit')}
        </Button>
        {isLoading && loadingMessage && (
          <p className='text-sm text-muted-foreground text-center mt-2'>
            {loadingMessage}
          </p>
        )}
      </form>
    </Form>
  )
}
