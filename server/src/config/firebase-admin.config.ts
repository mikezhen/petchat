import { registerAs } from '@nestjs/config';
import { env } from 'process';

export default registerAs('firebase-admin', () => ({
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
  privateKey: env.FIREBASE_ADMIN_SDK_PRIVATE_KEY.replace(/\\n/g, '\n'), // Need to replace \n placeholders with actual newlines for proper parsing from environment variable
}));
