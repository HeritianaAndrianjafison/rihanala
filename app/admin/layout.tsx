import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <AdminShell userName={session.user.name ?? session.user.email ?? "A"}>
      {children}
    </AdminShell>
  );
}
