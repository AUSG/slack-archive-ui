"use client"

import * as React from "react"
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels"
import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroup>) {
  return (
    <PanelGroup
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

const ResizablePanel = Panel

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border-soft transition-colors",
        "hover:bg-text-link focus-visible:bg-text-link focus-visible:outline-none",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="absolute z-10 flex h-8 w-2 items-center justify-center rounded-sm border border-border-soft bg-surface">
          <svg
            width="6"
            height="14"
            viewBox="0 0 6 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden
            className="text-text-muted"
          >
            <line x1="2" y1="2" x2="2" y2="12" />
            <line x1="4" y1="2" x2="4" y2="12" />
          </svg>
        </div>
      )}
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
