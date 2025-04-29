import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT ?? 3001,
    node_env: process.env.NODE_ENV?.toString() || 'development',
    frontend_urls: process.env.FRONTEND_URLS
        ? process.env.FRONTEND_URLS.split(',').map((url) => url.trim())
        : [],
};
