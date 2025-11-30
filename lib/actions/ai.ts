'use server';

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

export type AIExpenseData = {
    groupId: string;
    description: string;
};

export type ParsedExpense = {
    description: string;
    amount: number;
    splitBetween: string[]; // Names or descriptions of people
    category: string;
    splitType: 'equal' | 'custom';
};

export async function processAIExpenseAction(data: AIExpenseData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    throw new Error('AI features are currently disabled');

    /*
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expense parsing assistant. Extract expense details from the user's description.
          Return a JSON object with the following fields:
          - description: A short summary of the expense
          - amount: The total amount as a number
          - splitBetween: An array of names of people involved (including the payer if mentioned)
          - category: One of [Food, Transportation, Entertainment, Shopping, Utilities, Other]
          - splitType: 'equal' (default) or 'custom' if specific amounts are mentioned.
          
          If you cannot extract specific details, make a best guess or leave them empty/null.`
                },
                {
                    role: "user",
                    content: data.description
                }
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No response from AI');
        }

        const parsed = JSON.parse(content) as ParsedExpense;
        return { success: true, parsedExpense: parsed };

    } catch (error) {
        console.error('Error processing AI expense:', error);
        throw new Error('Failed to process expense with AI');
    }
    */
}
