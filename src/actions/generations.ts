'use server';

import { getDb } from '@/db';
import { userGeneration } from '@/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface UserGeneration {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  toolType: string;
  style: string;
  aspectRatio: string;
  sourceImageUrl: string | null;
  creditsUsed: number;
  createdAt: Date;
}

/**
 * Get all generations for the current user
 */
export async function getUserGenerations(): Promise<UserGeneration[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const db = await getDb();
  const generations = await db
    .select()
    .from(userGeneration)
    .where(eq(userGeneration.userId, session.user.id))
    .orderBy(desc(userGeneration.createdAt));

  return generations as UserGeneration[];
}

/**
 * Delete a generation by ID
 */
export async function deleteGeneration(generationId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const db = await getDb();

  // Verify the generation belongs to the user
  const generation = await db
    .select()
    .from(userGeneration)
    .where(eq(userGeneration.id, generationId))
    .limit(1);

  if (generation.length === 0 || generation[0].userId !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  await db.delete(userGeneration).where(eq(userGeneration.id, generationId));
}
