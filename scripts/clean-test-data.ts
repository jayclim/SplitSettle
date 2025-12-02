import { db } from '../lib/db';
import { users, groups, usersToGroups, expenses, expenseSplits, settlements, messages } from '../lib/db/schema';
import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';

// Load env vars for standalone script execution
config({ path: '.env.test.local' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function cleanTestData() {
  console.log('🧹 Cleaning test data...');

  try {
    // Delete in correct order to respect foreign key constraints
    await db.delete(expenseSplits);
    console.log('✅ Deleted expense splits');

    await db.delete(expenses);
    console.log('✅ Deleted expenses');

    await db.delete(messages);
    console.log('✅ Deleted messages');

    await db.delete(settlements);
    console.log('✅ Deleted settlements');

    await db.delete(usersToGroups);
    console.log('✅ Deleted user-group relationships');

    await db.delete(groups);
    console.log('✅ Deleted groups');

    await db.delete(users);
    console.log('✅ Deleted users from public table');

    // Delete test users from Clerk
    console.log('🔥 Finding and deleting Clerk test users...');
    try {
      const testEmails = [
        'alice@test.com', 'bob@test.com', 'charlie@test.com',
        'dave@test.com', 'eve@test.com', 'frank@test.com'
      ];

      for (const email of testEmails) {
        const userList = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
        if (userList.data.length > 0) {
          await clerk.users.deleteUser(userList.data[0].id);
          console.log(`✅ Deleted Clerk user: ${email}`);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting Clerk users:', error);
      // Don't fail the script if Clerk deletion fails, just log it
    }

    console.log('🎉 Test data cleanup completed!');
  } catch (error) {
    console.error('❌ Error cleaning test data:', error);
    process.exit(1);
  } finally {
    // Force exit the process
    console.log('👋 Exiting...');
    process.exit(0);
  }
}

cleanTestData();