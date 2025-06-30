import { getQueryClient, trpc } from "@/trpic/server";

interface Props {
    params: Promise<{
        projectId: string
    }>
}

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }))
    void queryClient.prefetchQuery(trpc.projects.getMany.queryOptions({
        id: projectId,
    }))

    const 

    return (
        <div>
            <h1>Project: {projectId}</h1>
        </div>
    );
}

export default Page;