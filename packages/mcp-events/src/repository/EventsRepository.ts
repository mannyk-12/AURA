import { Event } from "../data/events.js";

export interface IEventsRepository {
  getAllEvents(): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | undefined>;
  getStudentRegisteredEvents(studentId: string): Promise<string[]>;
  registerStudentForEvent(studentId: string, eventId: string): Promise<void>;
  updateEventSeats(eventId: string, seatsAvailable: number): Promise<void>;
}
