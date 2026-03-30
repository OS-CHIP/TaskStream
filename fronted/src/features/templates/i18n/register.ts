import i18n from '@/lib/i18n'
import zh from './zh.json'
import en from './en.json'

;(function register() {
  if (i18n.getResource('zh', 'translation', 'templatesManagement.list.title')) return
  i18n.addResourceBundle('zh', 'translation', { templatesManagement: zh }, true, true)
  i18n.addResourceBundle('en', 'translation', { templatesManagement: en }, true, true)
})()

export {}
