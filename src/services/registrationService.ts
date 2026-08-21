import { apiCall, ApiResponse } from './api';

export interface Registration {
  id: string;
  _id: string;
  registrationId: string;
  userId: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  studentCollege: string;
  eventName: string;
  eventCollege: string;
  eventType: string;
  eventDate: Date | string;
  eventImage: any;
  venue: string | null;
  startTime: string | null;
  endTime: string | null;
  organizer: string | null;
  organizerContact: string | null;
  registrationType: 'free' | 'paid';
  registrationFee: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  registrationStatus: 'confirmed' | 'cancelled' | 'pending';
  registeredAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const registrationService = {
  async createRegistration(eventId: string): Promise<Registration> {
    const res: ApiResponse = await apiCall('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
    return res.registration;
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const res: ApiResponse = await apiCall('/api/registrations/my', {
      method: 'GET',
    });
    return res.registrations || [];
  },

  async getRegistrationById(id: string): Promise<Registration> {
    const res: ApiResponse = await apiCall(`/api/registrations/${id}`, {
      method: 'GET',
    });
    return res.registration;
  },

  async cancelRegistration(id: string): Promise<Registration> {
    const res: ApiResponse = await apiCall(`/api/registrations/${id}`, {
      method: 'DELETE',
    });
    return res.registration;
  },

  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    const res: ApiResponse = await apiCall(`/api/registrations/event/${eventId}`, {
      method: 'GET',
    });
    return res.registrations || [];
  },
};
