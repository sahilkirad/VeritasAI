import { InvestorDashboardNav } from '../investor-nav';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <InvestorDashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
