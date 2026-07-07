export type DashboardRole = "admin" | "organizer" | "user";

export type QuickCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export type RegistrationItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  passId?: string | number;
};

export type UpcomingItem = {
  id: string;
  title: string;
  date: string;
  location: string;
};