# Deploy MiniFaceBook (Angular + Spring Boot + PostgreSQL)

Layout: `MiniFaceBook/` (Spring Boot API) · `minifront/` (Angular) · `docker-compose.yml`

```
Browser ──► frontend (Nginx :80) ──► /api/*  ──► backend (Spring Boot :8086) ──► postgres
                 └─ serves the Angular files
```
Only Nginx is exposed. Backend and database stay on Docker's private network.

## 1. Test everything on your PC first
Install Docker Desktop, then in this folder:
```bash
cp .env.example .env        # edit DB_PASSWORD; set SEED_DEMO_DATA=true to get demo users
docker compose up --build
```
Open http://localhost  (first build takes a few minutes).

## 2. Prepare a server
Any Ubuntu 22.04/24.04 VPS with 2 GB RAM (Hetzner, OVH, DigitalOcean...).
```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

## 3. Copy the project
```bash
# from your PC (or use git clone on the server)
scp -r minifacebook-deploy root@YOUR_SERVER_IP:/opt/minifacebook
```

## 4. Start it
```bash
cd /opt/minifacebook
cp .env.example .env && nano .env     # set a strong DB_PASSWORD, SEED_DEMO_DATA=false
docker compose up -d --build
docker compose ps
docker compose logs -f backend        # Ctrl+C to leave
```
Visit http://YOUR_SERVER_IP and create an account with "Create an account".

## 5. Domain + HTTPS (optional, recommended)
1. At your registrar add an **A record**: `yourdomain.com → YOUR_SERVER_IP`.
2. In `.env` set `FRONTEND_BIND=127.0.0.1:8080`, then `docker compose up -d`.
3. Install Caddy (automatic Let's Encrypt certificates):
```bash
apt install -y caddy
cp Caddyfile.example /etc/caddy/Caddyfile && nano /etc/caddy/Caddyfile   # your domain
systemctl reload caddy
```
Open https://yourdomain.com

## 6. Update after code changes
```bash
git pull                      # or re-upload the changed files
docker compose up -d --build
```

## 7. Backup / restore the database
```bash
docker compose exec -T postgres pg_dump -U $DB_USER $DB_NAME > backup.sql
docker compose exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```
Data lives in the `pgdata` volume: `docker compose down` keeps it, `docker compose down -v` DELETES it.

## Troubleshooting
| Symptom | Check |
|---|---|
| Site loads but login/API fails | `docker compose logs backend` |
| Backend restarts in a loop | wrong `DB_*` values in `.env` |
| 502 Bad Gateway on /api | backend still starting; wait ~20 s |
| Port 80 already used | `FRONTEND_BIND=0.0.0.0:8081` |

## Local development (without Docker)
```bash
# backend (needs a local PostgreSQL with database SpringBootDB, user postgres / postgrespw)
cd MiniFaceBook && ./mvnw spring-boot:run
# frontend (proxies /api to localhost:8086)
cd minifront && npm install && npm start
```
If your local database was created by the OLD code, drop it once (messages changed from
date to date+time): `DROP DATABASE "SpringBootDB"; CREATE DATABASE "SpringBootDB";`
