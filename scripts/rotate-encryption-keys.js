#!/usr/bin/env node

/**
 * Encryption Key Rotation Script
 * 
 * This script handles the rotation of encryption keys for all stores.
 * It should be run periodically (monthly/quarterly) or on-demand.
 * 
 * Usage:
 * - Rotate all keys: node scripts/rotate-encryption-keys.js
 * - Rotate specific store: node scripts/rotate-encryption-keys.js --store-id=<uuid>
 * - Dry run: node scripts/rotate-encryption-keys.js --dry-run
 */

const { KeyManager } = require('../dist/lib/encryption/key-manager');
const { db } = require('../dist/lib/database/connection');
const { stores } = require('../dist/lib/database/schemas');

async function main() {
  const args = process.argv.slice(2);
  const storeId = args.find(arg => arg.startsWith('--store-id='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  console.log('🔐 Starting encryption key rotation process...');
  
  if (dryRun) {
    console.log('📋 DRY RUN MODE - No changes will be made');
  }

  try {
    let storeIds = [];

    if (storeId) {
      console.log(`🎯 Rotating keys for specific store: ${storeId}`);
      storeIds = [storeId];
    } else {
      console.log('🌐 Rotating keys for all stores...');
      const allStores = await db.select({ id: stores.id }).from(stores);
      storeIds = allStores.map(store => store.id);
    }

    console.log(`📊 Found ${storeIds.length} stores to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const currentStoreId of storeIds) {
      try {
        console.log(`\n⚡ Processing store: ${currentStoreId}`);
        
        if (!dryRun) {
          await KeyManager.rotateStoreKey(currentStoreId);
        }
        
        console.log(`✅ Key rotation completed for store: ${currentStoreId}`);
        successCount++;
        
        // Small delay between rotations to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to rotate keys for store ${currentStoreId}:`, error.message);
        errorCount++;
        
        if (!force) {
          console.log('🛑 Stopping due to error. Use --force to continue on errors.');
          break;
        }
      }
    }

    console.log('\n📈 Rotation Summary:');
    console.log(`✅ Successful rotations: ${successCount}`);
    console.log(`❌ Failed rotations: ${errorCount}`);
    console.log(`📊 Total processed: ${successCount + errorCount}`);

    if (errorCount === 0) {
      console.log('🎉 All key rotations completed successfully!');
    } else if (successCount > 0) {
      console.log('⚠️  Some key rotations failed. Check logs for details.');
    } else {
      console.log('💥 All key rotations failed. Please investigate.');
      process.exit(1);
    }

    // Clean up old keys after successful rotation
    if (!dryRun && successCount > 0) {
      console.log('\n🧹 Cleaning up old expired keys...');
      await KeyManager.cleanupExpiredKeys();
      console.log('✅ Cleanup completed');
    }

  } catch (error) {
    console.error('💥 Fatal error during key rotation:', error);
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted. Cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Process terminated. Cleaning up...');
  process.exit(0);
});

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔐 Encryption Key Rotation Script

Usage:
  node scripts/rotate-encryption-keys.js [options]

Options:
  --store-id=<uuid>   Rotate keys for a specific store only
  --dry-run          Simulate the rotation without making changes
  --force            Continue rotation even if some stores fail
  --help, -h         Show this help message

Examples:
  node scripts/rotate-encryption-keys.js
  node scripts/rotate-encryption-keys.js --store-id=12345678-1234-5678-9abc-123456789abc
  node scripts/rotate-encryption-keys.js --dry-run
  node scripts/rotate-encryption-keys.js --force

Security Notes:
- This script requires database access and encryption keys
- Run in a secure environment with proper access controls
- Monitor the process and verify success before considering complete
- Keep backups of data before running key rotation
`);
  process.exit(0);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };
