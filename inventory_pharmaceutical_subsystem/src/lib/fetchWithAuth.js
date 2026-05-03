//Read the JWT from localStorage
//Adds the Authorization: Bearer <token> header
//Redirects to /login on a 401 response
export async function fetchWithAuth(url, options = {}) {
  // Accessing env variables from the client side requires NEXT_PUBLIC_ prefix,
  // but since fetchWithAuth is often used client-side, ensure your env var is accessible.
  // Note: For sensitive keys, it's safer to use an API route as a proxy, 
  // but we'll use the environment variable for now.
  const externalApiKey = process.env.NEXT_PUBLIC_EXTERNAL_PMS_API_KEY;

  //Read token from localStorage (client-side only)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Add External API Key if calling the pms-backend
  if (url.includes("pms-backend-kohl.vercel.app")) {
    headers["x-api-key"] = externalApiKey;
  }

  const response = await fetch(url, { ...options, headers });

  //Auto-redirect on 401 (token expired or missing)
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  }

  return response;
}
