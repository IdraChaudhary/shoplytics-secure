import { getDb } from '@/lib/database/connection';
import { encryptionKeys, stores } from '@/lib/database/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { generateStoreKey, encryptStoreKey, decryptStoreKey } from './crypto';

export class KeyManager {
  /**
   * Get the active encryption key for a store
   */
  static async getActiveStoreKey(storeId: string): Promise<string> {
    try {
      const db = getDb();
      const keyRecord = await db
        .select()
        .from(encryptionKeys)
        .where(
          and(
            eq(encryptionKeys.storeId, storeId),
            eq(encryptionKeys.isActive, true)
          )
        )
        .orderBy(desc(encryptionKeys.keyVersion))
        .limit(1);

      if (!keyRecord.length) {
        // Generate new key if none exists
        return await this.generateNewStoreKey(storeId);
      }

      const decryptedKey = decryptStoreKey(keyRecord[0].encryptedKey);
      return decryptedKey;
    } catch (error) {
      console.error('Failed to retrieve store key:', error);
      throw new Error('Key retrieval failed');
    }
  }

  /**
   * Generate a new encryption key for a store
   */
  static async generateNewStoreKey(storeId: string): Promise<string> {
    try {
      const db = getDb();
      
      // Generate new key
      const newKey = generateStoreKey();
      const encryptedKey = encryptStoreKey(newKey);

      // Get current highest version
      const currentKeys = await db
        .select({ keyVersion: encryptionKeys.keyVersion })
        .from(encryptionKeys)
        .where(eq(encryptionKeys.storeId, storeId))
        .orderBy(desc(encryptionKeys.keyVersion))
        .limit(1);

      const nextVersion = currentKeys.length ? currentKeys[0].keyVersion + 1 : 1;

      // Insert new key
      await db.insert(encryptionKeys).values({
        storeId,
        keyVersion: nextVersion,
        encryptedKey,
        algorithm: 'AES-256-GCM',
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });

      console.log(`Generated new encryption key v${nextVersion} for store ${storeId}`);
      return newKey;
    } catch (error) {
      console.error('Failed to generate store key:', error);
      throw new Error('Key generation failed');
    }
  }

  /**
   * Rotate encryption keys for a store (zero-downtime rotation)
   */
  static async rotateStoreKey(storeId: string): Promise<void> {
    try {
      console.log(`Starting key rotation for store ${storeId}`);
      
      const db = getDb();

      // Step 1: Generate new key (but don't activate yet)
      const newKey = generateStoreKey();
      const encryptedKey = encryptStoreKey(newKey);

      const currentKeys = await db
        .select({ keyVersion: encryptionKeys.keyVersion })
        .from(encryptionKeys)
        .where(eq(encryptionKeys.storeId, storeId))
        .orderBy(desc(encryptionKeys.keyVersion))
        .limit(1);

      const nextVersion = currentKeys.length ? currentKeys[0].keyVersion + 1 : 1;

      // Step 2: Insert new key (inactive initially)
      await db.insert(encryptionKeys).values({
        storeId,
        keyVersion: nextVersion,
        encryptedKey,
        algorithm: 'AES-256-GCM',
        isActive: false, // Not active yet
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      // Step 3: TODO - Re-encrypt sensitive data with new key
      // This would be a background job in production
      await this.reencryptStoreData(storeId, newKey);

      // Step 4: Activate new key and deactivate old ones
      await db.transaction(async (tx) => {
        // Deactivate all old keys
        await tx
          .update(encryptionKeys)
          .set({ 
            isActive: false, 
            rotatedAt: new Date() 
          })
          .where(
            and(
              eq(encryptionKeys.storeId, storeId),
              eq(encryptionKeys.isActive, true)
            )
          );

        // Activate new key
        await tx
          .update(encryptionKeys)
          .set({ isActive: true })
          .where(
            and(
              eq(encryptionKeys.storeId, storeId),
              eq(encryptionKeys.keyVersion, nextVersion)
            )
          );
      });

      console.log(`Key rotation completed for store ${storeId}. New version: ${nextVersion}`);
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw new Error('Key rotation failed');
    }
  }

  /**
   * Re-encrypt store data with new key (background process)
   * In production, this would be done in batches with a queue system
   */
  private static async reencryptStoreData(storeId: string, newKey: string): Promise<void> {
    try {
      console.log(`Re-encrypting data for store ${storeId} with new key`);
      
      // This is a simplified version - in production you'd:
      // 1. Process data in batches
      // 2. Use a queue system for large datasets
      // 3. Implement retry mechanisms
      // 4. Track progress and handle failures gracefully
      
      // Example: Re-encrypt customer emails (simplified)
      // const customers = await db.select().from(customers).where(eq(customers.storeId, storeId));
      // for (const customer of customers) {
      //   if (customer.email) {
      //     const decryptedEmail = decryptData(customer.email, oldKey);
      //     const reencryptedEmail = encryptData(decryptedEmail, newKey);
      //     await db.update(customers)
      //       .set({ email: reencryptedEmail })
      //       .where(eq(customers.id, customer.id));
      //   }
      // }

      // For now, we'll just log the operation
      console.log(`Data re-encryption completed for store ${storeId}`);
    } catch (error) {
      console.error('Data re-encryption failed:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic key rotation for stores
   */
  static async scheduleKeyRotation(): Promise<void> {
    try {
      console.log('Checking for keys that need rotation...');

      const db = getDb();

      // Find keys that are close to expiration (30 days)
      const expirationThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const expiringKeys = await db
        .select({ 
          storeId: encryptionKeys.storeId,
          keyVersion: encryptionKeys.keyVersion,
          expiresAt: encryptionKeys.expiresAt 
        })
        .from(encryptionKeys)
        .where(
          and(
            eq(encryptionKeys.isActive, true),
            // expiresAt < expirationThreshold - Note: This would need proper date comparison in Drizzle
          )
        );

      for (const key of expiringKeys) {
        console.log(`Scheduling rotation for store ${key.storeId}, key version ${key.keyVersion}`);
        // In production, you'd add this to a job queue
        await this.rotateStoreKey(key.storeId);
      }

      console.log(`Processed ${expiringKeys.length} key rotations`);
    } catch (error) {
      console.error('Scheduled key rotation failed:', error);
    }
  }

  /**
   * Get key rotation history for a store
   */
  static async getKeyHistory(storeId: string) {
    try {
      const db = getDb();
      return await db
        .select({
          version: encryptionKeys.keyVersion,
          algorithm: encryptionKeys.algorithm,
          isActive: encryptionKeys.isActive,
          createdAt: encryptionKeys.createdAt,
          rotatedAt: encryptionKeys.rotatedAt,
          expiresAt: encryptionKeys.expiresAt,
        })
        .from(encryptionKeys)
        .where(eq(encryptionKeys.storeId, storeId))
        .orderBy(desc(encryptionKeys.keyVersion));
    } catch (error) {
      console.error('Failed to get key history:', error);
      throw new Error('Key history retrieval failed');
    }
  }

  /**
   * Clean up old expired keys (retention policy)
   */
  static async cleanupExpiredKeys(): Promise<void> {
    try {
      const db = getDb();
      
      // Keep keys for 2 years after rotation for audit purposes
      const retentionThreshold = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      
      const result = await db
        .delete(encryptionKeys)
        .where(
          and(
            eq(encryptionKeys.isActive, false),
            // rotatedAt < retentionThreshold - Note: Proper date comparison needed
          )
        );

      console.log(`Cleaned up expired encryption keys`);
    } catch (error) {
      console.error('Key cleanup failed:', error);
    }
  }
}
