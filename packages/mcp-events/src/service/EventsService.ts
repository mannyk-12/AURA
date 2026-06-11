import { IEventsRepository } from "../repository/EventsRepository.js";
import { z } from "zod";
import Fuse from "fuse.js";
import { 
  GetUpcomingEventsSchema, 
  GetPastEventsSchema,
  GetEventDetailsSchema, 
  SearchEventsSchema, 
  GetEventsByClubSchema, 
  RegisterForEventSchema, 
  GetStudentRegisteredEventsSchema 
} from "../tools.js";

export class EventsService {
  constructor(private readonly repository: IEventsRepository) {}

  async getUpcomingEvents(args: z.infer<typeof GetUpcomingEventsSchema>) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + args.days_ahead);

    const allEvents = await this.repository.getAllEvents();
    return allEvents.filter(e => {
      const eDate = new Date(e.date);
      const categoryMatch = args.category === "all" || e.category === args.category;
      const dateMatch = eDate >= new Date(new Date().setHours(0,0,0,0)) && eDate <= cutoff;
      return categoryMatch && dateMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getPastEvents(args: z.infer<typeof GetPastEventsSchema>) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - args.days_back);

    const allEvents = await this.repository.getAllEvents();
    return allEvents.filter(e => {
      const eDate = new Date(e.date);
      const categoryMatch = args.category === "all" || e.category === args.category;
      const dateMatch = eDate < new Date(new Date().setHours(0,0,0,0)) && eDate >= cutoff;
      return categoryMatch && dateMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEventDetails(args: z.infer<typeof GetEventDetailsSchema>) {
    return (await this.repository.getEventById(args.event_id)) || null;
  }

  async searchEvents(args: z.infer<typeof SearchEventsSchema>) {
    const { query } = args;
    const allEvents = await this.repository.getAllEvents();
    
    const fuse = new Fuse(allEvents, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.3 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true
    });

    return fuse.search(query).map(res => res.item);
  }

  async getEventsByClub(args: z.infer<typeof GetEventsByClubSchema>) {
    const lowerClub = args.club_name.toLowerCase();
    const allEvents = await this.repository.getAllEvents();
    return allEvents.filter(e => e.organiser_club.toLowerCase().includes(lowerClub));
  }

  async registerForEvent(args: z.infer<typeof RegisterForEventSchema>) {
    const event = await this.repository.getEventById(args.event_id);
    if (!event) return { success: false, reason: "Event not found." };

    if (new Date(event.registration_deadline) < new Date()) {
      return { success: false, reason: "Registration deadline has passed." };
    }

    if (event.seats_available <= 0) {
      return { success: false, reason: "Event is fully booked." };
    }

    const studentEvents = await this.repository.getStudentRegisteredEvents(args.student_id);
    if (studentEvents.includes(args.event_id)) {
      return { success: false, reason: "Student is already registered." };
    }

    // Process registration
    const newSeats = event.seats_available - 1;
    await this.repository.updateEventSeats(args.event_id, newSeats);
    await this.repository.registerStudentForEvent(args.student_id, args.event_id);

    return { 
      success: true, 
      status: "confirmed", 
      message: `Successfully registered for ${event.title}`,
      seats_left: newSeats 
    };
  }

  async getStudentRegisteredEvents(args: z.infer<typeof GetStudentRegisteredEventsSchema>) {
    const ids = await this.repository.getStudentRegisteredEvents(args.student_id);
    const allEvents = await this.repository.getAllEvents();
    return allEvents.filter(e => ids.includes(e.id));
  }
}
