import { config } from "dotenv";

const { parsed } = config();

export const {
  DB,
  DEV_URL,
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID,
  REGION,
  S3BUCKET,
  SECRET,
} = parsed;
