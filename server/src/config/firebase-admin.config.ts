import { registerAs } from '@nestjs/config';
import { env } from 'process';

export default registerAs('firebase-admin', () => ({
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
  privateKey: env.FIREBASE_ADMIN_SDK_PRIVATE_KEY,
}));
