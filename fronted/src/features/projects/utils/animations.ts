// 统一动效工具常量（仅使用 CSS 与 tw-animate-css）
// 在支持动效环境下启用，在减少动画偏好下降级为无动画

// 页面/容器进入动效：淡入 + 自底上滑
export const containerEnter =
  'motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1 motion-reduce:transition-none'

// Tab/局部块进入动效
export const tabContent =
  'motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1 motion-reduce:transition-none'

// 卡片悬浮动效
export const cardHover =
  'transition-transform duration-200 ease-out hover:scale-[1.02] motion-reduce:transition-none'