"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

export function CustomAccordion({ children, className }: AccordionProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
}

export function CustomAccordionItem({ children, className, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // 子要素を分割
  const childrenArray = React.Children.toArray(children)
  const trigger = childrenArray.find(
    (child) => React.isValidElement(child) && (child.type as any).displayName === "CustomAccordionTrigger",
  )
  const content = childrenArray.find(
    (child) => React.isValidElement(child) && (child.type as any).displayName === "CustomAccordionContent",
  )

  return (
    <div className={cn("border-b", className)}>
      {React.isValidElement(trigger) &&
        React.cloneElement(trigger as React.ReactElement, {
          isOpen,
          onClick: () => setIsOpen(!isOpen),
        })}
      {isOpen && content}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  onClick?: () => void
}

export function CustomAccordionTrigger({ children, className, isOpen, onClick }: AccordionTriggerProps) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
    </div>
  )
}
CustomAccordionTrigger.displayName = "CustomAccordionTrigger"

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

export function CustomAccordionContent({ children, className }: AccordionContentProps) {
  return (
    <div className={cn("overflow-hidden text-sm", className)}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}
CustomAccordionContent.displayName = "CustomAccordionContent"
