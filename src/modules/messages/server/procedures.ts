import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpic/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragment: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });
      return messages;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is required" })
          .max(10000, { message: "Message is too long" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId, // Assuming userId is part of the context
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      try {
        await consumeCredits();
      } catch (error) {
        if(error instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" })
        }
        else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "you have run out of credit"
          })
        }
      }

      const createMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createMessage;
    }),
  
  addClerkAuth: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the project belongs to the user
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!project) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Project not found or you don't have permission to modify it" 
        });
      }

      // Create a message for adding Clerk authentication
      const createMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: "Add Clerk authentication to this Next.js project. Install @clerk/nextjs, set up middleware, create authentication pages, and update the layout with sign-in/sign-up functionality.",
          role: "USER",
          type: "RESULT",
        },
      });

      // Send to Inngest to process the Clerk integration
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: "Add Clerk authentication to this Next.js project. Please:\n\n1. Install @clerk/nextjs package using npm install\n2. Create middleware.ts with clerkMiddleware\n3. Update app/layout.tsx to include ClerkProvider and authentication UI\n4. Create sign-in and sign-up pages under app/sign-in/[[...sign-in]]/page.tsx and app/sign-up/[[...sign-up]]/page.tsx\n5. Add a protected dashboard page at app/dashboard/page.tsx\n6. Update the main page to show authentication status\n7. Create .env.local with placeholder Clerk keys and instructions\n\nMake sure to follow the latest Clerk + Next.js App Router patterns and include proper TypeScript types.",
          projectId: input.projectId,
        },
      });

      return createMessage;
    }),
});
