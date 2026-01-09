
// Centralized utility functions for LIVE Bits
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Usage: sanitizeHtml("<script>alert('xss')</script>") -> ""
 */
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === 'undefined') return dirty; // SSR fallback
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

/**
 * Sanitizes plain text by escaping HTML entities.
 * Usage: sanitizeText("<script>") -> "&lt;script&gt;"
 */
export const sanitizeText = (text: string): string => {
  if (typeof window === 'undefined') {
    // SSR fallback - basic HTML entity escaping
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validates and sanitizes user input.
 * Usage: validateInput("user@example.com", { type: 'email', maxLength: 100 })
 */
export const validateInput = (
  input: string,
  options: { type?: 'text' | 'email' | 'url'; maxLength?: number; minLength?: number } = {}
): { isValid: boolean; sanitized: string; error?: string } => {
  let sanitized = input.trim();
  
  // Length validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    return { isValid: false, sanitized: sanitized.slice(0, options.maxLength), error: `Input exceeds maximum length of ${options.maxLength}` };
  }
  if (options.minLength && sanitized.length < options.minLength) {
    return { isValid: false, sanitized, error: `Input must be at least ${options.minLength} characters` };
  }
  
  // Type validation
  if (options.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, sanitized, error: 'Invalid email format' };
    }
  }
  
  if (options.type === 'url') {
    try {
      new URL(sanitized);
    } catch {
      return { isValid: false, sanitized, error: 'Invalid URL format' };
    }
  }
  
  // Sanitize HTML
  sanitized = sanitizeText(sanitized);
  
  return { isValid: true, sanitized };
};

/**
 * Converts a string into a URL-friendly slug.
 * Usage: slugify("Hello World") -> "hello-world"
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
};

/**
 * Generates a secure random ID using crypto API.
 * Falls back to UUID v4 format if crypto.randomUUID is not available.
 * Usage: generateId() -> "550e8400-e29b-41d4-a716-446655440000"
 */
export const generateId = (): string => {
  // Use crypto.randomUUID if available (secure and standard)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (still better than Math.random)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * Formats a timestamp into a readable relative time (e.g., "2 days ago") or date.
 */
export const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
