import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/trpic/init';
import { prisma } from '@/lib/db';

export const reviewsRouter = createTRPCRouter({
  // Get all reviews for a project
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const reviews = await prisma.review.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          files: {
            include: {
              issues: true,
            },
          },
          issues: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reviews;
    }),

  // Get a specific review by ID
  getById: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const review = await prisma.review.findUnique({
        where: {
          id: input.reviewId,
        },
        include: {
          files: {
            include: {
              issues: {
                orderBy: [
                  { severity: 'asc' },
                  { type: 'asc' },
                ],
              },
            },
          },
          issues: {
            orderBy: [
              { severity: 'asc' },
              { type: 'asc' },
            ],
          },
        },
      });

      return review;
    }),

  // Get latest review for a project
  getLatest: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const review = await prisma.review.findFirst({
        where: {
          projectId: input.projectId,
        },
        include: {
          files: {
            include: {
              issues: {
                orderBy: [
                  { severity: 'asc' },
                  { type: 'asc' },
                ],
              },
            },
          },
          issues: {
            orderBy: [
              { severity: 'asc' },
              { type: 'asc' },
            ],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return review;
    }),

  // Create a new review
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const review = await prisma.review.create({
        data: {
          projectId: input.projectId,
          status: 'PENDING',
        },
      });

      return review;
    }),

  // Update review status and data
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
        summary: z.string().optional(),
        score: z.number().optional(),
        totalFiles: z.number().optional(),
        totalIssues: z.number().optional(),
        criticalIssues: z.number().optional(),
        highIssues: z.number().optional(),
        mediumIssues: z.number().optional(),
        lowIssues: z.number().optional(),
        architectureDiagram: z.string().optional(),
        complexityGraph: z.string().optional(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { reviewId, ...data } = input;

      const review = await prisma.review.update({
        where: { id: reviewId },
        data,
      });

      return review;
    }),

  // Add file to review
  addFile: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        filePath: z.string(),
        language: z.string().optional(),
        linesOfCode: z.number().default(0),
        complexity: z.number().default(0),
        score: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { reviewId, ...data } = input;

      const file = await prisma.reviewFile.create({
        data: {
          reviewId,
          ...data,
        },
      });

      return file;
    }),

  // Add issue to review
  addIssue: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        fileId: z.string().optional(),
        type: z.enum(['SECURITY', 'BUG', 'CODE_QUALITY', 'PERFORMANCE', 'BEST_PRACTICE']),
        severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
        title: z.string(),
        description: z.string(),
        filePath: z.string().optional(),
        lineStart: z.number().optional(),
        lineEnd: z.number().optional(),
        code: z.string().optional(),
        recommendation: z.string().optional(),
        fixCode: z.string().optional(),
        cweId: z.string().optional(),
        cvssScore: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { reviewId, ...data } = input;

      const issue = await prisma.codeIssue.create({
        data: {
          reviewId,
          ...data,
        },
      });

      return issue;
    }),

  // Get issues by severity
  getIssuesBySeverity: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
      })
    )
    .query(async ({ input }) => {
      const issues = await prisma.codeIssue.findMany({
        where: {
          reviewId: input.reviewId,
          severity: input.severity,
        },
        include: {
          file: true,
        },
      });

      return issues;
    }),

  // Get issues by type
  getIssuesByType: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        type: z.enum(['SECURITY', 'BUG', 'CODE_QUALITY', 'PERFORMANCE', 'BEST_PRACTICE']),
      })
    )
    .query(async ({ input }) => {
      const issues = await prisma.codeIssue.findMany({
        where: {
          reviewId: input.reviewId,
          type: input.type,
        },
        include: {
          file: true,
        },
      });

      return issues;
    }),

  // Delete a review
  delete: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.review.delete({
        where: {
          id: input.reviewId,
        },
      });

      return { success: true };
    }),
});
