"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon, GithubIcon } from "lucide-react";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpic/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypeOf } from "zod";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";
import { useClerk } from "@clerk/nextjs";

interface Props {
  projectId?: string;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

export const ProjectForm = ({ projectId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const clerk = useClerk();

  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [githubRepoName, setGithubRepoName] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [isSettingUpGitHub, setIsSettingUpGitHub] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.usage.status.queryOptions()
        )
        // Show GitHub setup dialog instead of immediate redirect
        setCreatedProjectId(data.id);
        setShowGitHubDialog(true);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while creating the message"
        );
        if (error?.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
        if (error?.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
      },
    })
  );

  const setupGitHub = async () => {
    if (!createdProjectId || !githubRepoName || !githubToken) {
      toast.error("Please provide both repository name and GitHub token");
      return;
    }

    setIsSettingUpGitHub(true);
    try {
      const response = await fetch("/api/github/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: createdProjectId,
          repoName: githubRepoName,
          githubToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || data.error || "Failed to set up GitHub repository";
        console.error("GitHub setup error:", data);
        
        // Show multiline errors with better formatting
        if (errorMsg.includes('\n')) {
          const lines = errorMsg.split('\n');
          toast.error(lines[0], {
            description: lines.slice(1).join('\n'),
            duration: 10000
          });
        } else {
          toast.error(errorMsg);
        }
        return;
      }

      console.log("GitHub repository created:", data);
      toast.success(`GitHub repo created: ${data.repoName}`);
      setShowGitHubDialog(false);
      router.push(`/projects/${createdProjectId}`);
    } catch (error) {
      toast.error("Unexpected error setting up GitHub");
    } finally {
      setIsSettingUpGitHub(false);
    }
  };

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: value.value,
    });
  };

  const onSelect = (value: string) => {
    form.setValue("value", value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createProject.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border p-4 rounded-xl bg-sidebar transition-all",
            isFocused && "shadow-xs"
          )}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                placeholder="What would like to build"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
              />
            )}
          />
          <div className="flex gap-x-2 items-end justify-between pt-2">
            <div className="text-[10px] text-muted-foreground font-mono">
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium text-muted-foreground">
                <span>&#8984;</span>Enter
              </kbd>
              &nbsp;to submit
            </div>
            <Button
              disabled={isButtonDisabled}
              className={cn(
                "size-8 rounded-full",
                isButtonDisabled && "bg-muted-foreground border"
              )}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ArrowUpIcon />
              )}
            </Button>
          </div>
        </form>
        <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
          {PROJECT_TEMPLATES.map((template) => (
            <Button
              key={template.title}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-sidebar"
              onClick={() => onSelect(template.prompt)}
            >
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
      </section>

      {/* GitHub Setup Dialog - Required */}
      <Dialog open={showGitHubDialog} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md" 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <GithubIcon className="inline mr-2" />
              Connect to GitHub (Required)
            </DialogTitle>
            <DialogDescription>
              Set up a GitHub repository for your project. This is required to save and manage your code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository Name</label>
              <Input
                placeholder="my-awesome-project"
                value={githubRepoName}
                onChange={(e) => setGithubRepoName(e.target.value)}
                disabled={isSettingUpGitHub}
              />
              <p className="text-xs text-muted-foreground">
                Use letters, numbers, hyphens (-), and underscores (_) only. No spaces or special characters like @.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Personal Access Token</label>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                disabled={isSettingUpGitHub}
              />
              <p className="text-xs text-muted-foreground">
                Need a token? Create one at{" "}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  github.com/settings/tokens
                </a>{" "}
                with <code>repo</code> scope.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={setupGitHub}
              disabled={!githubRepoName || !githubToken || isSettingUpGitHub}
              className="w-full"
            >
              {isSettingUpGitHub ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                "Connect GitHub"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
