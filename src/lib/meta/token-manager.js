import crypto from "crypto";
import { db } from "../db";
import { socialAccounts } from "../db/schema";
import { eq, lt } from "drizzle-orm";
import { getLongLivedToken } from "./oauth";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM is standard
const TAG_LENGTH = 16;

function getEncryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_ENCRYPTION_KEY is required in production!");
    }
    // Development fallback (32 bytes hex)
    return "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  }
  
  // Hash the key to guarantee it is exactly 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypts a text string using AES-256-GCM.
 */
export function encryptToken(text) {
  if (!text) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Return format: iv:encrypted:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an encrypted token string.
 */
export function decryptToken(encryptedString) {
  if (!encryptedString) return null;
  const key = getEncryptionKey();
  
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Checks all active social accounts and refreshes tokens that are nearing expiry (e.g. within 15 days).
 */
export async function refreshExpiringTokens() {
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

  const expiringAccounts = await db
    .select()
    .from(socialAccounts)
    .where(
      lt(socialAccounts.tokenExpiresAt, fifteenDaysFromNow)
    );

  console.log(`[TokenManager] Found ${expiringAccounts.length} expiring tokens.`);

  for (const account of expiringAccounts) {
    try {
      const decryptedToken = decryptToken(account.accessToken);
      
      console.log(`[TokenManager] Refreshing token for ${account.platformUsername} (${account.platform})`);
      
      // In Meta Graph API, to refresh a long-lived token, we exchange it again
      const refreshed = await getLongLivedToken(decryptedToken);
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (refreshed.expiresIn || 5184000));

      await db
        .update(socialAccounts)
        .set({
          accessToken: encryptToken(refreshed.accessToken),
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(socialAccounts.id, account.id));

      console.log(`[TokenManager] Successfully refreshed token for ${account.platformUsername}`);
    } catch (error) {
      console.error(`[TokenManager] Failed to refresh token for account ID ${account.id}:`, error);
    }
  }
}
