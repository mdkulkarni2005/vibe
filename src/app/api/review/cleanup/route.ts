import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * Cleanup endpoint to mark stuck IN_PROGRESS reviews as FAILED
 * This helps when reviews get stuck due to errors
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Find stuck reviews (IN_PROGRESS for more than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await prisma.review.updateMany({
      where: {
        projectId,
        status: 'IN_PROGRESS',
        createdAt: {
          lt: fiveMinutesAgo,
        },
        project: {
          userId: session.userId,
        },
      },
      data: {
        status: 'FAILED',
        summary: 'Review timed out or encountered an error',
      },
    });

    return NextResponse.json({ 
      message: 'Cleanup complete', 
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Error cleaning up reviews:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup reviews' },
      { status: 500 }
    );
  }
}
