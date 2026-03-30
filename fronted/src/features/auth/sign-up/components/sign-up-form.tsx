import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { register } from '@/features/auth/services/auth-service'
import '@/features/auth/i18n/register'

type SignUpFormProps = HTMLAttributes<HTMLFormElement>

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, t('auth.signUp.validation.emailRequired'))
        .email(t('auth.signUp.validation.emailRequired')),
      username: z
        .string()
        .min(1, t('auth.signUp.validation.usernameRequired'))
        .min(3, t('auth.signUp.validation.usernameMin')),
      password: z
        .string()
        .min(1, t('auth.signUp.validation.passwordRequired'))
        .min(7, t('auth.signUp.validation.passwordMin')),
      confirmPassword: z
        .string()
        .min(1, t('auth.signUp.validation.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.signUp.validation.passwordNotMatch'),
      path: ['confirmPassword'],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const response = await register({
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      
      const isOk = (response as { success?: boolean; code?: number })?.success === true || (response as { success?: boolean; code?: number })?.code === 200
      const msg = (response as { message?: string; msg?: string })?.message ?? (response as { message?: string; msg?: string })?.msg

      if (isOk) {
        toast.success(msg || t('auth.signUp.success') || '注册成功！')
        form.reset({ email: '', username: '', password: '', confirmPassword: '' })
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/sign-in'
        }, 800)
      } else {
        toast.error(msg || t('auth.signUp.error') || '注册失败，请重试')
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error)
      
      const axiosError = error as { 
        response?: { 
          status: number; 
          data?: { message?: string; msg?: string } 
        }; 
        message?: string 
      }
      
      // 处理不同类型的错误
      let errorMessage = t('auth.signUp.error') || '注册失败，请重试'
      
      if (axiosError.response?.status === 500) {
        errorMessage = '服务器内部错误，请稍后重试或联系管理员'
      } else if (axiosError.response?.status === 401) {
        errorMessage = '认证失败，请检查输入信息'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      } else if (axiosError.response?.data?.msg) {
        errorMessage = axiosError.response.data.msg
      } else if (axiosError.message) {
        errorMessage = axiosError.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signUp.emailPlaceholder')} disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.usernameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signUp.usernamePlaceholder')} disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.passwordLabel')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('auth.signUp.passwordPlaceholder')} disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.confirmPasswordLabel')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('auth.signUp.confirmPasswordPlaceholder')} disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (t('auth.signUp.loading') || '注册中...') : t('auth.signUp.createAccount')}
        </Button>
      </form>
    </Form>
  )
}