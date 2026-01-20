export type RoutineEvent = {
  id: string;
  title: string;
  day:
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  location?: string;
  confidence: number; // 0..1
  raw?: string;
};

export type IngestResponse = {
  success: boolean;
  imagePath?: string;
  ocrText?: string;
  routineEvents?: RoutineEvent[];
  error?: string;
};
