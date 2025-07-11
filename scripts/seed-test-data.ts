import { createClient } from '@supabase/supabase-js';
import { db } from '../lib/db';
import { users, groups, usersToGroups, expenses, expenseSplits } from '../lib/db/schema';
import { inArray, eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return null;
  }
  return data.users.find(user => user.email === email) || null;
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // 1. Add 3 more users
    const testUsers = [
      { email: 'alice@test.com', password: 'password123', name: 'Alice Johnson', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Alice' },
      { email: 'bob@test.com', password: 'password123', name: 'Bob Smith', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Bob' },
      { email: 'charlie@test.com', password: 'password123', name: 'Charlie Brown', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Charlie' },
      { email: 'dave@test.com', password: 'password123', name: 'Dave Davis', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Dave' },
      { email: 'eve@test.com', password: 'password123', name: 'Eve Williams', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Eve' },
      { email: 'frank@test.com', password: 'password123', name: 'Frank Miller', avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Frank' }
    ];

    // Create users in Supabase Auth and public.users table
    for (const user of testUsers) {
      const existingUser = await findUserByEmail(user.email);
      if (!existingUser) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { name: user.name, avatar_url: user.avatar_url },
          email_confirm: true,
        });
        if (error) console.error(`Error creating user ${user.email}:`, error);
        else {
          console.log(`✅ Created auth user: ${user.email}`);
          // Insert into public users table immediately after creation
          await db.insert(users).values({
            id: data.user.id,
            email: data.user.email!,
            name: user.name,
            avatarUrl: user.avatar_url,
          }).onConflictDoNothing();
        }
      } else {
         console.log(`ℹ️  User ${user.email} already exists.`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for db replication

    // Get all user objects from the database
    const emails = testUsers.map(u => u.email);
    const publicUsers = await db.select().from(users).where(inArray(users.email, emails));
    if (publicUsers.length < 6) throw new Error('Failed to retrieve all test users.');

    const userMap = new Map(publicUsers.map(u => [u.email, u]));
    const alice = userMap.get('alice@test.com')!;
    const bob = userMap.get('bob@test.com')!;
    const charlie = userMap.get('charlie@test.com')!;
    const dave = userMap.get('dave@test.com')!;
    const eve = userMap.get('eve@test.com')!;
    const frank = userMap.get('frank@test.com')!;

    // 2. Create groups and memberships
    console.log('🧹 Clearing old group data...');
    await db.delete(expenseSplits);
    await db.delete(expenses);
    await db.delete(usersToGroups);
    await db.delete(groups);

    // Group 1: Weekend Trip (Alice, Bob, Charlie) - Unsettled
    const [weekendTrip] = await db.insert(groups).values({ name: 'Weekend Trip', description: 'Our amazing weekend getaway' }).returning();
    await db.insert(usersToGroups).values([
      { userId: alice.id, groupId: weekendTrip.id, role: 'admin' },
      { userId: bob.id, groupId: weekendTrip.id, role: 'member' },
      { userId: charlie.id, groupId: weekendTrip.id, role: 'member' },
    ]);

    // Group 2: Road Trip (All 6 users) - Unsettled with uneven splits
    const [roadTrip] = await db.insert(groups).values({ name: 'Cross-Country Road Trip', description: 'From coast to coast!' }).returning();
    await db.insert(usersToGroups).values([
      { userId: alice.id, groupId: roadTrip.id, role: 'admin' },
      { userId: bob.id, groupId: roadTrip.id, role: 'member' },
      { userId: charlie.id, groupId: roadTrip.id, role: 'member' },
      { userId: dave.id, groupId: roadTrip.id, role: 'member' },
      { userId: eve.id, groupId: roadTrip.id, role: 'member' },
      { userId: frank.id, groupId: roadTrip.id, role: 'member' },
    ]);

    // Group 3: Apartment 4B (Alice, Dave, Eve) - Settled
    const [apartment] = await db.insert(groups).values({ name: 'Apartment 4B', description: 'Rent and utilities' }).returning();
    await db.insert(usersToGroups).values([
      { userId: alice.id, groupId: apartment.id, role: 'admin' },
      { userId: dave.id, groupId: apartment.id, role: 'member' },
      { userId: eve.id, groupId: apartment.id, role: 'member' },
    ]);

    // Group 4: Office Lunches (Bob, Charlie, Frank) - Unsettled, not all members in each expense
    const [officeLunches] = await db.insert(groups).values({ name: 'Office Lunches', description: 'Weekly team lunch' }).returning();
    await db.insert(usersToGroups).values([
      { userId: bob.id, groupId: officeLunches.id, role: 'admin' },
      { userId: charlie.id, groupId: officeLunches.id, role: 'member' },
      { userId: frank.id, groupId: officeLunches.id, role: 'member' },
    ]);
    console.log('✅ Created groups and memberships');

    // 3. Create expenses for each group
    console.log('💸 Seeding expenses...');

    // --- Weekend Trip Expenses (Unsettled) ---
    const [wt_e1] = await db.insert(expenses).values({ groupId: weekendTrip.id, description: 'Hotel Bill', amount: '300.00', paidById: alice.id, date: new Date(), category: 'accommodation' }).returning();
    await db.insert(expenseSplits).values([
      { expenseId: wt_e1.id, userId: alice.id, amount: '100.00' }, { expenseId: wt_e1.id, userId: bob.id, amount: '100.00' }, { expenseId: wt_e1.id, userId: charlie.id, amount: '100.00' },
    ]);
    const [wt_e2] = await db.insert(expenses).values({ groupId: weekendTrip.id, description: 'Group Dinner', amount: '150.00', paidById: bob.id, date: new Date(), category: 'food' }).returning();
    await db.insert(expenseSplits).values([
      { expenseId: wt_e2.id, userId: alice.id, amount: '50.00' }, { expenseId: wt_e2.id, userId: bob.id, amount: '50.00' }, { expenseId: wt_e2.id, userId: charlie.id, amount: '50.00' },
    ]);

    // --- Road Trip Expenses (Unsettled, Uneven Splits) ---
    const [rt_e1] = await db.insert(expenses).values({ groupId: roadTrip.id, description: 'Gas', amount: '80.00', paidById: dave.id, date: new Date(), category: 'transportation' }).returning();
    await db.insert(expenseSplits).values([ // Split evenly
      ...[alice, bob, charlie, dave, eve, frank].map(u => ({ expenseId: rt_e1.id, userId: u.id, amount: (80/6).toFixed(2) }))
    ]);
    const [rt_e2] = await db.insert(expenses).values({ groupId: roadTrip.id, description: 'Snacks and Drinks', amount: '45.50', paidById: eve.id, date: new Date(), category: 'food' }).returning();
    await db.insert(expenseSplits).values([ // Uneven split
      { expenseId: rt_e2.id, userId: eve.id, amount: '10.00' }, { expenseId: rt_e2.id, userId: frank.id, amount: '10.00' }, { expenseId: rt_e2.id, userId: alice.id, amount: '15.50' }, { expenseId: rt_e2.id, userId: dave.id, amount: '10.00' },
    ]);

    // --- Apartment Rent Expenses (Settled) ---
    const [ap_e1] = await db.insert(expenses).values({ groupId: apartment.id, description: 'Monthly Rent', amount: '1500.00', paidById: dave.id, date: new Date(), category: 'utilities' }).returning();
    await db.insert(expenseSplits).values([
      { expenseId: ap_e1.id, userId: alice.id, amount: '500.00' }, { expenseId: ap_e1.id, userId: dave.id, amount: '500.00' }, { expenseId: ap_e1.id, userId: eve.id, amount: '500.00' },
    ]);
    const [ap_e2] = await db.insert(expenses).values({ groupId: apartment.id, description: 'Alice pays rent share', amount: '500.00', paidById: alice.id, date: new Date(), category: 'payment' }).returning();
    await db.insert(expenseSplits).values([ // Alice pays Dave back
      { expenseId: ap_e2.id, userId: dave.id, amount: '500.00' },
    ]);
    const [ap_e3] = await db.insert(expenses).values({ groupId: apartment.id, description: 'Eve pays rent share', amount: '500.00', paidById: eve.id, date: new Date(), category: 'payment' }).returning();
    await db.insert(expenseSplits).values([ // Eve pays Dave back
      { expenseId: ap_e3.id, userId: dave.id, amount: '500.00' },
    ]);

    // --- Office Lunch Expenses (Unsettled, Partial Group Splits) ---
    const [ol_e1] = await db.insert(expenses).values({ groupId: officeLunches.id, description: 'Pizza Day', amount: '45.00', paidById: bob.id, date: new Date(), category: 'food' }).returning();
    await db.insert(expenseSplits).values([ // All 3 participate
      { expenseId: ol_e1.id, userId: bob.id, amount: '15.00' }, { expenseId: ol_e1.id, userId: charlie.id, amount: '15.00' }, { expenseId: ol_e1.id, userId: frank.id, amount: '15.00' },
    ]);
    const [ol_e2] = await db.insert(expenses).values({ groupId: officeLunches.id, description: 'Taco Tuesday', amount: '22.00', paidById: charlie.id, date: new Date(), category: 'food' }).returning();
    await db.insert(expenseSplits).values([ // Only Charlie and Frank participate
      { expenseId: ol_e2.id, userId: charlie.id, amount: '11.00' }, { expenseId: ol_e2.id, userId: frank.id, amount: '11.00' },
    ]);

    console.log('🎉 Test data seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    console.log('👋 Exiting...');
    process.exit(0);
  }
}

seedTestData();