import { db } from '../lib/db';
import { invitations } from '../lib/db/schema';
import { config } from 'dotenv';

config({ path: '.env.test.local' });

async function main() {
    try {
        console.log('Querying invitations...');
        // @ts-ignore
        if (!db.query.invitations) {
            console.error('db.query.invitations is undefined!');
            return;
        }
        const result = await db.query.invitations.findMany({
            limit: 1
        });
        console.log('Success. Found:', result.length);
    } catch (error) {
        console.error('Error querying invitations:', error);
    }
    process.exit(0);
}

main();