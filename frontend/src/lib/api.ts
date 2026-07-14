import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Create an Axios instance configured for the proofStack API.
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 120000, // 2 minutes for AI operations
  });

  // Request interceptor: attach auth token if available (checking Firebase first)
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (typeof window !== "undefined") {
        let token = localStorage.getItem("access_token");
        try {
          if (auth && auth.currentUser) {
            const fbToken = await auth.currentUser.getIdToken();
            if (fbToken) {
              token = fbToken;
              localStorage.setItem("access_token", fbToken);
            }
          }
        } catch {
          // Fallback to localStorage token if Firebase ID token retrieval fails
        }
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle common errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;

        // Handle 401 — token expired or invalid
        if (status === 401 && typeof window !== "undefined") {
          // Don't redirect if already on auth page
          if (!window.location.pathname.startsWith("/login") &&
              !window.location.pathname.startsWith("/register")) {
            // Token might be expired — clear and let the user know
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        }

        // Return a structured error
        return Promise.reject({
          status,
          detail: data?.detail || "An unexpected error occurred",
          data,
        });
      }

      // Network error
      return Promise.reject({
        status: 0,
        detail: "Network error. Please check your connection.",
      });
    }
  );

  return client;
}

export const api = createApiClient();

// ==========================================
// Auth API
// ==========================================
export const authApi = {
  register: (data: { full_name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  sync: () => api.post("/auth/sync"),

  me: () => api.get("/auth/me"),
};


// ==========================================
// Resume API
// ==========================================
export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  list: () => api.get("/resumes"),

  get: (id: string) => api.get(`/resumes/${id}`),

  delete: (id: string) => api.delete(`/resumes/${id}`),
};

// ==========================================
// Job Description API
// ==========================================
export const jobDescriptionApi = {
  create: (data: { job_title: string; company_name?: string; raw_text: string }) =>
    api.post("/job-descriptions", data),
};

// ==========================================
// Analysis API
// ==========================================
export const analysisApi = {
  create: (data: { resume_id: string; job_description_id: string }) =>
    api.post("/analyses", data),

  list: () => api.get("/analyses"),

  get: (id: string) => api.get(`/analyses/${id}`),

  delete: (id: string) => api.delete(`/analyses/${id}`),

  getSkills: (id: string) => api.get(`/analyses/${id}/skills`),

  getSkillDetail: (analysisId: string, skillId: string) =>
    api.get(`/analyses/${analysisId}/skills/${skillId}`),

  getRecommendations: (id: string) => api.get(`/analyses/${id}/recommendations`),
};

// ==========================================
// Interrogation API
// ==========================================
export const interrogationApi = {
  start: (analysisId: string, data: { skill_evidence_id: string }) =>
    api.post(`/analyses/${analysisId}/interrogation`, data),

  sendMessage: (sessionId: string, data: { content: string }) =>
    api.post(`/interrogation/${sessionId}/message`, data),

  getSession: (sessionId: string) => api.get(`/interrogation/${sessionId}`),
};

// ==========================================
// Billing & Subscriptions API
// ==========================================
export const billingApi = {
  getPlans: () => api.get("/billing/plans"),

  createCheckout: (data: { plan_id: string; return_url: string }) =>
    api.post("/billing/checkout", data),

  getStatus: (orderId: string) => api.get(`/billing/status/${orderId}`),

  cancel: () => api.post("/billing/cancel"),
};

export default api;

