import { Book, Calendar, Coffee, BookOpen } from 'lucide-react';

export function LibraryCardsList({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="flex flex-col gap-3 my-4 not-prose">
      {data.map((book, i) => {
        const isAvailable = book.status?.toLowerCase().includes("available");
        return (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-bg-surface border border-border-default hover:border-accent-library/30 transition-colors group">
            <div className="w-10 h-14 rounded bg-accent-library/10 flex items-center justify-center shrink-0 border border-accent-library/20 group-hover:bg-accent-library/20 transition-colors">
              <Book className="w-5 h-5 text-accent-library" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary text-sm truncate">{book.title}</h4>
              <p className="text-xs text-text-secondary truncate">{book.author} {book.year ? `(${book.year})` : ''}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                {book.category && (
                  <span className="text-[10px] text-accent-library bg-accent-library/10 px-1.5 py-0.5 rounded">
                    {book.category}
                  </span>
                )}
                {book.location && (
                  <span className="text-[10px] text-text-tertiary border border-border-default px-1.5 py-0.5 rounded">
                    Floor {book.location.floor}, Shelf {book.location.shelf}
                  </span>
                )}
                {book.copies_available !== undefined && (
                  <span className="text-[10px] text-text-secondary">
                    {book.copies_available}/{book.copies_total} available
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                isAvailable ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
              }`}>
                {book.status || (book.copies_available > 0 ? "Available" : "Checked Out")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventCardsList({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="flex flex-col gap-3 my-4 not-prose">
      {data.map((event, i) => (
        <div key={i} className="p-3 rounded-xl bg-bg-surface border border-border-default hover:border-accent-events/30 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-events" />
          <div className="flex gap-3 ml-2">
            <div className="w-10 h-10 rounded-lg bg-accent-events/10 flex flex-col items-center justify-center shrink-0 border border-accent-events/20 group-hover:bg-accent-events/20 transition-colors">
              <Calendar className="w-4 h-4 text-accent-events mb-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary text-sm truncate">{event.title}</h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {event.date && (
                  <span className="text-xs text-text-secondary font-medium">
                    {event.date} {event.start_time ? `• ${event.start_time}` : ''} {event.end_time ? `- ${event.end_time}` : ''}
                  </span>
                )}
                {event.venue && (
                  <span className="text-xs text-text-tertiary truncate max-w-[150px]">{event.venue}</span>
                )}
                {event.organiser_club && (
                  <span className="text-[10px] text-accent-events bg-accent-events/10 px-1.5 py-0.5 rounded">
                    {event.organiser_club}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{event.description}</p>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              {event.is_free !== undefined && (
                <span className="text-[10px] font-bold text-status-success uppercase tracking-wide">
                  {event.is_free ? "Free" : `₹${event.fee_amount}`}
                </span>
              )}
              {event.registration_link && (
                <a href={event.registration_link} target="_blank" rel="noreferrer" className="text-[10px] font-medium bg-accent-events/10 text-accent-events hover:bg-accent-events hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                  RSVP
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CafeteriaCardsList({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 not-prose">
      {data.map((item, i) => (
          <div key={i} className="flex flex-col p-3 rounded-xl bg-bg-surface border border-border-default hover:border-accent-cafeteria/30 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-cafeteria/10 flex items-center justify-center shrink-0 border border-accent-cafeteria/20 group-hover:bg-accent-cafeteria/20 transition-colors">
                <Coffee className="w-4 h-4 text-accent-cafeteria" />
              </div>
              <span className="font-mono text-sm text-accent-cafeteria bg-accent-cafeteria/10 px-2 py-0.5 rounded-md">
                ₹{item.price}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-text-primary text-sm line-clamp-1">{item.name}</h4>
              {item.is_special && (
                <span className="text-[10px] font-bold text-accent-cafeteria border border-accent-cafeteria/30 px-1.5 py-0.5 rounded">
                  SPECIAL
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-text-secondary mb-2 line-clamp-2">{item.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              {item.calories && (
                <span className="text-[10px] text-text-tertiary">
                  {item.calories} kcal
                </span>
              )}
              {item.dietary_tags && item.dietary_tags.map((tag: string, idx: number) => (
                <span key={idx} className="text-[10px] text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export function AcademicsCardsList({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="flex flex-col gap-3 my-4 not-prose">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col p-3 rounded-xl bg-bg-surface border border-border-default hover:border-accent-academics/30 transition-colors group">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-academics/10 flex flex-col items-center justify-center shrink-0 border border-accent-academics/20 group-hover:bg-accent-academics/20 transition-colors">
              <BookOpen className="w-4 h-4 text-accent-academics mb-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary text-sm truncate">
                {item.course_name ? `${item.course_name} ${item.course_code ? `(${item.course_code})` : ''}` : item.title}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {(item.start_time || item.end_time) && (
                  <span className="text-xs font-mono text-accent-academics bg-accent-academics/10 px-1.5 py-0.5 rounded">
                    {item.start_time} {item.end_time ? `- ${item.end_time}` : ''}
                  </span>
                )}
                {item.date && (
                  <span className="text-xs font-medium text-accent-events bg-accent-events/10 px-1.5 py-0.5 rounded">
                    {item.date}
                  </span>
                )}
                {item.day_of_week && (
                  <span className="text-xs font-medium text-accent-events bg-accent-events/10 px-1.5 py-0.5 rounded">
                    {item.day_of_week}
                  </span>
                )}
                {item.venue && (
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                    {item.venue}
                  </span>
                )}
                {item.type && (
                  <span className="text-xs text-text-tertiary">
                    {item.type}
                  </span>
                )}
                {item.weightage !== undefined && (
                  <span className="text-xs text-text-tertiary font-medium">
                    Weightage: {item.weightage}%
                  </span>
                )}
                {item.instructor && (
                  <span className="text-xs text-text-tertiary">
                    Prof: {item.instructor}
                  </span>
                )}
              </div>
              {item.content && (
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">{item.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
