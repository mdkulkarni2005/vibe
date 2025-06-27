"use client"

import { useTRPC } from "@/trpic/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export const Client = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "Manas" }))
    

    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}