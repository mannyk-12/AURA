import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IEventsRepository } from "./EventsRepository.js";
import { Event } from "../data/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'events.json');

export class JsonEventsRepository implements IEventsRepository {
  private events: Event[] | null = null;
  private registeredEvents: Record<string, string[]> = {
    "CS-2021-042": ["E-TECH-001", "E-WORK-001"]
  };

  private loadData() {
    if (!this.events) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.events = JSON.parse(fileContent);
    }
    return this.events!;
  }

  async getAllEvents(): Promise<Event[]> {
    return this.loadData();
  }

  async getEventById(eventId: string): Promise<Event | undefined> {
    const events = this.loadData();
    return events.find(e => e.id === eventId);
  }

  async getStudentRegisteredEvents(studentId: string): Promise<string[]> {
    return this.registeredEvents[studentId] || [];
  }

  async registerStudentForEvent(studentId: string, eventId: string): Promise<void> {
    if (!this.registeredEvents[studentId]) {
      this.registeredEvents[studentId] = [];
    }
    if (!this.registeredEvents[studentId].includes(eventId)) {
      this.registeredEvents[studentId].push(eventId);
    }
  }

  async updateEventSeats(eventId: string, seatsAvailable: number): Promise<void> {
    const events = this.loadData();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.seats_available = seatsAvailable;
    }
  }
}
