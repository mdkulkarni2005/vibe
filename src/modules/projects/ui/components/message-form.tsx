import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpIcon, Loader2Icon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useTRPC } from "@/trpic/client"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"
import { TypeOf } from "zod"

interface Props {
    projectId: string
}

const formSchema = z.object({
    value: z.string()
        .min(1, { message: "Message is required" })
        .max(1000, { message: "Message must be less than 1000 characters" }),
})


export const MessageForm = ({ projectId }: Props) => {
    
    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    })

    const onSubmit = (value: z.infer<typeof formSchema>) => {
        console.log("Submitted value:", value);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handlerSubmit(onSubmit)} className={cn ("relative border p-4 rounded-xl bg-sidebar transition-all")}>
                
            </form>
            
        </Form>
    )
}
