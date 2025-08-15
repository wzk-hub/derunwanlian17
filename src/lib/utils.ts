import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 计算显示价格（加价20%）
 * @param originalPrice 原始价格
  * @returns 加价后的价格
  */
 export function calculateDisplayPrice(originalPrice: number): number {
   if (typeof originalPrice !== 'number' || isNaN(originalPrice) || originalPrice <= 0) {
     return 0;
   }
   return Math.round(originalPrice * 1.2)
 }
 
 /**
  * 格式化价格显示
  * @param price 价格数值
  * @returns 格式化后的价格字符串
  */
 export function formatPrice(price: number): string {
   if (typeof price !== 'number' || isNaN(price)) {
     return '¥0.00';
   }
   return `¥${price.toFixed(2)}`
 }
 
 /**
  * 格式化日期显示
  * @param date 日期对象或字符串
  * @returns 格式化后的日期字符串
  */
 export function formatDate(date: Date | string): string {
   if (typeof date === 'string') {
     date = new Date(date);
   }
   
   if (!(date instanceof Date) || isNaN(date.getTime())) {
     return 'Invalid Date';
   }
   
   return date.toLocaleString('zh-CN', {
     year: 'numeric',
     month: '2-digit',
     day: '2-digit',
     hour: '2-digit',
     minute: '2-digit'
   });
 }
 
 /**
  * 安全获取本地存储数据
  * @param key 存储键名
  * @returns 解析后的数据或null
  */
 export function getLocalStorageItem<T>(key: string): T | null {
   try {
     const value = localStorage.getItem(key);
     return value ? JSON.parse(value) : null;
   } catch (error) {
     console.error(`Error getting localStorage item "${key}":`, error);
     return null;
   }
 }
 
 /**
  * 安全设置本地存储数据
  * @param key 存储键名
  * @param value 要存储的数据
  * @returns 是否存储成功
  */
 export function setLocalStorageItem<T>(key: string, value: T): boolean {
   try {
     localStorage.setItem(key, JSON.stringify(value));
     return true;
   } catch (error) {
     console.error(`Error setting localStorage item "${key}":`, error);
     return false;
   }
 }
