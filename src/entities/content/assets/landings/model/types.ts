/**
 * Landing as returned by the backend.
 * Endpoints (raw payload, no envelope):
 * - GET  /api/landings/          -> Landing[]
 * - POST /api/landings/          -> Landing
 */
export interface Landing {
  id: string;
  userId: string;
  title: string;
  description?: string;
  views: number;
  clicks: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateLandingRequest {
  title: string;
  description?: string;
}

export type LandingsListResponse = Landing[];
export type CreateLandingResponse = Landing;
