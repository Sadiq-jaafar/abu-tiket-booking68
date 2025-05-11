export interface Passenger {
  first_name: string;
  last_name: string;
  id_type: string;
  id_number: string;
  booking_id: string;
  shuttle_id: string;
  created_at?: string;
  


}

export interface Booking {
  booking_id: string;
  user_id: string; // Add this field
  shuttle_id: string;
  route_id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  booking_date: string;
  status: "upcoming" | "completed" | "cancelled";
  refund_id?: string;
  is_premium: boolean;
  price: number;
  total_amount: number;
  pickup_address: string;
  dropoff_address: string;
  passengers?: Passenger[];
  contactInfo?: ContactInfo;
  shuttle?: Shuttle;
  route?: Route;
  check_in_status: "pending" | "checked_in";
  refund_status: "NOT REFUNDED" | "REFUNDED";
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  id_type: string;
  id_number: string;
  user_type: string;
  role: "passenger" | "admin" | "driver";
  email: string;
  created_at?: string;
}

export interface Shuttle {
  shuttle_id: string;
  type: string;
  category: string;
  capacity: number;
  status: "active" | "maintenance" | "inactive";
  facilities: string[];
  is_premium: boolean;
  created_at?: string;
  driver_name: string;
}

export interface Route {
  base_price: number;
  premium_price: number;
  arrival_location: string;
  departure_location: string;
  created_at?: string;
  shuttle_id: string;
}

export interface ContactInfo {
  email: string;
  booking_id: string;
  phone: string;
  special_requests?: string;
  created_at?: string;
}

export type TripType = "field trip" | "excursion" | "competition" | "other";

export interface SpecialTrips {
  created_at?: string;
  trip_id: string;
  trip: TripType;  // Updated to use TripType
  destination: string;
  departure_date: string;
  user_id: string;
  date: string;
  status: "pending"|"approved"|"rejected";
  passengers: number;
  special_request: string;
  time: string;
}