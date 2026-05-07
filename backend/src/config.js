const JWT_SECRET = process.env.JWT_SECRET || 'nexloja_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PORT = process.env.PORT || 3001;

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, PORT };
