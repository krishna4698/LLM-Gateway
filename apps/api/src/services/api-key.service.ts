import crypto from 'node:crypto';
import { prisma } from '@repo/db';

export interface GeneratedKey {
  rawKey: string;      // Shown to user once like this :"gw_live_8f"
  prefix: string;     
  secretHash: string;  // will be  Stored in database
}

interface cachedKey{
  data:any,
  expiresAt:number
}
const authCache= new Map<string, cachedKey>();
// console.log(authCache, "authcache")
const authCache_TTL= 60 * 1000;

export function generateApiKey(): GeneratedKey {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `gw_live_${randomBytes}`;
  const prefix = rawKey.slice(0, 15); // e.g. "gw_live_8f3a9e1"

  const secretHash = hashApiKey(rawKey);

  return { rawKey, prefix, secretHash };
}


export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key.trim()).digest('hex');
}


export async function validateApiKey(rawKey: string) {
console.log(authCache, "authcache")

  if (!rawKey.startsWith('gw_live_')) {
    return null;
  }

  const secretHash = hashApiKey(rawKey);
  const cached= authCache.get(secretHash);
  if(cached && Date.now()< cached.expiresAt){
    return cached.data;
  }

  // Prisma 8 syntax: look up by unique hash
  const gatewayKey = await prisma.GatewayKey.where({ secretHash }).first();

  if (!gatewayKey) {
    return null;
  }

  if (gatewayKey.status !== 'active') {
    authCache.delete(secretHash)
    return null;
  }

  if (gatewayKey.expiresAt && new Date(gatewayKey.expiresAt) < new Date()) {
    authCache.delete(secretHash);
    return null; 
  }
  authCache.set(secretHash, {
    data:gatewayKey,
    expiresAt:Date.now() + authCache_TTL
  })


  return gatewayKey;
}
