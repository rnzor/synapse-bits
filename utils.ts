
// Centralized utility functions for LIVE Bits

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
 * Generates a random alphanumeric ID.
 * Usage: generateId() -> "x9s8f7d6"
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
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
