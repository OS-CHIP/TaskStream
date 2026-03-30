import i18n from '@/lib/i18n'
import zh from './zh.json'
import en from './en.json'

;(function register() {
  i18n.addResourceBundle('zh', 'translation', { tasks: zh }, true, true)
  i18n.addResourceBundle('en', 'translation', { tasks: en }, true, true)
})()

export {}
