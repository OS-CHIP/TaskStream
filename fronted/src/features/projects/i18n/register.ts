import i18n from '@/lib/i18n'
import zh from './zh.json'
import en from './en.json'

// 将 features 的文案注册到默认命名空间 translation 下的 projects 节点
(function register() {
  // 如果已存在，则跳过重复注册
  if (i18n.getResource('zh', 'translation', 'projects')) return
  i18n.addResourceBundle('zh', 'translation', { projects: zh }, true, true)
  i18n.addResourceBundle('en', 'translation', { projects: en }, true, true)
})()

export {}