const { JwtService } = require('@nestjs/jwt');

const token = process.argv[2];
const secret = process.argv[3] || process.env.JWT_SECRET || 'secret';

if (!token) {
  console.error('Usage: node scripts/verify-jwt.js <token> [secret]');
  process.exit(1);
}

const jwt = new JwtService({ secret });
try {
  const decoded = jwt.decode(token, { json: true });
  console.log('decoded:', decoded);
  const verified = jwt.verify(token);
  console.log('verify: OK, payload:', verified);
} catch (e) {
  console.error('verify error:', e.message);
  process.exit(2);
}

