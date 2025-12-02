import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function dropTables() {
    console.log('🔥 Dropping all tables...');
    try {
        // Disable foreign key checks to allow dropping tables in any order
        await db.execute(sql`DROP SCHEMA public CASCADE;`);
        await db.execute(sql`CREATE SCHEMA public;`);
        await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
        await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

        console.log('✅ All tables dropped and schema reset.');
    } catch (error) {
        console.error('❌ Error dropping tables:', error);
        process.exit(1);
    }
    process.exit(0);
}

dropTables();
