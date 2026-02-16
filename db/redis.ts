import Redis from 'ioredis';

import { REDIS_CONFIG } from '../config';

export const redis = new Redis({
  host: REDIS_CONFIG.HOST,
  port: REDIS_CONFIG.PORT,
  password: REDIS_CONFIG.PASSWORD
});


redis.on('connect', () => {
  console.log('✅ ioredis sedang mencoba menghubungkan...');
});

redis.on('ready', () => {
  console.log('🚀 Redis siap digunakan!');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});