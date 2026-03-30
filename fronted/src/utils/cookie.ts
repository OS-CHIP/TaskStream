/**
 * Cookie 工具函数
 */

/**
 * 获取cookie值
 * @param name cookie名称
 * @returns cookie值或null
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  
  return null;
}

/**
 * 设置cookie
 * @param name cookie名称
 * @param value cookie值
 * @param days 过期天数
 * @param path 路径
 */
export function setCookie(
  name: string, 
  value: string, 
  days: number = 7, 
  path: string = '/'
): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${path}`;
}

/**
 * 删除cookie
 * @param name cookie名称
 * @param path 路径
 */
export function removeCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
}

/**
 * 检查cookie是否存在
 * @param name cookie名称
 * @returns 是否存在
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}