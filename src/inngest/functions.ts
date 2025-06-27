import { inngest } from "./client";
import { openai, createAgent, createTool } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox } from "./utils";
import { z } from "zod";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("manas-vibe-nextjs-test-2")
      return sandbox.sandboxId;
    })
    
    const codeAgent = createAgent({
      name: "code-agent",
      system:
        "You are an expert Next.js developer. You write readable, maintainable code. You write simple Next.js & React sinppets.",
      model: openai({ model: "gpt-4o" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string()
          }),
          handler: async ({ command}, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" }

              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  }
                })
                return result.stdout
              } catch (e) {
                console.log(`Command failed: ${e}\nstdout:${buffers.stdout}\nstderror: ${buffers.stderr}`);
                return `Command failed: ${e}\nstdout:${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            })
          }
        })
      ]
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId)
      const host =  sandbox.getHost(3000)
      return `https://${host}`;
    })

    return { output, sandboxUrl };
  }
);
