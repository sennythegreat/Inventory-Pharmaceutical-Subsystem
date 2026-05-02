//Read the JWT from localStorage
//Adds the Authorization: Bearer <token> header
//Redirects to /login on a 401 response
export async function fetchWithAuth(url, options = {}) {
  //Read token from localStorage (client-side only)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  //Auto-redirect on 401 (token expired or missing)
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  }

  return response;
}
