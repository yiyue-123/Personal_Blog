const API_BASE = "/api";
const SESSION_STORAGE_KEY = "devblog-session";

function buildHeaders(customHeaders = {}) {
  const session = getStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(options.headers),
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || payload.code !== 200) {
    throw new Error(payload?.msg || "请求失败，请稍后重试");
  }

  return payload.data;
}

function saveSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session) {
  saveSession(session);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getCurrentUserProfile() {
  return request("/user/profile");
}

export function getArticles(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request(`/articles${suffix}`);
}

export function getMyArticles(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request(`/articles/mine${suffix}`);
}

export function getArticleDetail(articleId) {
  return request(`/articles/${articleId}`);
}

export function getArticleComments(articleId) {
  return request(`/articles/${articleId}/comments`);
}

export function submitComment(articleId, payload) {
  return request(`/articles/${articleId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function searchArticles(keyword, params = {}) {
  const search = new URLSearchParams({ keyword });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  return request(`/search?${search.toString()}`);
}

export function getCategories() {
  return request("/articles/categories");
}

export function getTags() {
  return request("/articles/tags");
}

export function registerUser(payload) {
  return request("/user/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload, profile = null) {
  const loginResponse = await request("/user/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const session = {
    userId: loginResponse.userId,
    username: loginResponse.username,
    nickname: loginResponse.nickname || profile?.nickname || profile?.username || loginResponse.username,
    role: loginResponse.role,
    token: loginResponse.token
  };

  saveSession(session);
  return session;
}

export function createArticle(payload) {
  return request("/articles", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateArticle(articleId, payload) {
  return request(`/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteArticle(articleId) {
  return request(`/articles/${articleId}`, {
    method: "DELETE"
  });
}

export function createAdminArticle(payload) {
  return request("/admin/articles", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAdminDashboard() {
  return request("/admin/dashboard");
}

export function getRegisterApplications(status) {
  const search = new URLSearchParams();
  if (status !== undefined && status !== null && status !== "") {
    search.set("status", status);
  }
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request(`/admin/register-applications${suffix}`);
}

export function getRegisterApplicationDetail(applicationId) {
  return request(`/admin/register-applications/${applicationId}`);
}

export function approveRegisterApplication(applicationId, reviewReason = "") {
  return request(`/admin/register-applications/${applicationId}/approve`, {
    method: "POST",
    body: JSON.stringify({ reviewReason })
  });
}

export function rejectRegisterApplication(applicationId, reviewReason) {
  return request(`/admin/register-applications/${applicationId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reviewReason })
  });
}
