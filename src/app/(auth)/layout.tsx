
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
        <div aria-hidden="true" className="absolute inset-0 z-0">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 blur-3xl animate-blob animation-delay-4000"></div>
            <div className="absolute top-1/4 left-1/3 h-32 w-32 rounded-md bg-gradient-to-br from-primary/50 to-accent/50 blur-3xl animate-spin-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-md bg-gradient-to-br from-primary/50 to-accent/50 blur-3xl animate-spin-slow animation-delay-3000"></div>
            <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl animate-blob animation-delay-1000"></div>
        </div>
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary-rgb),0.15),rgba(255,255,255,0))]"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            {children}
        </div>
    </div>
  );
}
