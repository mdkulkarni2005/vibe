import { useTRPC } from "@/trpic/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";

interface Props {
  projectId: string;
}

export const MessagesContainer = ({ projectId }) => {
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="pt-2 pr-1">
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            content={message.content}
            role={message.role}
            fragment={message.fragment}
            cratedAt={message.createdAt}
            isActiveFragment={false}
            onFragmentClick={() => {}}
            type={message.type}
          />
        ))}
      </div>
    </div>
  );
};
