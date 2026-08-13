// generate-license.js
// Quick dev/testing license generator for BizPOS.
// Usage: node generate-license.js "BIZPOS-75C301B5-2027-460C-AEAE-D6DC699ADF93"

const installationId = process.argv[2]

if (!installationId) {
  console.error('Usage: node generate-license.js <installationId>')
  process.exit(1)
}

const now = new Date()
const expires = new Date()
expires.setFullYear(expires.getFullYear() + 1) // valid for 1 year

const license = {
  licenseId: `LIC-${Date.now()}`,
  businessId: 'DEV-TEST-BUSINESS',
  product: 'BizPOS',
  edition: 'STANDARD',
  issuedAt: now.toISOString(),
  expiresAt: expires.toISOString(),
  deviceLimit: 1,
  // NOTE: no real crypto signing is enforced yet in license.service.ts
  // (verifyLicense() never calls crypto.verify against PUBLIC_KEY),
  // so any non-empty string satisfies the current check.
  signature: 'DEV-UNSIGNED-TOKEN',
}

// Bake in device binding directly so activateLicense() doesn't need to guess
license.deviceId = installationId

console.log(JSON.stringify(license))
