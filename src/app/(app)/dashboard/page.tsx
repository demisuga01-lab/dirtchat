import { getDashboardSummary, timeOfDay } from "@/lib/dashboard/dashboard-service";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <DashboardHome
      data={{
        user: summary.user,
        readiness: summary.readiness,
        recentChats: summary.recentChats,
        timeOfDay: timeOfDay(),
      }}
    />
  );
}
