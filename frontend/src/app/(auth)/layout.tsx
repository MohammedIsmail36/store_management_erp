import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
