import { syncUserAndGetWallet } from "@/lib/actions";
import DashboardUI from "@/components/DashboardUI";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Try to sync the user if they are logged in
  const data = await syncUserAndGetWallet();
  
  return (
    <DashboardUI 
      walletData={data?.wallet} 
      transactions={data?.transactions} 
      clerkId={data?.clerkId} 
      name={data?.name}
      email={data?.email}
    />
  );
}
