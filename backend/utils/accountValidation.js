import crypto from 'crypto';

export const generateTemporaryPassword = () => {
  return `Temp${crypto.randomBytes(4).toString('hex')}!`;
};

export const generateValidationToken = () => {
  const plainToken = crypto.randomBytes(24).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

  return { plainToken, hashedToken };
};

export const hashValidationToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const buildValidationLink = (plainToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/validate-account?validationToken=${plainToken}`;
};
