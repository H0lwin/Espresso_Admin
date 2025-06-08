
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

export function DataTableActions({ actions, label = "عملیات" }: DataTableActionsProps) { // Translated label
  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">باز کردن منو</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start"> {/* Changed align to "start" for RTL */}
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {actions.map((action, index) => (
          <React.Fragment key={action.label + index}>
            {action.label === "---" ? ( 
              <DropdownMenuSeparator />
            ) : (
              <DropdownMenuItem
                onClick={action.onClick}
                className={action.isDestructive ? "text-destructive focus:text-destructive focus:bg-destructive/10 justify-end" : "justify-end"} // Added justify-end for RTL text
              >
                {action.icon && <action.icon className="ms-2 h-4 w-4" />} {/* Changed mr-2 to ms-2 */}
                {action.label}
              </DropdownMenuItem>
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
