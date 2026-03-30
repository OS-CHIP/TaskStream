import i18n from '@/lib/i18n'
import zh from './zh.json'
import en from './en.json'

// 将 features 的文案注册到默认命名空间 translation 下的 auth 节点
;(function register() {
  i18n.addResourceBundle('zh', 'translation', { auth: zh }, true, true)
  i18n.addResourceBundle('en', 'translation', { auth: en }, true, true)
})()

export {}