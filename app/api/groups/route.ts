// filepath: app/api/groups/route.ts
import { db } from "@/lib/db";
import { groups, usersToGroups, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userGroups = await db.select({
            id: groups.id,
            name: groups.name,
            description: groups.description,
            coverImageUrl: groups.coverImageUrl,
        })
        .from(groups)
        .innerJoin(usersToGroups, eq(groups.id, usersToGroups.groupId))
        .where(eq(usersToGroups.userId, user.id));

        // Here you would also calculate balance, unread count etc.
        // For now, returning the basic group info.

        return NextResponse.json({ groups: userGroups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
        return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    try {
        const [newGroup] = await db.insert(groups).values({ name, description }).returning();

        await db.insert(usersToGroups).values({
            userId: user.id,
            groupId: newGroup.id,
            role: 'admin',
        });

        return NextResponse.json({ group: newGroup }, { status: 201 });
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}