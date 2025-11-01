import type React from "react"

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      <defs>
        {/* Main V gradient - deep indigo/blue to vibrant teal (NO PURPLE) */}
        <linearGradient id="vGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" /> {/* Deep blue */}
          <stop offset="25%" stopColor="#2563EB" /> {/* Blue */}
          <stop offset="50%" stopColor="#3B82F6" /> {/* Light blue */}
          <stop offset="75%" stopColor="#06B6D4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#14B8A6" /> {/* Teal */}
        </linearGradient>
        
        {/* Swoosh gradient - darker blue to bright cyan */}
        <linearGradient id="swooshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Blue */}
          <stop offset="50%" stopColor="#3B82F6" /> {/* Light blue */}
          <stop offset="100%" stopColor="#06B6D4" /> {/* Bright cyan/teal */}
        </linearGradient>
        
        {/* Network cluster gradient */}
        <linearGradient id="clusterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#14B8A6" /> {/* Teal */}
        </linearGradient>
        
        {/* Drop shadow filter */}
        <filter id="vShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* White background for visibility */}
      <rect width="100" height="100" fill="white" rx="8" />
      
      {/* Main V letter - Stylish with low-poly/faceted appearance */}
      <g filter="url(#vShadow)">
        {/* Left arm of V - Base section (deep blue) */}
        <path
          d="M 20 80 
             L 20 70 
             L 28 65 
             L 30 70 
             L 35 75 
             L 20 80 Z"
          fill="url(#vGradient)"
          opacity="1"
        />
        
        {/* Left arm - Middle section */}
        <path
          d="M 20 70 
             L 28 65 
             L 32 55 
             L 24 52 
             L 20 60 
             Z"
          fill="url(#vGradient)"
          opacity="0.98"
        />
        
        {/* Left arm - Upper section with facets */}
        <path
          d="M 20 60 
             L 24 52 
             L 28 45 
             L 32 50 
             L 28 55 
             Z"
          fill="url(#vGradient)"
          opacity="0.95"
        />
        
        {/* Left arm - Top facet 1 */}
        <path
          d="M 24 52 
             L 28 45 
             L 30 40 
             L 26 38 
             Z"
          fill="url(#vGradient)"
          opacity="0.92"
        />
        
        {/* Left arm - Top facet 2 (bird's head/pen nib style) */}
        <path
          d="M 26 38 
             L 30 40 
             L 32 35 
             L 28 32 
             L 24 35 
             Z"
          fill="url(#vGradient)"
          opacity="0.9"
        />
        
        {/* Left arm - Sharp top point */}
        <path
          d="M 28 32 
             L 32 35 
             L 30 28 
             L 28 28 
             Z"
          fill="url(#vGradient)"
          opacity="0.88"
        />
        
        {/* Center bottom of V - connection point */}
        <path
          d="M 35 75 
             L 40 75 
             L 45 70 
             L 42 65 
             L 38 68 
             Z"
          fill="url(#vGradient)"
          opacity="0.96"
        />
        
        {/* Center - lower facet */}
        <path
          d="M 38 68 
             L 42 65 
             L 48 58 
             L 44 55 
             L 40 60 
             Z"
          fill="url(#vGradient)"
          opacity="0.94"
        />
        
        {/* Center - middle facet */}
        <path
          d="M 40 60 
             L 44 55 
             L 50 48 
             L 46 45 
             L 42 50 
             Z"
          fill="url(#vGradient)"
          opacity="0.92"
        />
        
        {/* Right arm - Upper section with facets */}
        <path
          d="M 42 50 
             L 46 45 
             L 52 40 
             L 48 38 
             L 44 42 
             Z"
          fill="url(#vGradient)"
          opacity="0.9"
        />
        
        {/* Right arm - Top facet 1 */}
        <path
          d="M 44 42 
             L 48 38 
             L 54 32 
             L 50 30 
             Z"
          fill="url(#vGradient)"
          opacity="0.88"
        />
        
        {/* Right arm - Top facet 2 */}
        <path
          d="M 50 30 
             L 54 32 
             L 60 28 
             L 56 26 
             Z"
          fill="url(#vGradient)"
          opacity="0.86"
        />
        
        {/* Right arm - Top point */}
        <path
          d="M 56 26 
             L 60 28 
             L 62 25 
             L 58 24 
             Z"
          fill="url(#vGradient)"
          opacity="0.84"
        />
        
        {/* Right arm - Upper middle section */}
        <path
          d="M 54 32 
             L 60 28 
             L 64 35 
             L 58 38 
             Z"
          fill="url(#vGradient)"
          opacity="0.88"
        />
        
        {/* Right arm - Middle section */}
        <path
          d="M 58 38 
             L 64 35 
             L 68 45 
             L 62 48 
             Z"
          fill="url(#vGradient)"
          opacity="0.9"
        />
        
        {/* Right arm - Lower middle */}
        <path
          d="M 62 48 
             L 68 45 
             L 72 55 
             L 66 58 
             Z"
          fill="url(#vGradient)"
          opacity="0.92"
        />
        
        {/* Right arm - Lower section */}
        <path
          d="M 66 58 
             L 72 55 
             L 75 65 
             L 70 68 
             Z"
          fill="url(#vGradient)"
          opacity="0.94"
        />
        
        {/* Right arm - Base section */}
        <path
          d="M 70 68 
             L 75 65 
             L 80 75 
             L 75 80 
             Z"
          fill="url(#vGradient)"
          opacity="0.96"
        />
        
        {/* Additional faceted details for crystalline texture */}
        <path
          d="M 28 45 L 32 50 L 36 48 L 32 43 Z"
          fill="url(#vGradient)"
          opacity="0.85"
        />
        <path
          d="M 48 45 L 52 40 L 56 42 L 52 47 Z"
          fill="url(#vGradient)"
          opacity="0.85"
        />
        <path
          d="M 32 55 L 36 58 L 40 56 L 36 52 Z"
          fill="url(#vGradient)"
          opacity="0.87"
        />
      </g>
      
      {/* Swoosh element - curves from upper left, over center, to upper right */}
      <g opacity="1">
        {/* Main swoosh line - thicker, starts from left arm */}
        <path
          d="M 30 40 
             Q 38 30 48 25 
             Q 58 20 68 22
             Q 75 23 80 25"
          stroke="url(#swooshGradient)"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner swoosh line - thinner for double-line effect */}
        <path
          d="M 30 40 
             Q 38 30 48 25 
             Q 58 20 68 22
             Q 75 23 80 25"
          stroke="url(#swooshGradient)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </g>
      
      {/* Network/Molecular cluster at end of swoosh (upper right) */}
      <g opacity="1">
        {/* Central large node */}
        <circle cx="80" cy="25" r="3.8" fill="url(#clusterGradient)" />
        
        {/* Connected nodes in network pattern */}
        <circle cx="87" cy="22" r="2.8" fill="url(#clusterGradient)" opacity="0.9" />
        <circle cx="83" cy="18" r="2.2" fill="url(#clusterGradient)" opacity="0.85" />
        <circle cx="76" cy="20" r="2.2" fill="url(#clusterGradient)" opacity="0.85" />
        <circle cx="84" cy="28" r="2.2" fill="url(#clusterGradient)" opacity="0.8" />
        <circle cx="90" cy="26" r="1.8" fill="url(#clusterGradient)" opacity="0.75" />
        <circle cx="79" cy="32" r="1.6" fill="url(#clusterGradient)" opacity="0.7" />
        
        {/* Connection lines between nodes - creating network pattern */}
        <line x1="80" y1="25" x2="87" y2="22" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.7" />
        <line x1="80" y1="25" x2="83" y2="18" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.7" />
        <line x1="80" y1="25" x2="76" y2="20" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.7" />
        <line x1="80" y1="25" x2="84" y2="28" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.7" />
        <line x1="87" y1="22" x2="90" y2="26" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.6" />
        <line x1="83" y1="18" x2="90" y2="26" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.6" />
        <line x1="84" y1="28" x2="79" y2="32" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.6" />
        <line x1="87" y1="22" x2="84" y2="28" stroke="url(#clusterGradient)" strokeWidth="0.9" opacity="0.5" />
      </g>
      
      {/* Sparkles/Stars around network cluster */}
      <g opacity="1">
        {/* Star 1 - larger */}
        <path
          d="M 92 14 L 92.5 15.5 L 94 15.5 L 92.8 16.5 L 93.2 18 L 92 17 L 90.8 18 L 91.2 16.5 L 90 15.5 L 91.6 15.5 Z"
          fill="#06B6D4"
        />
        {/* Star 2 */}
        <path
          d="M 72 18 L 72.4 19 L 73.5 19 L 72.7 19.7 L 73 20.7 L 72 20.2 L 71 20.7 L 71.3 19.7 L 70.5 19 L 71.7 19 Z"
          fill="#14B8A6"
        />
        {/* Star 3 */}
        <path
          d="M 87 10 L 87.4 11 L 88.5 11 L 87.7 11.7 L 88 12.7 L 87 12.2 L 86 12.7 L 86.3 11.7 L 85.5 11 L 86.7 11 Z"
          fill="#06B6D4"
        />
        {/* Star 4 */}
        <path
          d="M 90 30 L 90.3 30.6 L 90.9 30.6 L 90.5 31 L 90.7 31.6 L 90 31.3 L 89.3 31.6 L 89.5 31 L 89.1 30.6 L 89.7 30.6 Z"
          fill="#14B8A6"
        />
        {/* Star 5 - smaller accent */}
        <path
          d="M 75 14 L 75.2 14.4 L 75.6 14.4 L 75.4 14.7 L 75.5 15 L 75 14.8 L 74.5 15 L 74.6 14.7 L 74.4 14.4 L 74.8 14.4 Z"
          fill="#06B6D4"
        />
      </g>
    </svg>
  )
}