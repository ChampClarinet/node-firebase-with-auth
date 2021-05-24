import * as dotenv from 'dotenv';
dotenv.config();
import firebaseConfig from './firebase.config';

export const KEY_FILE_NAME = './key.json';

export const FIREBASE = firebaseConfig;

export const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE_MB || 100) as number * 1024 * 1024;

export const PORT = process.env.PORT || 3000;

export const DOWNLOAD_URL_LIFETIME = (process.env.DOWNLOAD_URL_LIFETIME_MINUTES || 10) as number * 6e5;