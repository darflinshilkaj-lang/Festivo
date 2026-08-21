export interface Event {
  id: string;
  _id?: string;
  title?: string;
  name: string;
  eventName?: string;
  college: string;
  collegeName?: string;
  date: string;
  eventDate?: string | Date;
  startTime?: string;
  time: string;
  endTime?: string;
  venue?: string;
  location: string;
  description: string;
  eventType?: string;
  type: string;
  image: any;
  eventImage?: any;
  fee: number;
  isFree: boolean;
  registrationType?: 'free' | 'paid';
  registrationFee?: number;
  rules?: string[];
  coordinator?: string;
  phone?: string;
  organizerContact?: string;
  organizer?: string;
  maxParticipants?: number;
  registrationLimit?: number;
  registrationDeadline?: string | Date;
  isFeatured?: boolean;
  isTrending?: boolean;
  isUpcoming?: boolean;
  isRecentlyAdded?: boolean;
  organizerId?: string;
  createdBy?: string;
  registeredParticipants?: number;
}

export interface Student {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  role?: string;
  isOrganizer?: boolean;
}
