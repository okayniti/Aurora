// AURORA API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
}

export const api = {
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

    // Scheduler
    optimizeSchedule: (userId: string) =>
        fetchAPI(`/scheduler/optimize/${userId}`, { method: "POST", body: JSON.stringify({}) }),
    getSchedule: (userId: string) =>
        fetchAPI(`/scheduler/schedule/${userId}`),

    // Identity
    updateIdentity: (userId: string, desc: string) =>
        fetchAPI("/identity/profile", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, identity_desc: desc }),
        }),
    computeAlignment: (userId: string, taskId?: string, desc?: string) =>
        fetchAPI("/identity/align", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, task_id: taskId, task_description: desc }),
        }),
    getAlignmentScores: (userId: string) =>
        fetchAPI(`/identity/scores/${userId}`),

    // Tasks
    createTask: (data: any) =>
        fetchAPI("/tasks/", { method: "POST", body: JSON.stringify(data) }),
    getTasks: (userId: string, status?: string) => {
        const query = status ? `?status=${status}` : "";
        return fetchAPI(`/tasks/${userId}${query}`);
    },
    updateTaskStatus: (taskId: string, status: string) =>
        fetchAPI(`/tasks/${taskId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),

    // Replanning
    triggerReplan: (userId: string, triggerType: string) =>
        fetchAPI("/replan/trigger", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, trigger_type: triggerType }),
        }),

    // Analytics
    getDashboard: (userId: string) =>
        fetchAPI(`/analytics/dashboard/${userId}`),

    // Health
    healthCheck: () => fetchAPI("/health"),
};
