document.getElementById("postForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
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
  
    if (featuredImage && featuredImage.size > 2 * 1024 * 1024) {
      showMessage("Image must be less than 2MB.", true);
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("date", postDateTime);
    if (featuredImage) formData.append("featured_image", featuredImage);
  
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    showMessage("Creating post...", false);
  
    let result = await createPost(formData);
  
    if (!result.success && result.error.includes("500")) {
      console.log("Retrying with fallback endpoint...");
      result = await createPost(formData, "https://test.blockfuselabs.com/api/v1/posts");
    }
  
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  
    if (result.success) {
      showMessage(`Post created! ID: ${result.data.id}`);
      document.getElementById("postForm").reset();
      document.getElementById("fileName").textContent = "Choose image";
      setTimeout(() => (window.location.href = `/dist/news.html?postId=${result.data.id}`), 1500);
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
  
  async function createPost(formData, apiUrl = "https://test.blockfuselabs.com/api/posts") {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) throw new Error("Please log in to create a post.");
  
      const response = await fetch(apiUrl, {
        method: "POST",
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
      if (!response.ok) {
        throw new Error(result.error || result.message || `Error: ${response.status} ${response.statusText}`);
      }
  
      return { success: true, data: result };
    } catch (error) {
      console.error("API Error:", error.message);
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