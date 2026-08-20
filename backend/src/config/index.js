import dotenv from 'dotenv';
dotenv.config();

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: Missing environment variable: ${key}`);
  }
}

export default {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  autoInitWhatsApp: process.env.AUTO_INIT_WHATSAPP
    ? process.env.AUTO_INIT_WHATSAPP === 'true'
    : (process.env.NODE_ENV || 'development') === 'production',
  whatsappReconnectDelayMs: parseInt(process.env.WHATSAPP_RECONNECT_DELAY_MS, 10) || 30000,
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  frontendUrls: (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  salonName: process.env.SALON_NAME || 'Cut n Culture',
  salonAddress: process.env.SALON_ADDRESS || 'Plot no. 20 Next Step Physio Opposite The Valencia building moti nagar akshardham mandir road, Chitrkoot, Vaishali Nagar, Jaipur, Rajasthan 302021',
  salonPhone: process.env.SALON_PHONE || '9358830044',
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth',
  cronTimezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@salon.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    name: process.env.ADMIN_NAME || 'Salon Admin',
  },
};
