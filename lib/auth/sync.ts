import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function syncUser() {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.emailAddresses[0].emailAddress),
    });

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;

    if (existingUser) {
        // If user exists but ID doesn't match (e.g. seeded user claiming account), update it.
        if (existingUser.id !== user.id) {
            console.log(`🔄 Syncing user ID for ${user.emailAddresses[0].emailAddress}: ${existingUser.id} -> ${user.id}`);
            await db.update(users)
                .set({ id: user.id, avatarUrl: user.imageUrl, name: name })
                .where(eq(users.id, existingUser.id));

            // Return the updated user object
            return { ...existingUser, id: user.id, avatarUrl: user.imageUrl, name: name };
        }
        return existingUser;
    }

    // Create new user
    const [newUser] = await db.insert(users).values({
        id: user.id,
        name: name,
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
        avatarUrl: user.imageUrl,
    }).returning();

    return newUser;
}
