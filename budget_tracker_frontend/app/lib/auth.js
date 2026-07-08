// save token after login
export function saveToken(token, user_id, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("user_id", user_id);
  localStorage.setItem("username", username);
}

// get token
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// get user info
export function getUser() {
  if (typeof window === "undefined") return { user_id: null, username: null };
  return {
    user_id: localStorage.getItem("user_id"),
    username: localStorage.getItem("username"),
  };
}

// check if logged in
export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

// logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
}