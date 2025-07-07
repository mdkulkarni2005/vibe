import { getUsageStatus } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpic/init";

export const usageRouter = createTRPCRouter({
    status: protectedProcedure.query(async () => {
        try {
            const result = await getUsageStatus();

            return result;
        } catch {
            return null
        }
    })    
})