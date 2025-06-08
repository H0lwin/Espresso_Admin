"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ActionItem {
  label: string
  icon?: React.ElementType
  onClick: () => void
  isDestructive?: boolean
}

interface DataTableActionsProps {
  actions: ActionItem[]
  label?: string
}

export function DataTableActions({ actions, label = "Actions" }: DataTableActionsProps) {
  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {actions.map((action, index) => (
          <React.Fragment key={action.label + index}>
            {action.label === "---" ? ( // Use "---" as a convention for separator
              <DropdownMenuSeparator />
            ) : (
              <DropdownMenuItem
                onClick={action.onClick}
                className={action.isDestructive ? "text-destructive focus:text-destructive focus:bg-destructive/10" : ""}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
