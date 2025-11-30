"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon, DownloadIcon, GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import { downloadProjectAsZip } from "@/lib/download-utils";
import { toast } from "sonner";
import { useTRPC } from "@/trpic/client";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code" | "review">("preview");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingClerkAuth, setIsAddingClerkAuth] = useState(false);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const addClerkAuth = useMutation(
    trpc.messages.addClerkAuth.mutationOptions({
      onSuccess: () => {
        toast.success("Adding Clerk authentication to your project! Check the messages for progress.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to add Clerk authentication. Please try again."
        );
      },
    })
  );

  const handleDownload = async () => {
    if (!activeFragment?.files) {
      toast.error("No code to download. Please generate some code first.");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadProjectAsZip(
        activeFragment.files as Record<string, string>,
        project.name || "nextjs-project",
        false // Regular download without Clerk
      );
      toast.success("Project downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download project. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!project.githubEnabled) {
      toast.error("GitHub not set up for this project. Please set it up first.");
      return;
    }

    const githubToken = prompt("Enter your GitHub Personal Access Token:");
    if (!githubToken) {
      toast.info("GitHub push cancelled");
      return;
    }

    setIsPushingToGitHub(true);
    try {
      const response = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          githubToken,
          commitMessage: `Update from Vibe - ${new Date().toLocaleString()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to push to GitHub");
        return;
      }

      toast.success(`Pushed ${data.filesCount} files to GitHub!`);
    } catch (error) {
      console.error("GitHub push failed:", error);
      toast.error("Failed to push to GitHub");
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  const handleAddClerkAuth = async () => {
    if (!activeFragment?.files) {
      toast.error("No project to add authentication to. Please generate some code first.");
      return;
    }

    setIsAddingClerkAuth(true);
    try {
      await addClerkAuth.mutateAsync({
        projectId: projectId,
      });
    } catch (error) {
      console.error("Add Clerk auth failed:", error);
    } finally {
      setIsAddingClerkAuth(false);
    }
  };

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col m-0"
        >
          <ErrorBoundary fallback={<p>Project heater error</p>}>
            <Suspense fallback={<p>Loading projct...</p>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallback={<p>Messages error</p>}>
            <Suspense fallback={<p>Loading Message</p>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon /> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {activeFragment?.files && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                      onClick={handlePushToGitHub}
                      disabled={isPushingToGitHub || !project.githubEnabled}
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>{isPushingToGitHub ? "Pushing..." : "GitHub"}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDownload}
                      disabled={isDownloading || isAddingClerkAuth}
                    >
                      <DownloadIcon className={isDownloading ? "animate-spin" : ""} />
                      {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                    {/* <Button 
                      size="sm" 
                      variant="default"
                      onClick={handleAddClerkAuth}
                      disabled={isDownloading || isAddingClerkAuth}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <ShieldCheckIcon className={isAddingClerkAuth ? "animate-spin" : ""} />
                      {isAddingClerkAuth ? "Adding Auth..." : "Add Clerk Auth"}
                    </Button> */}
                  </>
                )}
                {!hasProAccess && (
                  <Button asChild size="sm" variant="default">
                    <Link href="/pricing">
                      <CrownIcon /> Upgrade
                    </Link>
                  </Button>
                )}
                <UserControl />
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {!!activeFragment?.files && (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
            <TabsContent value="review" className="p-4">
              {/* Placeholder section for CodeRabbit review. Kept minimal per request. */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">CodeRabbit Review</h3>
                <p className="text-sm text-muted-foreground">
                  This section will display automated code review feedback from CodeRabbit for your current fragment.
                </p>
                {!activeFragment?.files ? (
                  <p className="text-sm">No code available to review yet.</p>
                ) : (
                  <div className="text-sm rounded-md border p-3 bg-muted/50">
                    Pending integration. Once connected, reviews will appear here for the selected fragment.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
