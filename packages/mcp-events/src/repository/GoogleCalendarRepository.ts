import { IEventsRepository } from "./EventsRepository.js";
import { Event } from "../data/events.js";

export class GoogleCalendarRepository implements IEventsRepository {
  async getAllEvents(): Promise<Event[]> {
    throw new Error("Method not implemented.");
  }
  async getEventById(eventId: string): Promise<Event | undefined> {
    throw new Error("Method not implemented.");
  }
  async getStudentRegisteredEvents(studentId: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  async registerStudentForEvent(studentId: string, eventId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async updateEventSeats(eventId: string, seatsAvailable: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
