import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("w-12 h-12 text-shop_medium_primary animate-spin", className)} // <-- مهم
      {...props}
    />
  );
}

export function CustomSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}


export default CustomSpinner
