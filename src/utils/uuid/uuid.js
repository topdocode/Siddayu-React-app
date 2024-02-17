// Import pustaka uuid
import { v4 as uuidv4 } from 'uuid';

// Fungsi untuk menghasilkan UUID unik
export function generateUniqueId() {
    const timestamp = new Date().getTime().toString(16);
    const randomPart = Math.random().toString(16).substr(2, 8);
    return `${timestamp}-${randomPart}`;
}
