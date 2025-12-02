import { randomUUID } from 'crypto';
import { db } from '../lib/db';
import { users, groups, usersToGroups, expenses, expenseSplits } from '../lib/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';

// Load env vars for standalone script execution
config({ path: '.env.test.local' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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

    // Create users in Clerk and public.users table
    for (const user of testUsers) {
      let clerkUserId: string;

      // 1. Check/Create in Clerk
      try {
        const clerkUserList = await clerk.users.getUserList({ emailAddress: [user.email], limit: 1 });

        if (clerkUserList.data.length > 0) {
          clerkUserId = clerkUserList.data[0].id;
          console.log(`ℹ️  Clerk user ${user.email} already exists (${clerkUserId}).`);
        } else {
          console.log(`Creating Clerk user: ${user.email}`);
          const newClerkUser = await clerk.users.createUser({
            emailAddress: [user.email],
            password: user.password,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            skipPasswordChecks: true,
            skipPasswordRequirement: true,
          });
          clerkUserId = newClerkUser.id;
          console.log(`✅ Created Clerk user: ${user.email} (${clerkUserId})`);
        }
      } catch (error) {
        console.error(`❌ Failed to manage Clerk user ${user.email}:`, error);
        continue; // Skip to next user if Clerk fails
      }

      // 2. Create/Update in Local DB
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      });

      if (!existingUser) {
        console.log(`✅ Creating local user: ${user.email}`);
        await db.insert(users).values({
          id: clerkUserId,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          isGhost: false,
        }).onConflictDoNothing();
      } else if (existingUser.id !== clerkUserId) {
        console.log(`🔄 Updating local user ID: ${existingUser.id} -> ${clerkUserId}`);
        // We can't easily update PK with cascade in simple update, but since we have onUpdate: cascade now:
        await db.update(users).set({ id: clerkUserId }).where(eq(users.email, user.email));
      } else {
        console.log(`ℹ️  Local user ${user.email} already exists and matches.`);
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

    // Add a ghost user to Weekend Trip
    const [ghostUser] = await db.insert(users).values({
      id: `ghost_${randomUUID()}`,
      name: 'Ghost Rider',
      email: `ghost_${Date.now()}@placeholder.com`,
      isGhost: true,
    }).returning();

    await db.insert(usersToGroups).values({
      userId: ghostUser.id,
      groupId: weekendTrip.id,
      role: 'member',
    });

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
      ...[alice, bob, charlie, dave, eve, frank].map(u => ({ expenseId: rt_e1.id, userId: u.id, amount: (80 / 6).toFixed(2) }))
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