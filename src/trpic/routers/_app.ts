import { messagesRouter } from '@/modules/messages/server/procedures';
import { createTRPCRouter } from '../init';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';
import { reviewsRouter } from '@/modules/reviews/server/procedures';

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messagesRouter,
  projects: projectsRouter,
  reviews: reviewsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;