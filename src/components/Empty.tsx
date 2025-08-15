import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Empty component

// Empty component with better UX
export function Empty({ 
  message = "暂无数据", 
  icon = "fa-box-open",
  onClick,
  className
}: { 
  message?: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : "",
        className
      )}
      onClick={onClick}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className={`fa-solid ${icon} text-gray-400 text-2xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-1">{message}</h3>
      {onClick && (
        <p className="text-blue-600 text-sm mt-2">
          <i className="fa-solid fa-plus-circle mr-1"></i>
          点击添加
        </p>
      )}
    </div>
  );
}

// Default export with common props
export default function DefaultEmpty() {
  return <Empty message="暂无数据" />;
}