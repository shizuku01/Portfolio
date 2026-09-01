# 🚀 Deploying to Aliyun ECS

Deploy this portfolio to your Alibaba Cloud (Aliyun) ECS server using Docker + Git.
Your server already has Docker installed, so this is short.

---

## Overview

```
Local machine  ──git push──▶  GitHub / Gitee  ──git clone──▶  Aliyun ECS
                                                                  │
                                                          docker compose up
                                                                  │
                                                      http://<your-server-ip>
```

---

## Step 1 — Push the code to a Git remote (do this on your PC)

The repo is already initialized and committed locally. Create an empty repo on
**GitHub** or **Gitee** (Gitee is faster to clone from inside mainland China),
then:

```bash
cd "c:/Users/relat/Downloads/Portfolio"

# Replace with your actual repo URL
git remote add origin https://github.com/<you>/portfolio.git
git branch -M main
git push -u origin main
```

> The `.env` (real Gmail password) is **gitignored** and will NOT be pushed —
> that's intentional. You'll create it directly on the server in Step 4.

---

## Step 2 — Open the firewall port in Aliyun

In the **Aliyun ECS console → Security Groups → Add Rule (Inbound)**:

| Port | Protocol | Source      | Purpose            |
|------|----------|-------------|--------------------|
| 80   | TCP      | 0.0.0.0/0   | HTTP (the website) |
| 22   | TCP      | your IP     | SSH (usually open) |

Also make sure the server's own firewall (if `ufw`/`firewalld` is active) allows 80.
This is the #1 reason "the container runs but I can't reach the site."

---

## Step 3 — Clone the repo on the server

SSH into your ECS instance, then:

```bash
# Verify Docker is working
docker --version
docker compose version   # (or: docker-compose --version)

# Clone your repo
git clone https://github.com/<you>/portfolio.git
cd portfolio
```

---

## Step 4 — Create the .env file with your real secret

```bash
cp .env.example .env
nano .env        # set EMAIL_PASSWORD=<your 16-char Gmail App Password>
```

Leave `EMAIL_PASSWORD` blank if you aren't using the contact form yet — the
site still runs fine.

---

## Step 5 — Build and start (published on port 80)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- `docker-compose.yml` = build, secrets, healthcheck
- `docker-compose.prod.yml` = publishes on port **80** instead of 1025

Check it's healthy:

```bash
docker compose ps
docker compose logs -f          # Ctrl+C to stop following
```

Visit **http://\<your-server-public-ip\>** in a browser. 🎉

---

## Updating the site later

```bash
cd portfolio
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Useful commands

```bash
docker compose ps                 # status
docker compose logs -f            # live logs
docker compose down              # stop & remove container
docker compose restart           # restart
docker image prune -f            # reclaim disk from old builds
```

---

## Optional — Add a domain + free HTTPS (do this once the IP works)

When you're ready to use a domain name with `https://`:

1. **Point DNS:** In your domain registrar, create an `A` record →
   your ECS public IP. If the domain is registered in China, it must be
   **ICP-filed (备案)** before Aliyun will serve it on port 80/443.

2. **Open port 443** in the security group (same as Step 2).

3. **Easiest TLS path — Caddy** (auto-obtains & renews Let's Encrypt certs).
   Add this to a `docker-compose.prod.yml`-style setup, or ask me and I'll wire
   up a `caddy` service in front of the app. A minimal `Caddyfile` is just:

   ```
   your-domain.com {
       reverse_proxy portfolio:3000
   }
   ```

   Caddy handles the certificate automatically on first request — no manual
   certbot steps.

Tell me your domain when you get there and I'll add the Caddy service to the
compose files for you.
