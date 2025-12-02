import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';

config({ path: '.env.test.local' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function testClerk() {
    console.log('Testing Clerk API...');
    try {
        const list = await clerk.users.getUserList({ limit: 1 });
        console.log('✅ Clerk API connection successful. Users found:', list.totalCount);
    } catch (error) {
        console.error('❌ Clerk API failed:', error);
    }
}

testClerk();
