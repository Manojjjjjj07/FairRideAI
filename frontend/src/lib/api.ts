/**
 * FairRideAI — Typed API Client
 * All backend communication goes through this module.
 * Base URL: http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000';

// ─── Token Helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fairride_token');
}

export function setToken(token: string): void {
  localStorage.setItem('fairride_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('fairride_token');
  localStorage.removeItem('fairride_user');
}

export function getStoredUser(): UserResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('fairride_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as UserResponse; } catch { return null; }
}

export function setStoredUser(user: UserResponse): void {
  localStorage.setItem('fairride_user', JSON.stringify(user));
}

// ─── Core Fetch Wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-multipart requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = getToken();
    if (!token) throw new ApiError(401, 'Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface IncidentListItem {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  platform: string;
  latitude: number | null;
  longitude: number | null;
}

export interface EvidenceItem {
  id: string;
  evidence_type: string;
  file_path: string;
  created_at: string;
}

export interface AIAnalysisData {
  fare_verification: {
    confirmed: boolean;
    app_fare_from_evidence: number | null;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string;
  };
  payment_verification: {
    confirmed: boolean;
    paid_amount_from_evidence: number | null;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string;
  };
  overcharge_confirmed: boolean;
  overcharge_amount: number | null;
  overcharge_percentage: number | null;
  risk_assessment: string;
  complaint_draft: string;
}

export interface IncidentDetail {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  platform: string;
  captain_name: string | null;
  captain_phone: string | null;
  app_fare: number | null;
  demanded_fare: number | null;
  incident_datetime: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  ai_analysis_status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | null;
  ai_analysis_result: string | null;
  ai_analysis_error: string | null;
  ai_analyzed_at: string | null;
  created_at: string;
  evidences: EvidenceItem[];
}


export interface IncidentCreatePayload {
  incident_type: string;
  severity: string;
  description: string;
  platform: string;
  captain_name?: string;
  captain_phone?: string;
  app_fare?: number;
  demanded_fare?: number;
  incident_datetime: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface IncidentCreateResponse {
  id: string;
  status: string;
  message: string;
}

export interface EvidenceUploadResponse {
  id: string;
  incident_id: string;
  evidence_type: string;
  file_path: string;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export async function authRegister(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ message: string; user_id: string }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export async function authLogin(payload: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export async function getMe(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/me');
}

// ─── Incidents API ───────────────────────────────────────────────────────────

export async function getIncidents(): Promise<IncidentListItem[]> {
  return apiFetch<IncidentListItem[]>('/incidents/');
}

export async function getIncident(id: string): Promise<IncidentDetail> {
  return apiFetch<IncidentDetail>(`/incidents/${id}`);
}

export async function createIncident(
  payload: IncidentCreatePayload
): Promise<IncidentCreateResponse> {
  return apiFetch<IncidentCreateResponse>('/incidents/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Evidence API ────────────────────────────────────────────────────────────

export async function uploadEvidence(
  incidentId: string,
  evidenceType: string,
  file: File
): Promise<EvidenceUploadResponse> {
  const form = new FormData();
  form.append('incident_id', incidentId);
  form.append('evidence_type', evidenceType);
  form.append('file', file);

  return apiFetch<EvidenceUploadResponse>('/evidence/', {
    method: 'POST',
    body: form,
  });
}

// ─── AI Analysis API ─────────────────────────────────────────────────────────

export interface TriggerAnalysisResponse {
  status: string;
  result: AIAnalysisData;
  analyzed_at: string;
}

export async function triggerAnalysis(
  incidentId: string
): Promise<TriggerAnalysisResponse> {
  return apiFetch<TriggerAnalysisResponse>(`/analysis/${incidentId}`, {
    method: 'POST',
  });
}

