// filepath: app/api/expenses/route.ts
import { db } from "@/lib/db";
import { expenses, expenseSplits } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/auth/sync";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await syncUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, description, amount, splitBetween, category, date } = await request.json();

    // Basic validation
    if (!groupId || !description || !amount || !splitBetween || !splitBetween.length) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Create the expense
        const [newExpense] = await db.insert(expenses).values({
            groupId,
            description,
            amount: String(amount),
            paidById: user.id,
            category,
            date: date || new Date(),
        }).returning();

        // Create the splits
        const splitAmount = amount / splitBetween.length;
        const splitsToInsert = splitBetween.map((userId: string) => ({
            expenseId: newExpense.id,
            userId: userId,
            amount: String(splitAmount),
        }));

        await db.insert(expenseSplits).values(splitsToInsert);

        return NextResponse.json({ expense: newExpense }, { status: 201 });

    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}