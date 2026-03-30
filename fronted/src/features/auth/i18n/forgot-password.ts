import i18next from 'i18next'

const en = {
  auth: {
    forgotPassword: {
      description:
        'Enter your registered email and we will send you a link to reset your password.',
      noAccount: "Don't have an account?",
      form: {
        email: { label: 'Email', placeholder: 'name@example.com' },
        submit: 'Continue',
      },
      validation: {
        emailRequired: 'Please enter your email',
        emailInvalid: 'Please enter a valid email',
      },
    },
  },
}

const zh = {
  auth: {
    forgotPassword: {
      description: '请输入注册邮箱，我们会发送重置链接到您的邮箱。',
      noAccount: '没有账号？',
      form: {
        email: { label: '邮箱', placeholder: 'name@example.com' },
        submit: '继续',
      },
      validation: {
        emailRequired: '请输入邮箱',
        emailInvalid: '请输入有效的邮箱地址',
      },
    },
  },
}

i18next.addResourceBundle('en', 'translation', en, true, true)
i18next.addResourceBundle('zh', 'translation', zh, true, true)

export {}