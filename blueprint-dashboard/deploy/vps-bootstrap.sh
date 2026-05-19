#!/usr/bin/env bash
# ==========================================================================
# Rockcrete USA Website Rebuild Blueprint, VPS one-time bootstrap
#
# Run this ONCE on the VPS as root (or with sudo) to:
#   1. Install nginx, certbot, htpasswd, ufw, rsync, fail2ban
#   2. Create the deploy user with SSH-key-only access
#   3. Create /var/www/rockcreteusa-website-rebuild/ with strict per-client perms
#   4. Generate or install a TLS cert (Cloudflare Origin Cert recommended,
#      Let's Encrypt as a fallback)
#   5. Configure nginx server block
#   6. Configure HTTP basic auth (per-client htpasswd, for staging)
#   7. Configure UFW + log rotation + fail2ban
#
# Run with:
#   sudo bash vps-bootstrap.sh
#
# Review the CONFIG block at the top before running.
# ==========================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# CONFIG, edit these for your environment before running
# ---------------------------------------------------------------------------
DOMAIN="{{DEPLOY_DOMAIN}}"                        # e.g. dashboards.example.com
SUBPATH="/rockcreteusa-website-rebuild"                       # path under DOMAIN; can be ""
CLIENT_SLUG="rockcreteusa-website-rebuild"                    # used in htpasswd filename
DEPLOY_USER="deploy"
DEPLOY_AUTHORIZED_KEY=""                          # paste your local SSH PUBLIC key here
WEBROOT="/var/www/${DOMAIN}"
SUBPATH_DIR="${WEBROOT}${SUBPATH}"
ADMIN_EMAIL="info@newmindsgroup.com"              # used by certbot if Let's Encrypt
ENABLE_BASIC_AUTH="yes"                           # set to "no" once the dashboard goes public
BASIC_AUTH_USER="${CLIENT_SLUG}"
BASIC_AUTH_PASS=""                                # paste a secure password here, OR leave empty to auto-generate
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}.conf"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/${DOMAIN}.conf"

# TLS strategy: "cloudflare" (use a Cloudflare Origin Cert) or "letsencrypt"
TLS_STRATEGY="cloudflare"
ORIGIN_CERT="/etc/ssl/certs/${DOMAIN}-origin.crt"
ORIGIN_KEY="/etc/ssl/private/${DOMAIN}-origin.key"

# ---------------------------------------------------------------------------
# Pretty output
# ---------------------------------------------------------------------------
GREEN="$(printf '\033[32m')"; RED="$(printf '\033[31m')"
YELLOW="$(printf '\033[33m')"; CYAN="$(printf '\033[36m')"
BOLD="$(printf '\033[1m')"; RESET="$(printf '\033[0m')"

