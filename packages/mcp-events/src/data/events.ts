export interface Event {
  id: string;
  title: string;
  description: string;
  category: "tech" | "cultural" | "sports" | "academic" | "workshop";
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  organiser_club: string;
  speakers: { name: string; designation: string }[];
  registration_deadline: string;
  seats_total: number;
  seats_available: number;
  registration_link: string;
  tags: string[];
  prerequisites: string;
  is_free: boolean;
  fee_amount?: number;
}
