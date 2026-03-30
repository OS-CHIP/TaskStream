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
import { useTranslation } from 'react-i18next'

type ForgotFormProps = HTMLAttributes<HTMLFormElement>

export function ForgotPasswordForm({ className, ...props }: ForgotFormProps) {
  const { t } = useTranslation()

  const formSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: t('auth.forgotPassword.validation.emailRequired', {
          defaultValue: 'Please enter your email',
        }),
      })
      .email({
        message: t('auth.forgotPassword.validation.emailInvalid', {
          defaultValue: 'Please enter a valid email',
        }),
      }),
  })

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // TODO: 实现忘记密码逻辑
    // eslint-disable-next-line no-console
    console.log('忘记密码请求:', data)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>
                {t('auth.forgotPassword.form.email.label', {
                  defaultValue: 'Email',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'auth.forgotPassword.form.email.placeholder',
                    { defaultValue: 'name@example.com' }
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {t('auth.forgotPassword.form.submit', { defaultValue: 'Continue' })}
        </Button>
      </form>
    </Form>
  )
}