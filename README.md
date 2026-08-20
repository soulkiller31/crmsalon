# Salon CRM — Cut n Culture

Salon management system with WhatsApp automation, invoice generation, and customer tracking.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: whatsapp-web.js + Puppeteer
- **PDF**: Puppeteer (headless Chrome)
- **Auth**: JWT

## Local Development

### Prerequisites
- Node.js 18+
- Chrome (for WhatsApp + PDF)

### Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Login: `admin@salon.com` / `Admin@123456`

## Production Deployment (Hostinger VPS)

See `deploy.sh` for automated setup. Manual steps:

1. Upload code to `/var/www/salon-crm/`
2. Copy `backend/.env.production` → `backend/.env` (update domain)
3. Copy `frontend/.env.production` → `frontend/.env` (update domain)
4. Run `chmod +x deploy.sh && ./deploy.sh`
5. Run SSL: `certbot --nginx -d yourdomain.com`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `PUPPETEER_EXECUTABLE_PATH` | VPS only | Path to Chrome binary |
| `AUTO_INIT_WHATSAPP` | ❌ | Auto-connect WhatsApp on start |

## Features

- **Customers**: Add, edit, search, import/export Excel
- **Invoice**: Create invoice with service catalogue, send PDF via WhatsApp
- **WhatsApp**: Connect via QR, automated birthday/anniversary/follow-up messages
- **Templates**: Manage message templates with variable substitution
- **Message Logs**: Track all sent/failed messages
- **Dashboard**: Customer stats, message stats, WhatsApp status
