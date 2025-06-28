import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpic/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs"

export const projectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    //   include: {
    //     fragment: true
    //   }
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Value is required" }). max(10000, { message: "Value is long" }),
      })
    )
    .mutation(async ({ input }) => {

      const createProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab"
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            }
          }
        }
      })
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createProject.id,
        },
      });

      return createProject;
    }),
});
