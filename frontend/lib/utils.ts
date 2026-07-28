import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function normalizeSkills(skills: string[] | undefined | null): string[] {
  if (!skills) return [];
  const result: string[] = [];
  for (const raw of skills) {
    // Nếu có ":" → bỏ phần category trước, lấy phần skills phía sau
    const afterColon = raw.includes(":")
      ? raw.split(":").slice(1).join(":")
      : raw;


    // Split theo dấu phẩy hoặc " and "
    const parts = afterColon
      .split(/,|\band\b/i)
      .map((s) => s.trim().replace(/\.$/, "")) // bỏ "." cuối
      .filter((s) => s.length > 0 && s.length <= 30 && /[a-zA-Z]/.test(s));


    result.push(...parts);
  }
  // Dedup giữ nguyên order
  return Array.from(new Set(result));
}

