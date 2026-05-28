import DashboardLayout from "@/app/(main)/dashboard/layout";

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
