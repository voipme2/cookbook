#!/bin/bash

# Generate SSL certificates for intranet cookbook
set -e

echo "Generating SSL certificates for intranet cookbook..."

# Create CA private key
echo "Creating CA private key..."
openssl genrsa -out ca-key.pem 4096

# Create CA certificate
echo "Creating CA certificate..."
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=Local CA"

# Create server private key
echo "Creating server private key..."
openssl genrsa -out server-key.pem 4096

# Create certificate signing request
echo "Creating certificate signing request..."
openssl req -subj "/CN=cookbook.local" -sha256 -new -key server-key.pem -out server.csr

# Create server certificate
echo "Creating server certificate..."
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem

# Clean up CSR file
rm server.csr

# Set proper permissions
chmod 600 ca-key.pem server-key.pem
chmod 644 ca.pem server-cert.pem

echo "✅ SSL certificates generated successfully!"
echo ""
echo "Next steps:"
echo "1. Copy ca.pem to all devices that will access the cookbook"
echo "2. Install ca.pem as a trusted root certificate on each device"
echo "3. Restart docker-compose to use HTTPS"
echo ""
echo "Access your cookbook at: https://your-pi-ip:8443" 