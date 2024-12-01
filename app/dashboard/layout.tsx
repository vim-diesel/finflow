import { DashboardLayout } from "./dash-layout";
import { createClient } from "@/utils/supabase/server";

export default async function DashLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
