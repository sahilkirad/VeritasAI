import type React from "react"

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      {/* Simple purple V letter */}
      <path
        d="M 20 80 
           L 50 20 
           L 80 80 
           L 70 80 
           L 50 50 
           L 30 80 
           Z"
        fill="#9333EA"
        stroke="none"
      />
    </svg>
  )
}
