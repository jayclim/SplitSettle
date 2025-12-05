import { getExpenses, removeMember, respondToInvitation } from '@/lib/actions/groups';
import { db } from '@/lib/db';
import { users, groups, usersToGroups, activityLogs, invitations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { syncUser } from '@/lib/auth/sync';

let mockUserId = 'user_alice';

// Mock auth
jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn().mockImplementation(() => Promise.resolve({ userId: mockUserId })),
}));

jest.mock('@/lib/auth/sync', () => ({
    syncUser: jest.fn(),
}));

describe('Activity Logs', () => {
    let groupId: number;
    let aliceId: string;
    let bobId: string;

    beforeAll(async () => {
        // Setup: Get Alice and Bob, create a group
        const alice = await db.query.users.findFirst({ where: eq(users.email, 'alice@test.com') });
        const bob = await db.query.users.findFirst({ where: eq(users.email, 'bob@test.com') });

        if (!alice || !bob) throw new Error('Test users not found');
        aliceId = alice.id;
        bobId = bob.id;
        mockUserId = aliceId;

        // Create a group for testing
        const [group] = await db.insert(groups).values({
            name: 'Log Test Group',
            description: 'Testing logs',
        }).returning();
        groupId = group.id;

        // Add Alice as admin
        await db.insert(usersToGroups).values({
            userId: aliceId,
            groupId: groupId,
            role: 'admin',
        });

        // Add Bob as member
        await db.insert(usersToGroups).values({
            userId: bobId,
            groupId: groupId,
            role: 'member',
        });

        (syncUser as jest.Mock).mockResolvedValue({ id: aliceId, email: 'alice@test.com' });
    });

    afterAll(async () => {
        // Cleanup
        await db.delete(groups).where(eq(groups.id, groupId));
    });

    it('should log member removal', async () => {
        // Remove Bob
        await removeMember(groupId.toString(), bobId);

        // Check log
        const log = await db.query.activityLogs.findFirst({
            where: and(
                eq(activityLogs.groupId, groupId),
                eq(activityLogs.action, 'member_removed'),
                eq(activityLogs.entityId, bobId)
            ),
        });

        expect(log).toBeDefined();
        expect(log?.actorId).toBe(aliceId);
    });

    it('should log member addition via invite', async () => {
        // Create invite for Bob (since he was removed)
        const [invite] = await db.insert(invitations).values({
            groupId: groupId,
            email: 'bob@test.com',
            invitedById: aliceId,
            status: 'pending',
        }).returning();

        // Switch context to Bob
        mockUserId = bobId;
        (syncUser as jest.Mock).mockResolvedValue({ id: bobId, email: 'bob@test.com' });

        // Accept invite
        await respondToInvitation(invite.id, true);

        // Switch back to Alice
        mockUserId = aliceId;
        (syncUser as jest.Mock).mockResolvedValue({ id: aliceId, email: 'alice@test.com' });

        // Check log
        const log = await db.query.activityLogs.findFirst({
            where: and(
                eq(activityLogs.groupId, groupId),
                eq(activityLogs.action, 'member_added'),
                eq(activityLogs.entityId, bobId)
            ),
        });

        expect(log).toBeDefined();
        expect(log?.actorId).toBe(bobId); // Bob added himself
    });

    it('should fetch logs in getExpenses', async () => {
        const result = await getExpenses(groupId.toString());

        // Should have at least the removal and addition logs
        const logs = result.expenses.filter(e => e.type === 'member_added' || e.type === 'member_removed');
        expect(logs.length).toBeGreaterThanOrEqual(2);

        // Verify structure
        const addedLog = logs.find(l => l.type === 'member_added');
        expect(addedLog).toBeDefined();
        expect(addedLog?.description).toBe('joined the group');
        expect(addedLog?.category).toBe('Log');
    });
});
