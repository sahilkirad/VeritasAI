"use client"

import { cn } from "@/lib/utils"

interface AvengersLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AvengersLoader({ className, size = "md" }: AvengersLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Inner pulsing core */}
        <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse">
          <div className="absolute inset-1 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.2s" }}>
            <div
              className="absolute inset-1 rounded-full bg-primary/30 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            >
              <div
                className="absolute inset-1 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Energy particles */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-accent rounded-full animate-ping"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/4 w-0.5 h-0.5 bg-accent rounded-full animate-ping"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-accent rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-1/2 right-1/4 w-0.5 h-0.5 bg-accent rounded-full animate-ping"
            style={{ animationDelay: "0.7s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}