ok()   { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$*"; }
warn() { printf "%s⚠%s %s\n" "$YELLOW" "$RESET" "$*"; }
err()  { printf "%s✗%s %s\n" "$RED" "$RESET" "$*" >&2; }
info() { printf "%s→%s %s\n" "$CYAN" "$RESET" "$*"; }

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
if [[ "$EUID" -ne 0 ]]; then
  err "Run as root: sudo bash $0"
  exit 1
fi
if [[ -z "$DEPLOY_AUTHORIZED_KEY" ]]; then
  err "Edit this script and paste your local SSH PUBLIC key into DEPLOY_AUTHORIZED_KEY."
  err "On your machine: cat ~/.ssh/id_ed25519.pub  (or id_rsa.pub)"
  exit 1
fi
if [[ "$DOMAIN" == "{{DEPLOY_DOMAIN}}" ]]; then
  err "Edit the CONFIG block: DOMAIN is still set to a placeholder."
  exit 1
fi

printf "\n%s%s Rockcrete USA Website Rebuild Blueprint VPS bootstrap %s\n\n" "$BOLD" "🛠" "$RESET"
info "Domain: $DOMAIN"
info "Subpath: $SUBPATH → $SUBPATH_DIR"
info "Deploy user: $DEPLOY_USER"
info "Basic auth: $ENABLE_BASIC_AUTH"
info "TLS strategy: $TLS_STRATEGY"
echo

# ---------------------------------------------------------------------------
# 1. System packages
# ---------------------------------------------------------------------------
info "Updating apt and installing packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx apache2-utils ufw rsync logrotate fail2ban
ok "Packages installed"

# ---------------------------------------------------------------------------
# 2. Deploy user + SSH key
# ---------------------------------------------------------------------------
if id "$DEPLOY_USER" >/dev/null 2>&1; then
  ok "User $DEPLOY_USER already exists"
else
  info "Creating user $DEPLOY_USER..."
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  ok "User created"
fi

DEPLOY_HOME=$(eval echo "~$DEPLOY_USER")
mkdir -p "$DEPLOY_HOME/.ssh"
chmod 700 "$DEPLOY_HOME/.ssh"
echo "$DEPLOY_AUTHORIZED_KEY" > "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh"
ok "SSH key installed for $DEPLOY_USER"

# ---------------------------------------------------------------------------
# 3. Web root, strict per-client isolation
# ---------------------------------------------------------------------------
info "Creating web root structure..."
mkdir -p "$WEBROOT"
chown root:root "$WEBROOT"
chmod 755 "$WEBROOT"

mkdir -p "$SUBPATH_DIR"
# Stub index so nginx serves something on first verify, before deploy.sh runs
if [[ ! -f "$SUBPATH_DIR/index.html" ]]; then
  cat > "$SUBPATH_DIR/index.html" <<HTML
<!DOCTYPE html>
<meta charset="utf-8">
<title>Rockcrete USA Website Rebuild · pending</title>
<style>body{font-family:sans-serif;text-align:center;padding:4em;color:#444;}</style>
<h1>Rockcrete USA Website Rebuild Blueprint</h1>
<p>Stub page. The dashboard will appear here on the first deploy.</p>
HTML
fi
chown -R "$DEPLOY_USER:www-data" "$SUBPATH_DIR"
chmod -R u=rwX,g=rX,o=rX "$SUBPATH_DIR"
ok "Web root ready"

# ---------------------------------------------------------------------------
# 4. TLS cert
# ---------------------------------------------------------------------------
if [[ "$TLS_STRATEGY" == "cloudflare" ]]; then
  if [[ ! -f "$ORIGIN_CERT" || ! -f "$ORIGIN_KEY" ]]; then
    warn "Cloudflare Origin Cert not present at $ORIGIN_CERT"
    warn "Either:"
    warn "  (a) generate one in your Cloudflare dashboard (SSL/TLS → Origin Server → Create Certificate)"
    warn "      then paste the cert into $ORIGIN_CERT and the key into $ORIGIN_KEY"
    warn "  (b) issue a self-signed origin cert now (Cloudflare Full mode trusts it)"
    read -p "Generate self-signed origin cert now? [y/N]: " ans
    if [[ "$ans" =~ ^[Yy]$ ]]; then
      openssl req -x509 -nodes -newkey rsa:2048 \
        -keyout "$ORIGIN_KEY" \
        -out    "$ORIGIN_CERT" \
        -days 3650 \
        -subj "/CN=${DOMAIN}" \
        -addext "subjectAltName=DNS:${DOMAIN},DNS:www.${DOMAIN}" >/dev/null 2>&1
      chmod 600 "$ORIGIN_KEY"
      chmod 644 "$ORIGIN_CERT"
      ok "Self-signed origin cert generated, valid 10 years"
    else
      err "Aborting. Generate the cert and re-run."
      exit 1
    fi
  else
    ok "Origin cert already present, reusing"
  fi
elif [[ "$TLS_STRATEGY" == "letsencrypt" ]]; then
  info "Will issue Let's Encrypt cert via certbot after nginx is up..."
fi

# ---------------------------------------------------------------------------
# 5. nginx server block
# ---------------------------------------------------------------------------
info "Writing nginx config to $NGINX_CONF..."

HTPASSWD_FILE="/etc/nginx/.htpasswd-${DOMAIN}-${CLIENT_SLUG}"
AUTH_BLOCK=""
if [[ "$ENABLE_BASIC_AUTH" == "yes" ]]; then
  if [[ -z "$BASIC_AUTH_PASS" ]]; then
    BASIC_AUTH_PASS=$(openssl rand -base64 18)
    info "Generated basic-auth password: $BASIC_AUTH_PASS"
    info "(write this down, you'll need it to access the dashboard)"
  fi
  htpasswd -bc "$HTPASSWD_FILE" "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
  chown root:www-data "$HTPASSWD_FILE"
  chmod 640 "$HTPASSWD_FILE"
  AUTH_BLOCK="        auth_basic \"Rockcrete USA Website Rebuild Blueprint - staging\";
        auth_basic_user_file ${HTPASSWD_FILE};"
  ok "Basic auth user '$BASIC_AUTH_USER' created (htpasswd: $HTPASSWD_FILE)"
fi

cat > "$NGINX_CONF" <<NGINX
# Rockcrete USA Website Rebuild Blueprint, generated by vps-bootstrap.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ)

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN};

    ssl_certificate     ${ORIGIN_CERT};
    ssl_certificate_key ${ORIGIN_KEY};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    add_header X-Frame-Options          "SAMEORIGIN" always;
    add_header X-Content-Type-Options   "nosniff" always;
    add_header Referrer-Policy          "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    root ${WEBROOT};
    index index.html;

    location = /robots.txt {
        return 200 "User-agent: *\nDisallow: /\n";
        add_header Content-Type text/plain;
    }

    location ${SUBPATH}/ {
${AUTH_BLOCK}
        try_files \$uri \$uri/ =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location / {
        return 404;
    }
}
NGINX

ln -sf "$NGINX_CONF" "$NGINX_CONF_LINK"

if nginx -t; then
  systemctl reload nginx
  ok "nginx config valid and reloaded"
else
  err "nginx config invalid; aborting."
  exit 1
fi

# ---------------------------------------------------------------------------
# 6. Let's Encrypt (only if chosen)
# ---------------------------------------------------------------------------
if [[ "$TLS_STRATEGY" == "letsencrypt" ]]; then
  info "Issuing Let's Encrypt cert..."
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect
  ok "Let's Encrypt cert issued"
fi

# ---------------------------------------------------------------------------
# 7. Firewall
# ---------------------------------------------------------------------------
info "Configuring UFW..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ok "UFW enabled"

# ---------------------------------------------------------------------------
# 8. fail2ban
# ---------------------------------------------------------------------------
info "Enabling fail2ban..."
systemctl enable --now fail2ban
ok "fail2ban running"

# ---------------------------------------------------------------------------
# 9. Log rotation for the deploy log
# ---------------------------------------------------------------------------
cat > /etc/logrotate.d/rockcreteusa-website-rebuild-deploy <<LR
${WEBROOT}/${SUBPATH}.deploy.log {
    weekly
    rotate 12
    compress
    missingok
    notifempty
}
LR
ok "Log rotation configured"

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
printf "\n%s%s VPS bootstrap complete %s\n\n" "$BOLD" "✅" "$RESET"
info "Next steps:"
info "  1. From your local machine, copy deploy/.env.example to deploy/.env"
info "  2. Set DEPLOY_HOST to this VPS's IP (or DNS name not behind a proxy)"
info "  3. Set DEPLOY_USER=$DEPLOY_USER, DEPLOY_PATH=$SUBPATH_DIR/, URL=https://$DOMAIN$SUBPATH/"
info "  4. Run: bash deploy/deploy.sh"
echo

if [[ "$ENABLE_BASIC_AUTH" == "yes" && -n "$BASIC_AUTH_PASS" ]]; then
  info "Staging URL: https://$DOMAIN$SUBPATH/"
  info "Basic-auth user: $BASIC_AUTH_USER"
  info "Basic-auth pass: $BASIC_AUTH_PASS"
  info "(Save the password in your secrets manager.)"
fi
