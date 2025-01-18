import { ulid } from 'ulid';

export const generateId = () => ulid();

// 检查字符串是否为有效的 ULID
export const isValidUlid = (id: string) => {
  if (typeof id !== 'string') return false;
  if (id.length !== 26) return false;
  return /^[0-9A-Z]{26}$/.test(id);
}; 