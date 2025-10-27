// Status badge component for startup status and risk level
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent' | 'Low' | 'Medium' | 'High';
  type?: 'status' | 'risk';
  className?: string;
}

export function StatusBadge({ status, type = 'status', className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (type === 'risk') {
      switch (status) {
        case 'Low':
          return {
            variant: 'default' as const,
            className: 'bg-green-100 text-green-800 hover:bg-green-100',
            icon: '🟢'
          };
        case 'Medium':
          return {
            variant: 'secondary' as const,
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            icon: '🟡'
          };
        case 'High':
          return {
            variant: 'destructive' as const,
            className: 'bg-red-100 text-red-800 hover:bg-red-100',
            icon: '🔴'
          };
        default:
          return {
            variant: 'outline' as const,
            className: '',
            icon: ''
          };
      }
    } else {
      switch (status) {
        case 'Intake':
          return {
            variant: 'outline' as const,
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            icon: '📝'
          };
        case 'Memo 1':
          return {
            variant: 'default' as const,
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            icon: '📄'
          };
        case 'Memo 2':
          return {
            variant: 'secondary' as const,
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            icon: '📋'
          };
        case 'Memo 3':
          return {
            variant: 'default' as const,
            className: 'bg-green-100 text-green-800 hover:bg-green-100',
            icon: '✅'
          };
        case 'Sent':
          return {
            variant: 'default' as const,
            className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
            icon: '📤'
          };
        default:
          return {
            variant: 'outline' as const,
            className: '',
            icon: ''
          };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <span className="mr-1">{config.icon}</span>
      {status}
    </Badge>
  );
}
