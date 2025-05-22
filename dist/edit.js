document.addEventListener("DOMContentLoaded", async () => {
  const postId = new URLSearchParams(window.location.search).get("postId");
  if (!postId) {
    showMessage("Invalid post ID.", true);
    return;
  }

  // Fetch post data
  try {
    console.log(`Fetching post with ID: ${postId}`);
    const endpoints = [
      `https://test.blockfuselabs.com/api/posts/${postId}`,
      `https://test.blockfuselabs.com/api/post/${postId}`
    ];
    let response, data;
    for (const endpoint of endpoints) {
      response = await fetch(endpoint);
      data = await response.json();
      if (response.ok) break;
    }

    if (response.ok && (data.data || data)) {
      const post = data.data || data;
      document.getElementById("title").value = post.title;
      document.getElementById("author").value = post.author;
      document.getElementById("content").value = post.content;
      document.getElementById("categoryId").value = post.category_id;
      document.getElementById("fileName").textContent = post.featured_image ? "Current image loaded" : "Choose image";
    } else {
      showMessage(`Failed to load post. Error: ${data.message || response.statusText}`, true);
    }
  } catch (error) {
    console.error("Error loading post:", error);
    showMessage("Failed to load post. Please try again later.", true);
  }
});

document.getElementById("editForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const postId = new URLSearchParams(window.location.search).get("postId");
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const content = document.getElementById("content").value.trim();
  const categoryId = document.getElementById("categoryId").value;
  const imageInput = document.getElementById("featuredImage");
  const featuredImage = imageInput?.files[0];
  const postDateTime = new Date().toISOString();

  if (!title || !author || !content || !categoryId) {
    showMessage("Please fill in all required fields.", true);
    return;
  }

  if (featuredImage) {
    if (featuredImage.size > 2 * 1024 * 1024) {
      showMessage("Image must be less than 2MB.", true);
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif"].includes(featuredImage.type)) {
      showMessage("Only JPEG, PNG, or GIF images are allowed.", true);
      return;
    }
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("content", content);
  formData.append("category_id", categoryId);
  formData.append("date", postDateTime);
  if (featuredImage) formData.append("featured_image", featuredImage);
  formData.append("_method", "PUT"); // Laravel-style for PUT

  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Updating...";
  showMessage("Updating post...", false);

  let result = await updatePost(postId, formData);

  if (!result.success && result.error.includes("500")) {
    console.log("Retrying with fallback endpoint...");
    result = await updatePost(postId, formData, "https://test.blockfuselabs.com/api/v1/posts");
  }

  submitButton.disabled = false;
  submitButton.textContent = "Update";

  if (result.success) {
    showMessage("Post updated successfully!");
    setTimeout(() => (window.location.href = `/dist/news.html?postId=${postId}`), 1500);
  } else {
    showMessage(`Error: ${result.error}`, true);
  }
});

document.getElementById("featuredImage")?.addEventListener("change", (event) => {
  const fileNameSpan = document.getElementById("fileName");
  const file = event.target.files[0];
  fileNameSpan.textContent = file ? file.name : "Choose image";
});

function showMessage(text, isError = false) {
  const messageDiv = document.getElementById("formMessage") || document.createElement("div");
  if (!messageDiv.id) {
    messageDiv.id = "formMessage";
    document.body.appendChild(messageDiv);
  }
  messageDiv.textContent = text;
  messageDiv.className = `mt-4 p-4 rounded-md text-center font-bold ${isError ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`;
  messageDiv.style.display = "block";
  setTimeout(() => (messageDiv.style.display = "none"), 10000);
}

async function updatePost(postId, formData, apiUrl = `https://test.blockfuselabs.com/api/posts/${postId}`) {
  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) throw new Error("Please log in to update a post.");

    console.log(`Updating post at ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: "POST", // Use POST with _method=PUT for Laravel
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      saveResponseToFile(text);
      throw new Error(`Unexpected HTML response: ${text.substring(0, 100)}... (saved to file)`);
    }

    const result = JSON.parse(text);
    console.log("Post update response:", result);
    if (!response.ok) {
      throw new Error(result.error || result.message || `Error: ${response.status} ${response.statusText}`);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Post update error:", error.message);
    return { success: false, error: error.message };
  }
}

function saveResponseToFile(content, filename = `response_${Date.now()}.html`) {
  try {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Saved response to ${filename}`);
  } catch (e) {
    console.error("Failed to save response:", e);
  }
}