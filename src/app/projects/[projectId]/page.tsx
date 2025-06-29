interface Props {
    params: Promise<{
        projectId: string
    }>
}

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    const 

    return (
        <div>
            <h1>Project: {projectId}</h1>
        </div>
    );
}

export default Page;