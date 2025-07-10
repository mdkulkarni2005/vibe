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
  
  optimizeCode: protectedProcedure
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

      // Create a message for code optimization
      const createMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: "AI-powered code review and optimization analysis for this Next.js project.",
          role: "USER",
          type: "RESULT",
        },
      });

      // Send to Inngest to process the code optimization
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: "Perform comprehensive AI-powered code review and optimization for this Next.js project. Please:\n\n🔍 **Code Analysis & Review:**\n1. Analyze all components for performance bottlenecks\n2. Review React patterns and suggest modern alternatives\n3. Identify unnecessary re-renders and optimize state management\n4. Check for memory leaks and cleanup issues\n5. Review prop drilling and suggest context optimization\n\n⚡ **Performance Optimization:**\n6. Add React.memo where beneficial\n7. Implement code splitting and lazy loading\n8. Optimize bundle size with dynamic imports\n9. Add proper loading states and skeleton screens\n10. Optimize images with Next.js Image component\n\n♿ **Accessibility Improvements:**\n11. Add proper ARIA labels and semantic HTML\n12. Implement keyboard navigation\n13. Ensure proper color contrast and focus indicators\n14. Add screen reader support\n15. Implement proper heading hierarchy\n\n🛡️ **Error Handling & Resilience:**\n16. Add comprehensive error boundaries\n17. Implement proper loading and error states\n18. Add input validation and sanitization\n19. Handle edge cases and null states\n20. Add proper TypeScript types and guards\n\n📱 **SEO & Meta Optimization:**\n21. Add proper meta tags and Open Graph data\n22. Implement structured data markup\n23. Optimize for Core Web Vitals\n24. Add proper sitemap and robots.txt\n25. Implement canonical URLs\n\n🔒 **Security Enhancements:**\n26. Add CSRF protection\n27. Implement proper input sanitization\n28. Add rate limiting suggestions\n29. Review and secure API endpoints\n30. Add proper environment variable handling\n\n🧪 **Code Quality:**\n31. Refactor complex components into smaller pieces\n32. Add proper documentation and comments\n33. Implement consistent naming conventions\n34. Add proper type safety throughout\n35. Suggest testing strategies\n\nProvide detailed explanations for each optimization, include before/after code examples, and prioritize changes by impact. Create an optimization report with performance metrics and recommendations.",
          projectId: input.projectId,
        },
      });

      return createMessage;
    }),
});
