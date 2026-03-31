import { api } from "./client";

// Get profile
export const getProfileApi = (token) => {
  return api.get("/user", { headers: { Authorization: `Bearer ${token}` } });
};

// Update profile
export const updateProfileApi = (token, name, email, image = null) => {
  // If on web, send JSON
  if (typeof window !== "undefined" && window.navigator.userAgent.includes("Mozilla")) {
    return api.put(
      "/user",
      { fullName: name, email }, // no file upload for web
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Mobile: use FormData for image upload
  const formData = new FormData();
  formData.append("fullName", name);
  formData.append("email", email);

  if (image && image.startsWith("file://")) {
    const filename = image.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append("profileImage", {
      uri: image,
      name: filename,
      type,
    });
  }

  return api.put("/user", formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });
};

// Delete profile image
export const deleteProfileImageApi = (token) => {
  return api.delete("/user/profile-image", {
    headers: { Authorization: `Bearer ${token}` },
  });
};