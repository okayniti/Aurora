// AURORA API Client
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** ws(s):// origin for the replan socket, derived from API_BASE so both follow one env var. */
export const WS_BASE = API_BASE.replace(/^http/, "ws");

const TOKEN_KEY = "aurora_token";
const PUBLIC_ROUTES = ["/login", "/register"];

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    // Legacy keys from the pre-auth "pick the first user" bootstrap.
    localStorage.removeItem("aurora_user_id");
    localStorage.removeItem("aurora_user_name");
    localStorage.removeItem("aurora_user_email");
}

/** Drop the dead session and send the user to sign in. */
function onUnauthorized() {
    clearSession();
    if (typeof window !== "undefined" && !PUBLIC_ROUTES.includes(window.location.pathname)) {
        window.location.href = "/login";
    }
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

interface FetchOptions extends RequestInit {
    /** Skip the bearer header and the 401 redirect — for login/register. */
    anonymous?: boolean;
    timeoutMs?: number;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { anonymous, timeoutMs = 15000, headers: extraHeaders, ...rest } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = anonymous ? null : getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...rest,
            headers: { ...headers, ...((extraHeaders as Record<string, string>) || {}) },
            signal: controller.signal,
        });

        if (!res.ok) {
            const detail = await res
                .json()
                .then((body) => body?.detail)
                .catch(() => null);

            if (res.status === 401 && !anonymous) onUnauthorized();
            throw new ApiError(res.status, detail || `API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error: any) {
        if (error.name === "AbortError") throw new ApiError(408, "API Request Timeout");
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    identity_desc: string | null;
}

interface SessionResponse {
    access_token: string;
    token_type: string;
    user: AuthUser;
}

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<AuthUser> => {
        const data = await fetchAPI<SessionResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            anonymous: true,
        });
        setToken(data.access_token);
        return data.user;
    },
    register: async (email: string, password: string, name: string): Promise<AuthUser> => {
        const data = await fetchAPI<SessionResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
            anonymous: true,
        });
        setToken(data.access_token);
        return data.user;
    },
    getMe: () => fetchAPI<AuthUser>("/auth/me"),
    logout: () => clearSession(),

    // Energy
    getEnergyForecast: (userId: string) =>
        fetchAPI(`/energy/forecast/${userId}`),
    logEnergy: (data: any) =>
        fetchAPI("/energy/log", { method: "POST", body: JSON.stringify(data) }),
    getEnergyHistory: (userId: string, days = 7) =>
        fetchAPI(`/energy/history/${userId}?days=${days}`),
    getEnergyComparison: (userId: string) =>
        fetchAPI(`/energy/comparison/${userId}`),

    // Burnout
    getBurnoutRisk: (userId: string, params?: Record<string, number>) => {
        const query = params ? "?" + new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString() : "";
        return fetchAPI(`/burnout/risk/${userId}${query}`);
    },
    getBurnoutTrend: (userId: string, days = 30) =>
        fetchAPI(`/burnout/trend/${userId}?days=${days}`),
    getLatestBurnoutSnapshot: (userId: string) =>
        fetchAPI(`/burnout/snapshot/${userId}/latest`),
    recordBurnoutSnapshot: (data: any) =>
        fetchAPI("/burnout/snapshot", { method: "POST", body: JSON.stringify(data) }),

    // Scheduler
    optimizeSchedule: (userId: string) =>
        fetchAPI(`/scheduler/optimize/${userId}`, { method: "POST", body: JSON.stringify({}) }),
    getSchedule: (userId: string) =>
        fetchAPI(`/scheduler/schedule/${userId}`),

    // Identity
    updateIdentity: (desc: string) =>
        fetchAPI("/identity/profile", {
            method: "POST",
            body: JSON.stringify({ identity_desc: desc }),
        }),
    getIdentityProfile: (userId: string) =>
        fetchAPI(`/identity/profile/${userId}`),
    computeAlignment: (taskId?: string, desc?: string) =>
        fetchAPI("/identity/align", {
            method: "POST",
            body: JSON.stringify({ task_id: taskId, task_description: desc }),
        }),
    getAlignmentScores: (userId: string) =>
        fetchAPI(`/identity/scores/${userId}`),

    // Tasks
    createTask: (data: any) =>
        fetchAPI("/tasks/", { method: "POST", body: JSON.stringify(data) }),
    getTasks: (userId: string, status?: string) => {
        const query = status ? `?status=${status}` : "";
        return fetchAPI(`/tasks/user/${userId}${query}`);
    },
    updateTaskStatus: (taskId: string, status: string) =>
        fetchAPI(`/tasks/${taskId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),

    // Replanning
    triggerReplan: (triggerType: string) =>
        fetchAPI("/replan/trigger", {
            method: "POST",
            body: JSON.stringify({ trigger_type: triggerType }),
        }),

    // Analytics
    getDashboard: (userId: string) =>
        fetchAPI(`/analytics/dashboard/${userId}`),

    // Health — public, no token needed
    healthCheck: () => fetchAPI("/health", { anonymous: true, timeoutMs: 3000 }),

    // Chat
    chatWithAurora: (message: string) =>
        fetchAPI("/chat/", {
            method: "POST",
            body: JSON.stringify({ message }),
        }),
};
