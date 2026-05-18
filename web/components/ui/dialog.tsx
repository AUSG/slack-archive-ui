"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close
const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHiddenTitle({ children }: { children: React.ReactNode }) {
  return (
    <VisuallyHidden.Root asChild>
      <DialogTitle>{children}</DialogTitle>
    </VisuallyHidden.Root>
  )
}

function DialogHiddenDescription({ children }: { children: React.ReactNode }) {
  return (
    <VisuallyHidden.Root asChild>
      <DialogDescription>{children}</DialogDescription>
    </VisuallyHidden.Root>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHiddenTitle,
  DialogHiddenDescription,
}
