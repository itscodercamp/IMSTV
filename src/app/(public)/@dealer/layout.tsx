
import MainLayout from "@/app/(main)/layout";

export default function DealerParallelLayout({ children }: { children: React.ReactNode }) {
  // The MainLayout already handles auth and renders the sidebar/header
  return <MainLayout>{children}</MainLayout>;
}
