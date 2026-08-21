import { apiCall, ApiResponse } from './api';
import { Event } from '../types/Event';

// Fallback images array for events without custom images
const defaultEventImages = {
  festival: require('../assets/images/college_fest.jpg'),
  technical: require('../assets/images/tech_symposium.jpg'),
  cultural: require('../assets/images/cultural_fest.jpg'),
  sports: require('../assets/images/sports_meet.jpg'),
};

export const normalizeEvent = (e: any): Event => {
  const eventId = e?._id || e?.id || '';
  const title = e.eventName || e.title || e.name || 'Festivo Event';
  const eventType = e.eventType || e.type || 'College Festival';
  const venue = e.venue || e.location || 'Campus Auditorium';
  
  let dateStr = 'Upcoming';
  const rawDate = e.eventDate || e.date;
  if (rawDate) {
    if (typeof rawDate === 'string' && !rawDate.includes('T')) {
      dateStr = rawDate;
    } else {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        dateStr = parsedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }
  }

  const timeStr = e.time || e.startTime || '09:00 AM';

  // Determine image source
  const rawImage = e.eventImage || e.image;
  let imgSource = defaultEventImages.festival;
  if (rawImage && typeof rawImage === 'string' && rawImage.startsWith('http')) {
    imgSource = { uri: rawImage };
  } else if (rawImage && typeof rawImage === 'object') {
    imgSource = rawImage;
  } else {
    const lowerType = String(eventType).toLowerCase();
    if (
      lowerType.includes('tech') ||
      lowerType.includes('symposium') ||
      lowerType.includes('hackathon') ||
      lowerType.includes('workshop')
    ) {
      imgSource = defaultEventImages.technical;
    } else if (lowerType.includes('cultur')) {
      imgSource = defaultEventImages.cultural;
    } else if (lowerType.includes('sport')) {
      imgSource = defaultEventImages.sports;
    }
  }

  const fee = typeof e.fee === 'number' ? e.fee : 0;
  const isFree = e.isFree !== undefined ? Boolean(e.isFree) : fee === 0;
  const contact = e.organizerContact || e.phone || '';
  const limit = e.maxParticipants !== undefined ? e.maxParticipants : (e.registrationLimit || 100);
  const organizerId = e.createdBy || e.organizerId || '';
  const regType = e.registrationType || (isFree ? 'free' : 'paid');
  const regFee = e.registrationFee !== undefined ? Number(e.registrationFee) : fee;

  return {
    id: eventId,
    _id: eventId,
    title: title,
    name: title,
    college: e.collegeName || e.college || 'Festivo College',
    date: dateStr,
    startTime: e.startTime || timeStr,
    time: timeStr,
    endTime: e.endTime || '05:00 PM',
    venue: venue,
    location: venue,
    description: e.description || 'Festivo event description.',
    eventType: eventType,
    type: eventType,
    image: imgSource,
    fee: fee,
    isFree: isFree,
    registrationType: regType,
    registrationFee: regFee,
    rules: Array.isArray(e.rules) ? e.rules : [],
    coordinator: e.coordinator || '',
    phone: contact,
    organizer: e.organizer || '',
    registrationLimit: limit,
    registrationDeadline: e.registrationDeadline || undefined,
    isUpcoming: e.isUpcoming !== undefined ? Boolean(e.isUpcoming) : true,
    isFeatured: e.isFeatured !== undefined ? Boolean(e.isFeatured) : true,
    isTrending: e.isTrending !== undefined ? Boolean(e.isTrending) : false,
    isRecentlyAdded: e.isRecentlyAdded !== undefined ? Boolean(e.isRecentlyAdded) : false,
    organizerId: organizerId,
    registeredParticipants: e.registeredParticipants || 0,
  };
};

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const res: ApiResponse = await apiCall('/api/events', { method: 'GET' });
    const rawList = res.events || [];
    return rawList.map(normalizeEvent);
  },

  async getMyEvents(): Promise<Event[]> {
    const res: ApiResponse = await apiCall('/api/events/my-events', { method: 'GET' });
    const rawList = res.events || [];
    return rawList.map(normalizeEvent);
  },

  async getEventById(id: string): Promise<Event> {
    const res: ApiResponse = await apiCall(`/api/events/${id}`, { method: 'GET' });
    return normalizeEvent(res.event);
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const res: ApiResponse = await apiCall('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return normalizeEvent(res.event);
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const res: ApiResponse = await apiCall(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return normalizeEvent(res.event);
  },

  async deleteEvent(id: string): Promise<boolean> {
    const res: ApiResponse = await apiCall(`/api/events/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async getEventParticipants(eventId: string): Promise<{
    participants: Participant[];
    maxParticipants: number;
    checkedInCount: number;
  }> {
    const res: ApiResponse = await apiCall(`/api/events/${eventId}/participants`, {
      method: 'GET',
    });
    return {
      participants: res.participants || [],
      maxParticipants: res.maxParticipants || 100,
      checkedInCount: res.checkedInCount || 0,
    };
  },

  async verifyTicket(eventId: string, registrationId: string): Promise<VerifiedRegistration> {
    const res: ApiResponse = await apiCall(
      `/api/events/${eventId}/verify-ticket/${encodeURIComponent(registrationId)}`,
      { method: 'GET' }
    );
    return res.registration;
  },

  async checkInParticipant(eventId: string, registrationId: string): Promise<{
    success: boolean;
    checkedInAt: string;
  }> {
    const res: ApiResponse = await apiCall(
      `/api/events/${eventId}/check-in/${encodeURIComponent(registrationId)}`,
      { method: 'POST' }
    );
    return { success: res.success, checkedInAt: res.checkedInAt };
  },
};

export interface Participant {
  id: string;
  _id: string;
  studentName: string;
  studentDepartment: string;
  studentYear: string;
  studentEmail: string;
  registrationId: string;
  registrationStatus: string;
  registrationType: 'free' | 'paid';
  paymentStatus: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
}

export interface VerifiedRegistration {
  id: string;
  registrationId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  eventName: string;
  registrationStatus: string;
  registrationType: 'free' | 'paid';
  paymentStatus: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
}
