import { config } from "dotenv";

const { parsed } = config();

export const {
  DB,
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID,
  REGION,
  S3BUCKET,
  SECRET,
} = parsed;
