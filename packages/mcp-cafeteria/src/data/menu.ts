export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  dietary_tags: string[];
  calories: number;
  is_special: boolean;
  available_until: string;
}
