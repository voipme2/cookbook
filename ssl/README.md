# SSL Certificate Setup for Intranet

This directory contains SSL certificates for HTTPS on your local network.

## Quick Setup (Self-Signed with Local CA)

### 1. Create Certificate Authority
```bash
# Create CA private key
openssl genrsa -out ca-key.pem 4096

# Create CA certificate
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=Local CA"
```

### 2. Create Server Certificate
```bash
# Create server private key
openssl genrsa -out server-key.pem 4096

# Create certificate signing request
openssl req -subj "/CN=cookbook.local" -sha256 -new -key server-key.pem -out server.csr

# Create server certificate
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem
```

### 3. Trust the CA on Your Devices

**On each device that will access the cookbook:**

**Windows:**
1. Copy `ca.pem` to the device
2. Double-click `ca.pem`
3. Install Certificate → Local Machine → Trusted Root Certification Authorities

**macOS:**
1. Copy `ca.pem` to the device
2. Double-click `ca.pem`
3. Add to System keychain
4. Trust the certificate for SSL

**Linux:**
```bash
sudo cp ca.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

**Android:**
1. Copy `ca.pem` to your Android device (email, USB, cloud storage, etc.)
2. Open **Settings** → **Security** (or **Security & privacy**)
3. Scroll down and tap **Encryption & credentials** (or **Advanced** → **Encryption & credentials**)
4. Tap **Install from storage** (or **Install certificates**)
5. Select **CA certificate**
6. Navigate to and select the `ca.pem` file
7. Tap **Install** (or **OK**)
8. You may see a warning about installing certificates - tap **Install anyway**
9. The certificate is now installed as a trusted CA

**Note for Android:** Some Android versions may require you to:
- Enable "Developer options" first
- Go to **Settings** → **Developer options** → **Trust user CAs**
- Enable "Trust user CAs" if available

**Alternative Android method (if the above doesn't work):**
1. Copy `ca.pem` to your Android device
2. Open **Chrome** browser
3. Navigate to `chrome://settings/certificates`
4. Tap **Authorities** tab
5. Tap **Import** and select the `ca.pem` file
6. Enable trust for all purposes

### 4. Update docker-compose.yml
The docker-compose.yml is already configured to use these certificates.

## Alternative: Let's Encrypt with DNS Challenge

If you want browser-trusted certificates without manual installation:

1. Use a dynamic DNS service (like No-IP, DuckDNS)
2. Configure DNS challenge for Let's Encrypt
3. Use certbot with DNS plugin

## Files to Generate:
- `ca-key.pem` - CA private key (keep secure)
- `ca.pem` - CA certificate (distribute to devices)
- `server-key.pem` - Server private key
- `server-cert.pem` - Server certificate 