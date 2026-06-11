export interface ClassSession {
  id: string;
  course_code: string;
  course_name: string;
  instructor: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  type: string;
}

export interface Exam {
  id: string;
  course_code: string;
  course_name: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  type: string;
  weightage: number;
}

export interface AttendanceRecord {
  course_code: string;
  course_name: string;
  classes_held: number;
  classes_attended: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target_audience: string[];
}
