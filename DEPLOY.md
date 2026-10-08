# Renovate Max2Max — Production Deployment (Hostinger VPS)

Is zip mein sab kuch hai — frontend source + built `dist/`, backend source,
aur **poori database** (`backend/data/` + `backend/uploads/` + `backend/.env`).

## Zaroori baat

- Backend Node.js (Express) hai → **Hostinger VPS** chahiye. Shared/Premium
  hosting pe sirf frontend chalega, backend nahi.
- Frontend backend ko **same domain** pe `/api` se bulata hai (domain-agnostic
  code hai — koi hardcoded URL nahi). Sirf ek exception: `*.vercel.app` domain
  pe wo Render backend use karega.
- Database = sirf files hai:
  - `backend/data/*.json` → saara content (projects, services, images, quotes…)
  - `backend/uploads/` → admin se upload ki hui images
  - `backend/.env` → admin login credentials
  - In folders ko kisi bhi server pe copy karo — wahi DB wahan live ho jayegi.

## Step-by-step (Ubuntu VPS)

### 1. Server setup
```bash
apt update && apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

### 2. Zip upload + extract
```bash
mkdir -p /var/www/renovate
# local machine se:  scp renovate-production.zip root@SERVER_IP:/var/www/
cd /var/www
apt install -y unzip && unzip renovate-production.zip -d renovate
```

### 3. Backend start
```bash
cd /var/www/renovate/backend
npm install
pm2 start server.js --name renovate-api
pm2 save && pm2 startup        # reboot pe auto-start
```
Backend `localhost:5000` pe chalega aur `data/`/`uploads/` already saath aaye hain — DB ready.

### 4. Frontend (pre-built `dist/` already included)
```bash
cd /var/www/renovate/frontend
npm install
npm run build                  # fresh build (dist/ already hai, optional)
```

### 5. Nginx — `/etc/nginx/sites-available/renovate`
```nginx
server {
    listen 80;
    server_name YOURDOMAIN.COM www.YOURDOMAIN.COM;

    root /var/www/renovate/frontend/dist;
    index index.html;

    client_max_body_size 20m;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
    }

    location / {
        try_files $uri /index.html;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/renovate /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6. Domain + SSL
- Hostinger DNS mein **A record** → VPS IP
- `apt install -y certbot python3-certbot-nginx && certbot --nginx -d YOURDOMAIN.COM`

### 7. Test
- `https://YOURDOMAIN.COM` → site
- `https://YOURDOMAIN.COM/admin` → admin login (credentials `backend/.env` mein)
- `https://YOURDOMAIN.COM/api` → `{"message":"Renovate Max2Max API"}`

## Future updates

```bash
cd /var/www/renovate && git pull        # ya nayi zip extract karo
cd frontend && npm install && npm run build
cd ../backend && npm install && pm2 restart renovate-api
```

⚠️ `backend/data/` aur `backend/uploads/` ko overwrite mat karna jab tak
purani files ka backup na liya ho — wahi live DB hai.

## Backup (recommended)

```bash
# daily backup cron
crontab -e
0 3 * * * tar czf /root/renovate-db-$(date +\%F).tar.gz -C /var/www/renovate/backend data uploads
```
