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

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(503, 'Unable to connect to backend server. Ensure Uvicorn is running on http://localhost:8000');
  }

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

// ─── Portal Token Helpers (separate from commuter token) ─────────────────────

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fairride_portal_token');
}

export function setPortalToken(token: string): void {
  localStorage.setItem('fairride_portal_token', token);
}

export function clearPortalToken(): void {
  localStorage.removeItem('fairride_portal_token');
  localStorage.removeItem('fairride_portal_user');
}

export function getPortalUser(): PortalUserResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('fairride_portal_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as PortalUserResponse; } catch { return null; }
}

export function setPortalUser(user: PortalUserResponse): void {
  localStorage.setItem('fairride_portal_user', JSON.stringify(user));
}

async function portalFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getPortalToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(503, 'Unable to connect to backend server. Ensure Uvicorn is running on http://localhost:8000');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Portal Types ─────────────────────────────────────────────────────────────

export interface PortalUserResponse {
  id: string;
  name: string;
  email: string;
  role: 'OPERATOR' | 'GOVERNMENT';
  platform?: string;
  jurisdiction?: string;
}

export interface PortalLoginResponse {
  access_token: string;
  token_type: string;
  role: 'OPERATOR' | 'GOVERNMENT';
  platform?: string;
  jurisdiction?: string;
}

export interface DriverProfileSummary {
  id: string;
  canonical_phone: string;
  aliases: string[];
  platforms: string[];
  risk_score: number;
  blacklist_status: 'NONE' | 'WATCHLIST' | 'BLACKLIST_RECOMMENDED' | 'BLACKLISTED';
  total_incidents: number;
  blacklisted_at: string | null;
  blacklisted_by: string | null;
  platform_incidents?: number;
  cross_platform_incidents?: number;
  cross_platform_flag?: boolean;
  other_platforms?: string[];
}

export interface PortalIncidentItem {
  id: string;
  platform: string;
  incident_type: string;
  severity: string;
  location: string;
  incident_datetime: string;
  app_fare: number | null;
  demanded_fare: number | null;
  captain_name: string | null;
  captain_phone: string | null;
  vehicle_number: string | null;
  status: string;
  ai_analysis_status: string | null;
  routed_to_operator: boolean;
  routed_to_government: boolean;
  driver_profile_id: string | null;
}

export interface DashboardStats {
  platform?: string;
  total_incidents: number;
  routed_complaints?: number;
  watchlist_count: number;
  blacklist_recommended: number;
  blacklisted: number;
  routed_to_government?: number;
  total_drivers_tracked?: number;
  platform_breakdown?: { platform: string; incident_count: number }[];
}

export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  platform: string;
  severity: string;
  incident_type: string;
  location: string;
}

export interface ComplianceItem {
  platform: string;
  total_incidents: number;
  routed_to_government: number;
  blacklisted_drivers_active: number;
}

// ─── Operator Portal API ─────────────────────────────────────────────────────

