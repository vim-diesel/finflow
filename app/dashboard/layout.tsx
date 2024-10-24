import { DashboardLayout } from "./dash-layout";
import { createClientServer } from "@/utils/supabase/server";

export default async function DashLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientServer();
  const user = await supabase.auth.getUser();
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
