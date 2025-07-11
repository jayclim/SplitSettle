import { createClient } from '@supabase/supabase-js';
import { db } from '../lib/db';
import { users, groups, usersToGroups, expenses, expenseSplits, settlements, messages } from '../lib/db/schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

    // Dynamically find and delete all test auth users
    console.log('🔥 Finding and deleting test auth users...');
    const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new Error(`Could not list auth users: ${error.message}`);
    }

    const testUsersToDelete = authUsers.filter(user => user.email?.endsWith('@test.com'));

    if (testUsersToDelete.length === 0) {
      console.log('ℹ️ No test users found in Supabase Auth to delete.');
    } else {
      for (const user of testUsersToDelete) {
        try {
          await supabase.auth.admin.deleteUser(user.id);
          console.log(`✅ Deleted auth user: ${user.email}`);
        } catch (deleteError) {
          console.error(`❌ Failed to delete auth user ${user.email}:`, deleteError);
        }
      }
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