import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

const getSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          t('settings.password.validation.currentRequired', {
            defaultValue: 'Please enter current password',
          })
        ),
      newPassword: z
        .string()
        .min(
          7,
          t('settings.password.validation.min', {
            defaultValue: 'Password must be at least 7 characters long',
          })
        ),
      confirmPassword: z
        .string()
        .min(
          1,
          t('settings.password.validation.confirmRequired', {
            defaultValue: 'Please confirm your password',
          })
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('settings.password.validation.mismatch', {
        defaultValue: 'Passwords do not match',
      }),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      path: ['newPassword'],
      message: t('settings.password.validation.notSameAsCurrent', {
        defaultValue: 'New password must be different from current password',
      }),
    })

type FormValues = z.infer<ReturnType<typeof getSchema>>

export function PasswordForm() {
  const { t } = useTranslation()
  const form = useForm<FormValues>({
    resolver: zodResolver(getSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await apiClient.post('/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success(
        t('settings.password.toast.success', {
          defaultValue: 'Password updated successfully',
        })
      )
      form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast.error(
        t('settings.password.toast.error', {
          defaultValue: 'Failed to update password',
        })
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.password.current', { defaultValue: 'Current Password' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('settings.password.currentPlaceholder', {
                    defaultValue: 'Enter current password',
                  })}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('settings.password.currentDesc', {
                  defaultValue: 'Enter your existing account password',
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.password.new', { defaultValue: 'New Password' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('settings.password.newPlaceholder', {
                    defaultValue: 'At least 7 characters',
                  })}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('settings.password.newDesc', {
                  defaultValue: 'Use at least 7 characters',
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.password.confirm', { defaultValue: 'Confirm Password' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('settings.password.confirmPlaceholder', {
                    defaultValue: 'Re-enter password',
                  })}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('settings.password.confirmDesc', {
                  defaultValue: 'Re-enter the new password',
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? t('common.loading', { defaultValue: 'Loading...' })
              : t('settings.password.update', { defaultValue: 'Update Password' })}
          </Button>
        </div>
      </form>
    </Form>
  )
}