export async function operatorLogin(email: string, password: string): Promise<PortalLoginResponse> {
  return portalFetch<PortalLoginResponse>('/operator/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function operatorRegister(name: string, email: string, password: string) {
  return portalFetch('/operator/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getOperatorMe(): Promise<PortalUserResponse> {
  return portalFetch<PortalUserResponse>('/operator/auth/me');
}

export async function getOperatorStats(): Promise<DashboardStats> {
  return portalFetch<DashboardStats>('/operator/dashboard/stats');
}

export async function getOperatorDrivers(skip = 0, limit = 50): Promise<DriverProfileSummary[]> {
  return portalFetch<DriverProfileSummary[]>(`/operator/drivers/?skip=${skip}&limit=${limit}`);
}

export async function getOperatorDriver(driverId: string): Promise<DriverProfileSummary & { platform_incidents: unknown[] }> {
  return portalFetch(`/operator/drivers/${driverId}`);
}

export async function watchlistDriver(driverId: string): Promise<{ message: string }> {
  return portalFetch(`/operator/drivers/${driverId}/watchlist`, { method: 'POST' });
}

export async function blacklistDriverOperator(driverId: string, note = ''): Promise<{ message: string }> {
  return portalFetch(`/operator/drivers/${driverId}/blacklist?note=${encodeURIComponent(note)}`, { method: 'POST' });
}

export async function getOperatorIncidents(skip = 0, limit = 50, routedOnly = false): Promise<PortalIncidentItem[]> {
  return portalFetch<PortalIncidentItem[]>(`/operator/incidents/?skip=${skip}&limit=${limit}&routed_only=${routedOnly}`);
}

export async function getOperatorReports() {
  return portalFetch<unknown[]>('/operator/reports/');
}

export async function generateOperatorReport(reportType: 'WEEKLY' | 'MONTHLY' = 'WEEKLY') {
  return portalFetch<{ message: string; report_id: string; ai_brief: str }>('/operator/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ report_type: reportType }),
  });
}

// ─── Government Portal API ────────────────────────────────────────────────────

export async function governmentLogin(email: string, password: string): Promise<PortalLoginResponse> {
  return portalFetch<PortalLoginResponse>('/government/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function governmentRegister(name: string, email: string, password: string, jurisdiction?: string) {
  return portalFetch('/government/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, jurisdiction }),
  });
}

export async function getGovernmentMe(): Promise<PortalUserResponse> {
  return portalFetch<PortalUserResponse>('/government/auth/me');
}

export async function getGovernmentStats(): Promise<DashboardStats> {
  return portalFetch<DashboardStats>('/government/dashboard/stats');
}

export async function getGovernmentDrivers(skip = 0, limit = 50, statusFilter?: string): Promise<DriverProfileSummary[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (statusFilter) params.append('status_filter', statusFilter);
  return portalFetch<DriverProfileSummary[]>(`/government/drivers/?${params}`);
}

export async function getGovernmentDriver(driverId: string) {
  return portalFetch(`/government/drivers/${driverId}`);
}

export async function blacklistDriverGovernment(driverId: string, note = '') {
  return portalFetch(`/government/drivers/${driverId}/blacklist?note=${encodeURIComponent(note)}`, { method: 'POST' });
}

export async function clearDriverBlacklist(driverId: string) {
  return portalFetch(`/government/drivers/${driverId}/clear`, { method: 'POST' });
}

export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  return portalFetch<HeatmapPoint[]>('/government/heatmap/');
}

export async function getPlatformCompliance(): Promise<ComplianceItem[]> {
  return portalFetch<ComplianceItem[]>('/government/platforms/compliance/');
}

export async function getGovernmentIncidents(skip = 0, limit = 50, platform?: string, routedOnly = false): Promise<PortalIncidentItem[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit), routed_only: String(routedOnly) });
  if (platform) params.append('platform', platform);
  return portalFetch<PortalIncidentItem[]>(`/government/incidents/?${params}`);
}

export async function getGovernmentReports() {
  return portalFetch<unknown[]>('/government/reports/');
}

export async function generateGovernmentReport(reportType: 'WEEKLY' | 'MONTHLY' = 'MONTHLY', platform?: string) {
  return portalFetch<{ message: string; report_id: string; ai_brief: str }>('/government/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ report_type: reportType, platform: platform || null }),
  });
}

// ─── Complaint Routing API ────────────────────────────────────────────────────

export interface RouteComplaintResponse {
  message: string;
  routed_to_operator: boolean;
  routed_to_government: boolean;
  routed_at: string | null;
}

export async function routeComplaint(
  incidentId: string,
  routeToOperator: boolean,
  routeToGovernment: boolean
): Promise<RouteComplaintResponse> {
  return apiFetch<RouteComplaintResponse>(`/incidents/${incidentId}/route`, {
    method: 'POST',
    body: JSON.stringify({
      route_to_operator: routeToOperator,
      route_to_government: routeToGovernment,
    }),
  });
}


