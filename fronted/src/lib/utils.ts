import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 判断给定日期是否即将到期（1天内）
 * @param dueDate 截止日期
 * @returns 如果日期在1天内到期则返回true，否则返回false
 */
export function isDueSoon(dueDate: Date): boolean {
  const now = new Date()
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
  return dueDate <= oneDayFromNow && dueDate >= now
}
