import dotenv from 'dotenv';

dotenv.config();

const required = [
  ['Google', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'your_google_client_id', 'your_google_client_secret'],
];

let ok = true;

required.forEach(([provider, idKey, secretKey, placeholderId, placeholderSecret]) => {
  const id = process.env[idKey];
  const secret = process.env[secretKey];
  const configured = id && secret && id !== placeholderId && secret !== placeholderSecret;

  console.log(`${provider}: ${configured ? 'configure' : 'non configure'}`);

  if (!configured) ok = false;
});

if (!ok) process.exitCode = 1;

