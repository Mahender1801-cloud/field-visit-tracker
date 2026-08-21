export type UserRole = "admin" | "salesman";
export type VisitStatus =
  | "New"
  | "Interested"
  | "Order Placed"
  | "Not Interested"
  | "Follow Up"
  | "Closed";
export type ShopType = "Wholesaler" | "Distributor" | "Retailer";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
};

export type Punch = {
  id: string;
  salesman_id: string;
  punch_in_at: string;
  punch_in_lat: number | null;
  punch_in_lng: number | null;
  punch_out_at: string | null;
  punch_out_lat: number | null;
  punch_out_lng: number | null;
  created_at: string;
};

export type Visit = {
  id: string;
  salesman_id: string;
  punch_id: string | null;
  visit_date: string;
  shopkeeper_name: string;
  phone: string | null;
  type: ShopType;
  state: string | null;
  city: string | null;
  area: string | null;
  status: VisitStatus;
  feedback: string | null;
  latitude: number | null;
  longitude: number | null;
  selfie_path: string | null;
  visiting_card_path: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  salesman_id: string;
  expense_date: string;
  amount: number;
  note: string | null;
  status: ExpenseStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      punches: {
        Row: Punch;
        Insert: Partial<Punch> & { salesman_id: string };
        Update: Partial<Punch>;
        Relationships: [];
      };
      visits: {
        Row: Visit;
        Insert: Partial<Visit> & { salesman_id: string; shopkeeper_name: string };
        Update: Partial<Visit>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: Partial<Expense> & { salesman_id: string; amount: number };
        Update: Partial<Expense>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
