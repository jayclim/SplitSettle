import { cleanTestData } from '@/scripts/clean-test-data';
import { seedTestData } from '@/scripts/seed-test-data';
import { db, client } from '@/lib/db';
import { users, groups, usersToGroups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Groups Integration Tests', () => {
    // Increase timeout for DB operations
    jest.setTimeout(60000);

    beforeAll(async () => {
        // Reset and seed the test database
        console.log('🔄 Resetting test database...');
        try {
            await cleanTestData(true);
            await seedTestData(true);
            console.log('✅ Test database reset complete.');
        } catch (error) {
            console.error('❌ Failed to reset test database:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await client.end();
    });

    it('should have seeded users', async () => {
        const allUsers = await db.select().from(users);
        expect(allUsers.length).toBeGreaterThan(0);

        const alice = allUsers.find(u => u.email === 'alice@test.com');
        expect(alice).toBeDefined();
        expect(alice?.name).toBe('Alice Johnson');
    });

    it('should have seeded groups', async () => {
        const allGroups = await db.select().from(groups);
        expect(allGroups.length).toBeGreaterThan(0);

        const weekendTrip = allGroups.find(g => g.name === 'Weekend Trip');
        expect(weekendTrip).toBeDefined();
        expect(weekendTrip?.description).toBe('Our amazing weekend getaway');
    });

    it('should have correct group memberships', async () => {
        const weekendTrip = await db.query.groups.findFirst({
            where: eq(groups.name, 'Weekend Trip'),
            with: {
                members: {
                    with: {
                        user: true
                    }
                }
            }
        });

        expect(weekendTrip).toBeDefined();
        expect(weekendTrip?.members.length).toBeGreaterThanOrEqual(3); // Alice, Bob, Charlie + Ghost

        const memberNames = weekendTrip?.members.map(m => m.user.name);
        expect(memberNames).toContain('Alice Johnson');
        expect(memberNames).toContain('Bob Smith');
    });

    it('should allow creating a new group', async () => {
        const newGroupName = 'Test Group ' + Date.now();
        const [newGroup] = await db.insert(groups).values({
            name: newGroupName,
            description: 'Created during test'
        }).returning();

        expect(newGroup).toBeDefined();
        expect(newGroup.id).toBeDefined();
        expect(newGroup.name).toBe(newGroupName);

        const fetchedGroup = await db.query.groups.findFirst({
            where: eq(groups.id, newGroup.id)
        });

        expect(fetchedGroup).toBeDefined();
        expect(fetchedGroup?.name).toBe(newGroupName);
    });
});
