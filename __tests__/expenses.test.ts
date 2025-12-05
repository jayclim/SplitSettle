import { cleanTestData } from '@/scripts/clean-test-data';
import { seedTestData } from '@/scripts/seed-test-data';
import { db, client } from '@/lib/db';
import { users, groups, expenses, expenseSplits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Expenses Integration Tests', () => {
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

    it('should have seeded unequal split expense correctly', async () => {
        // Find Project X
        const projectX = await db.query.groups.findFirst({
            where: eq(groups.name, 'Project X')
        });
        expect(projectX).toBeDefined();

        // Find the unequal split expense
        const expense = await db.query.expenses.findFirst({
            where: (expenses, { and, eq }) => and(
                eq(expenses.groupId, projectX!.id),
                eq(expenses.description, 'Unequal Split Test')
            ),
            with: {
                splits: {
                    with: {
                        user: true
                    }
                }
            }
        });

        expect(expense).toBeDefined();
        expect(expense?.amount).toBe('100.00');
        expect(expense?.splits.length).toBe(3);

        // Verify individual splits
        const aliceSplit = expense?.splits.find(s => s.user.name?.includes('Alice'));
        const bobSplit = expense?.splits.find(s => s.user.name?.includes('Bob'));
        const charlieSplit = expense?.splits.find(s => s.user.name?.includes('Charlie'));

        expect(aliceSplit).toBeDefined();
        expect(parseFloat(aliceSplit?.amount || '0')).toBe(10.00);

        expect(bobSplit).toBeDefined();
        expect(parseFloat(bobSplit?.amount || '0')).toBe(20.00);

        expect(charlieSplit).toBeDefined();
        expect(parseFloat(charlieSplit?.amount || '0')).toBe(70.00);
    });
});
