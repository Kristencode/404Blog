document.addEventListener("DOMContentLoaded", function () {
  // MENU TOGGLE
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    document.querySelector('label[for="menu-toggle"]').addEventListener("click", function () {
      menuToggle.checked = !menuToggle.checked;
      mobileMenu.classList.toggle("hidden");
    });
  }

  // DYNAMIC AUTH NAVIGATION
  const authLinks = document.getElementById("authLinks");
  const mobileMenuLinks = document.getElementById("mobile-menu");
  const signOutBtn = document.getElementById("signOut");
  const mobileSignOutBtn = document.getElementById("mobileSignOut");
  const createPostNav = document.getElementById("createPostNav");
  const createPostMobile = document.getElementById("createPostMobile");
  const createPostButton = document.getElementById("createPostButton");
  const profileNav = document.getElementById("profileNav");
  const mobileProfileNav = document.getElementById("mobileProfileNav");
  const isLoggedIn = !!sessionStorage.getItem("authToken");
  if (authLinks) {
    if (isLoggedIn) {
      authLinks.querySelector('a[href="/dist/reg.html"]').classList.add("hidden");
      authLinks.querySelector('a[href="/dist/login.html"]').classList.add("hidden");
      if (signOutBtn) signOutBtn.classList.remove("hidden");
      if (profileNav) profileNav.classList.remove("hidden");
    } else {
      authLinks.querySelector('a[href="/dist/reg.html"]').classList.remove("hidden");
      authLinks.querySelector('a[href="/dist/login.html"]').classList.remove("hidden");
      if (signOutBtn) signOutBtn.classList.add("hidden");
      if (profileNav) profileNav.classList.add("hidden");
    }
  }
  if (mobileMenuLinks) {
    if (isLoggedIn) {
      mobileMenuLinks.querySelector('a[href="/dist/reg.html"]').classList.add("hidden");
      mobileMenuLinks.querySelector('a[href="/dist/login.html"]').classList.add("hidden");
      if (mobileSignOutBtn) mobileSignOutBtn.classList.remove("hidden");
      if (mobileProfileNav) mobileProfileNav.classList.remove("hidden");
    } else {
      mobileMenuLinks.querySelector('a[href="/dist/reg.html"]').classList.remove("hidden");
      mobileMenuLinks.querySelector('a[href="/dist/login.html"]').classList.remove("hidden");
      if (mobileSignOutBtn) mobileSignOutBtn.classList.add("hidden");
      if (mobileProfileNav) mobileProfileNav.classList.add("hidden");
    }
  }
  // Show/hide Create Post and Profile links
  if (isLoggedIn) {
    if (createPostNav) createPostNav.classList.remove("hidden");
    if (createPostMobile) createPostMobile.classList.remove("hidden");
    if (createPostButton) createPostButton.classList.remove("hidden");
  } else {
    if (createPostNav) createPostNav.classList.add("hidden");
    if (createPostMobile) createPostMobile.classList.add("hidden");
    if (createPostButton) createPostButton.classList.add("hidden");
  }

  // SIGN OUT
  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      window.location.href = "/dist/index.html";
    });
  }
  if (mobileSignOutBtn) {
    mobileSignOutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      window.location.href = "/dist/index.html";
    });
  }

  // DYNAMIC CATEGORY NAVIGATION
  const allowedCategories = ["health", "business", "sports", "entertainment", "food", "technology"];
  const navLinks = document.getElementById("navLinks");
  const footerNavLinks = document.getElementById("footerNavLinks");
  if (navLinks || mobileMenuLinks || footerNavLinks) {
    fetch("https://test.blockfuselabs.com/api/categories")
      .then((response) => response.json())
      .then((result) => {
        const categories = result.data || [];
        const filtered = categories.filter((cat) => allowedCategories.includes(cat.slug.toLowerCase()));
        if (filtered.length > 0) {
          if (navLinks) {
            filtered.forEach((category) => {
              const link = document.createElement("a");
              link.href = `/dist/index.html?category=${category.id}`;
              link.className = "text-gray-600 hover:text-gray-900";
              link.textContent = category.name;
              navLinks.appendChild(link);
            });
          }
          if (mobileMenuLinks) {
            filtered.forEach((category) => {
              const link = document.createElement("a");
              link.href = `/dist/index.html?category=${category.id}`;
              link.className = "block py-2 text-gray-600 hover:text-gray-900";
              link.textContent = category.name;
              mobileMenuLinks.insertBefore(link, mobileMenuLinks.querySelector('a[href="/dist/login.html"]') || mobileMenuLinks.lastChild);
            });
          }
          if (footerNavLinks) {
            filtered.forEach((category) => {
              const link = document.createElement("a");
              link.href = `/dist/index.html?category=${category.id}`;
              link.className = "hover:text-gray-300";
              link.textContent = category.name;
              footerNavLinks.appendChild(link);
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching categories for navigation:", error);
      });
  }

  // CATEGORY DROPDOWN
  const dropdown = document.getElementById("categoryId");
  if (dropdown) {
    fetch("https://test.blockfuselabs.com/api/categories")
      .then((response) => response.json())
      .then((result) => {
        const categories = result.data || [];
        if (Array.isArray(categories) && categories.length > 0) {
          dropdown.innerHTML = `<option value="" disabled selected>Select a category</option>`;
          const filtered = categories.filter((cat) => allowedCategories.includes(cat.slug.toLowerCase()));
          filtered.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            dropdown.appendChild(option);
          });
        } else {
          dropdown.innerHTML = `<option value="">No categories available</option>`;
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        dropdown.innerHTML = `<option value="">Failed to load categories</option>`;
      });
  }

  // REGISTER FORM
  const regForm = document.getElementById("regForm");
  const submitBtn = document.getElementById("submit");
  const responseMessage = document.getElementById("responseMessage");
  if (regForm && submitBtn && responseMessage) {
    regForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const name = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password1").value.trim();
      const team = document.getElementById("teamName").value.trim();

      if (!name || !email || !password || !team) {
        responseMessage.textContent = "Please fill in all fields.";
        responseMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      if (password.length < 8) {
        responseMessage.textContent = "Password must be at least 8 characters.";
        responseMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";
      responseMessage.textContent = "Creating account...";
      responseMessage.className = "text-gray-600 text-sm text-center";

      try {
        const response = await fetch("https://test.blockfuselabs.com/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, team_name: team }),

        });
        const data = await response.json();

        if (response.ok) {
          responseMessage.textContent = `${data.user.name}, registration successful!`;
          responseMessage.className = "text-green-600 text-sm text-center";
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("userData", JSON.stringify(data.user));
          regForm.reset();
          setTimeout(() => (window.location.href = "/dist/login.html"), 1500);
        } else {
          responseMessage.textContent = data.message || "Registration failed";
          responseMessage.className = "text-red-600 text-sm text-center";
        }
      } catch (error) {
        console.error("Registration error:", error);
        responseMessage.textContent = "Network error. Try again.";
        responseMessage.className = "text-red-600 text-sm text-center";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
      }
    });
  }

  // LOGIN FORM
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");
  if (loginForm && message) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = loginForm.elements["email"].value.trim();
      const password = loginForm.elements["password"].value.trim();

      if (!email || !password) {
        message.textContent = "Please enter both email and password.";
        message.style.color = "red";
        return;
      }

      message.textContent = "Logging in...";
      message.style.color = "gray";

      try {
        const response = await fetch("https://test.blockfuselabs.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          message.textContent = `Welcome back, ${data.user?.name || "User"}!`;

          message.style.color = "green";
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("userData", JSON.stringify(data.user));
          loginForm.reset();
          setTimeout(() => (window.location.href = "/dist/index.html"), 1500);
        } else {
          message.textContent = data.error || "Login failed. Please try again.";
          message.style.color = "red";
        }
      } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Network error. Please try again.";
        message.style.color = "red";
      }
    });
  }

  // USER PROFILE FORM
  const profileForm = document.getElementById("profileForm");
  const profileMessage = document.getElementById("profileMessage");
  if (profileForm && profileMessage) {
    // Load user profile
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      fetch("https://test.blockfuselabs.com/api/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user) {
            document.getElementById("profileName").value = data.user.name || "";
            document.getElementById("profileEmail").value = data.user.email || "";
            document.getElementById("profileTeam").value = data.user.team_name || "";
          }
        })
        .catch((error) => {
          console.error("Error loading profile:", error);
          profileMessage.textContent = "Failed to load profile.";
          profileMessage.className = "text-red-600 text-sm text-center";
        });
    }

    // Update profile
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("profileName").value.trim();
      const email = document.getElementById("profileEmail").value.trim();
      const team = document.getElementById("profileTeam").value.trim();
      const password = document.getElementById("profilePassword").value.trim();

      if (!name || !email || !team) {
        profileMessage.textContent = "Please fill in required fields.";
        profileMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        profileMessage.textContent = "Please log in to update profile.";
        profileMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      const body = { name, email, team_name: team };
      if (password) body.password = password;

      try {
        const response = await fetch("https://test.blockfuselabs.com/api/user", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (response.ok) {
          profileMessage.textContent = "Profile updated successfully!";
          profileMessage.className = "text-green-600 text-sm text-center";
          sessionStorage.setItem("userData", JSON.stringify(data.user));
          if (password) profileForm.reset();
        } else {
          profileMessage.textContent = data.message || "Failed to update profile.";
          profileMessage.className = "text-red-600 text-sm text-center";
        }
      } catch (error) {
        console.error("Profile update error:", error);
        profileMessage.textContent = "Network error. Try again.";
        profileMessage.className = "text-red-600 text-sm text-center";
      }
    });
  }

  // SEARCH FORM
  const searchForm = document.getElementById("searchForm");
  const postsContainer = document.getElementById("postsContainer");
  if (searchForm && postsContainer) {
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const query = document.getElementById("searchQuery").value.trim();
      if (!query) {
        showMessage("Search query cannot be empty.", true);
        return;
      }
      loadPosts(postsContainer, query);
    });
  }

  // FETCH AND DISPLAY POSTS
  if (postsContainer) {
    loadPosts(postsContainer);
  }

  // LOAD SINGLE POST (for news.html)
  const postContainer = document.getElementById("postContainer");
  if (postContainer) {
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (postId) {
      loadSinglePost(postId, postContainer);
    }
  }

  // CREATE/EDIT POST FORM
  const postForm = document.getElementById("postForm");
  const postMessage = document.getElementById("postMessage");
  if (postForm && postMessage) {
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (postId) {
      // Edit mode: Load post
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        fetch(`https://test.blockfuselabs.com/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.post) {
              document.getElementById("postTitle").value = data.post.title || "";
              document.getElementById("postContent").value = data.post.content || "";
              document.getElementById("categoryId").value = data.post.category_id || "";
              document.getElementById("featuredImage").value = data.post.featured_image_url_full || "";
            }
          })
          .catch((error) => {
            console.error("Error loading post:", error);
            postMessage.textContent = "Failed to load post.";
            postMessage.className = "text-red-600 text-sm text-center";
          });
      }
    }

    postForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const title = document.getElementById("postTitle").value.trim();
      const content = document.getElementById("postContent").value.trim();
      const categoryId = document.getElementById("categoryId").value;
      const featuredImage = document.getElementById("featuredImage").value.trim();

      if (!title || !content || !categoryId) {
        postMessage.textContent = "Please fill in all required fields.";
        postMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        postMessage.textContent = "Please log in to create/edit post.";
        postMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      const url = postId
        ? `https://test.blockfuselabs.com/api/posts/${postId}`
        : "https://test.blockfuselabs.com/api/posts";
      const method = postId ? "PATCH" : "POST";

      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ title, content, category_id: categoryId, featured_image: featuredImage }),
        });
        const data = await response.json();

        if (response.ok) {
          postMessage.textContent = postId ? "Post updated successfully!" : "Post created successfully!";
          postMessage.className = "text-green-600 text-sm text-center";
          postForm.reset();
          setTimeout(() => (window.location.href = "/dist/index.html"), 1500);
        } else {
          postMessage.textContent = data.message || "Failed to save post.";
          postMessage.className = "text-red-600 text-sm text-center";
        }
      } catch (error) {
        console.error("Post save error:", error);
        postMessage.textContent = "Network error. Try again.";
        postMessage.className = "text-red-600 text-sm text-center";
      }
    });
  }

  // COMMENT FORM HANDLING
  const commentForm = document.getElementById("commentForm");
  const commentsContainer = document.getElementById("commentsContainer");
  if (commentForm && commentsContainer) {
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (postId) {
      loadComments(postId, commentsContainer); // Load comments on page load
      commentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const commentText = document.getElementById("commentText").value.trim();
        if (!commentText) {
          showMessage("Comment cannot be empty.", true);
          return;
        }
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
          showMessage("Please log in to comment.", true);
          return;
        }

        commentForm.querySelector("button").disabled = true;
        commentForm.querySelector("button").textContent = "Posting...";
        showMessage("Posting comment...", false);

        try {
          const endpoint = `https://test.blockfuselabs.com/api/posts/${postId}/comments`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ post_id: postId, content: commentText }),
          });
          const contentType = response.headers.get("content-type");
          const rawResponse = await response.text();
          let data;
          try {
            data = JSON.parse(rawResponse);
          } catch (e) {
            console.error(`Failed to parse JSON from ${endpoint}:`, e);
            data = { error: `Invalid response format: ${rawResponse.slice(0, 100)}...` };
          }

          if (response.ok) {
            showMessage("Comment posted successfully!");
            document.getElementById("commentText").value = "";
            loadComments(postId, commentsContainer);
          } else if (response.status === 401) {
            showMessage("Unauthorized: Please log in again.", true);
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("userData");
            setTimeout(() => (window.location.href = "/dist/login.html"), 2000);
          } else if (response.status >= 500) {
            showMessage(`Server error (Status: ${response.status}). Please try again later.`, true);
          } else {
            showMessage(`Failed to post comment: ${data.error || data.message || response.statusText} (Status: ${response.status})`, true);
          }
        } catch (error) {
          console.error("Comment posting error:", error);
          showMessage(`Network error: ${error.message}. Please check your connection and try again.`, true);
        } finally {
          commentForm.querySelector("button").disabled = false;
          commentForm.querySelector("button").textContent = "Post Comment";
        }
      });
    } else {
      showMessage("Invalid post ID for commenting.", true);
    }
  }
});

// Utility to show messages
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
// Load posts dynamically (for index.html)
async function loadPosts(container, searchQuery = null) {
  container.innerHTML = `<p class="text-center text-gray-600 animate-pulse">Loading posts...</p>`;
  try {
    let url = "https://test.blockfuselabs.com/api/posts";
    const categoryId = new URLSearchParams(window.location.search).get("category");
    if (categoryId) {
      url += `?category_id=${categoryId}`;
    } else if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    console.log(`Fetching posts from ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log("Posts response:", data);
    if (response.ok && Array.isArray(data.data)) {
      const user = JSON.parse(sessionStorage.getItem("userData") || "{}");
      console.log("Logged-in user:", user);
      container.innerHTML = "";
      data.data.forEach((post) => {
        console.log(`Post ${post.id}:`, { user_id: post.user_id, logged_in_user_id: user.id });
        const imageUrl = post.featured_image_url_full ? post.featured_image_url_full : null;
        const postElement = document.createElement("div");
        postElement.className = "mb-6 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow";
        postElement.innerHTML = `
          <h3 class="text-xl font-semibold">${post.title}</h3>
          <p class="text-gray-600">${post.excerpt || post.content.substring(0, 100) + "..."}</p>
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${post.title}" class="w-full h-32 object-cover mb-4 rounded-md" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image';" />`
              : ""
          }
          <div class="mt-2">
            <a href="/dist/news.html?postId=${post.id}" class="text-indigo-500 hover:underline">Read more</a>
            ${
              user.id && post.user_id && user.id === post.user_id
                ? `
                  <a href="/dist/post.html?postId=${post.id}" class="text-green-500 hover:underline ml-4">Edit</a>
                  <button class="delete-post text-red-500 hover:underline ml-4" data-post-id="${post.id}">Delete</button>
                `
                : ""
            }
          </div>
        `;
        container.appendChild(postElement);
      });

      document.querySelectorAll(".delete-post").forEach((button) => {
        button.addEventListener("click", async () => {
          const postId = button.dataset.postId;
          if (confirm("Are you sure you want to delete this post?")) {
            await deletePost(postId);
          }
        });
      });
    } else {
      container.innerHTML = `<p class="text-center text-red-600">No posts found. Error: ${data.message || response.statusText}</p>`;
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    container.innerHTML = `<p class="text-center text-red-600">Failed to load posts: ${error.message}</p>`;
  }
}

// Load single post (for news.html)
async function loadSinglePost(postId, container) {
  container.innerHTML = `<p class="text-center text-gray-600 animate-pulse">Loading post...</p>`;
  try {
    const response = await fetch(`https://test.blockfuselabs.com/api/posts/${postId}`);
    const data = await response.json();
    console.log("Single post response:", data);
    if (response.ok && data.post) {
      const post = data.post;
      const user = JSON.parse(sessionStorage.getItem("userData") || "{}");
      console.log(`Post ${post.id}:`, { user_id: post.user_id, logged_in_user_id: user.id });
      const imageUrl = post.featured_image
        ? post.featured_image.startsWith("http")
          ? post.featured_image
          : `https://test.blockfuselabs.com${post.featured_image}`
        : null;
      container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${post.title}</h2>
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover mb-4 rounded-md" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image';" />`
            : ""
        }
        <p class="text-gray-800 mb-4">${post.content}</p>
        <p class="text-sm text-gray-500">Posted by ${post.user_name || "Anonymous"} on ${new Date(post.created_at).toLocaleDateString()}</p>
        ${
          user.id && post.user_id && user.id === post.user_id
            ? `
              <div class="mt-4">
                <a href="/dist/post.html?postId=${post.id}" class="text-green-500 hover:underline">Edit</a>
                <button class="delete-post text-red-500 hover:underline ml-4" data-post-id="${post.id}">Delete</button>
              </div>
            `
            : ""
        }
      `;
      document.querySelectorAll(".delete-post").forEach((button) => {
        button.addEventListener("click", async () => {
          const postId = button.dataset.postId;
          if (confirm("Are you sure you want to delete this post?")) {
            await deletePost(postId);
          }
        });
      });
    } else {
      container.innerHTML = `<p class="text-center text-red-600">Failed to load post. Error: ${data.message || response.statusText}</p>`;
    }
  } catch (error) {
    console.error("Error loading single post:", error);
    container.innerHTML = `<p class="text-center text-red-600">Failed to load post: ${error.message}</p>`;
  }
}

// Load comments dynamically
async function loadComments(postId, container) {
  container.innerHTML = `<p class="text-center text-gray-600 animate-pulse">Loading comments...</p>`;
  try {
    const endpoints = [
      `https://test.blockfuselabs.com/api/posts/${postId}/comments`,
      `https://test.blockfuselabs.com/api/comments?post_id=${postId}`,
    ];
    let response, data;
    for (const endpoint of endpoints) {
      console.log(`Trying to fetch comments from ${endpoint}`);
      response = await fetch(endpoint);
      const text = await response.text();
      console.log(`Raw response from ${endpoint}:`, text);
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error(`Failed to parse JSON from ${endpoint}:`, e);
        data = { error: "Invalid response format" };
      }
      console.log(`Parsed response from ${endpoint}:`, { status: response.status, data });
      if (response.ok) break;
    }

    const user = JSON.parse(sessionStorage.getItem("userData") || "{}");
    if (response.ok) {
      const comments = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : data.comments || [];
      container.innerHTML = "";
      if (comments.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600">No comments yet.</p>`;
      } else {
        comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          commentElement.className = "mb-4 p-3 border-b";
          commentElement.innerHTML = `
            <p class="text-gray-800">${comment.content}</p>
            <p class="text-sm text-gray-500">By ${comment.user_name || "Anonymous"} on ${new Date(comment.created_at).toLocaleDateString()}</p>
            ${
              user.id && comment.user_id && user.id === comment.user_id
                ? `<button class="delete-comment text-red-500 hover:underline" data-comment-id="${comment.id}">Delete</button>`
                : ""
            }
          `;
          container.appendChild(commentElement);
        });
      }

      document.querySelectorAll(".delete-comment").forEach((button) => {
        button.addEventListener("click", async () => {
          const commentId = button.dataset.commentId;
          if (confirm("Are you sure you want to delete this comment?")) {
            await deleteComment(commentId, postId, container);
          }
        });
      });
    } else {
      container.innerHTML = `<p class="text-center text-red-600">Failed to load comments. Error: ${data.error || data.message || response.statusText} (Status: ${response.status})</p>`;
    }
  } catch (error) {
    console.error("Error loading comments:", error);
    container.innerHTML = `<p class="text-center text-red-600">Failed to load comments: ${error.message}. Please try again later.</p>`;
  }
}

// Delete comment
async function deleteComment(commentId, postId, container) {
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    showMessage("Please log in to delete comments.", true);
    return;
  }

  try {
    const endpoint = `https://test.blockfuselabs.com/api/comments/${commentId}`;
    console.log(`Deleting comment at ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = response.status === 204 ? {} : await response.json();
    console.log(`Delete comment response:`, { status: response.status, data });
    if (response.ok || response.status === 204) {
      showMessage("Comment deleted successfully!");
      loadComments(postId, container);
    } else {
      showMessage(`Failed to delete comment: ${data.error || response.statusText} (Status: ${response.status})`, true);
    }
  } catch (error) {
    console.error("Delete comment error:", error);
    showMessage(`Network error: ${error.message}. Try again.`, true);
  }
}

// Delete post
async function deletePost(postId) {
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    showMessage("Please log in to delete posts.", true);
    return;
  }

  try {
    const endpoint = `https://test.blockfuselabs.com/api/posts/${postId}`;
    console.log(`Deleting post at ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = response.status === 204 ? {} : await response.json();
    console.log(`Delete post response:`, { status: response.status, data });
    if (response.ok || response.status === 204) {
      showMessage("Post deleted successfully!");
      setTimeout(() => (window.location.href = "/dist/index.html"), 1500);
    } else {
      showMessage(`Failed to delete post: ${data.error || response.statusText} (Status: ${response.status})`, true);
    }
  } catch (error) {
    console.error("Delete post error:", error);
    showMessage(`Network error: ${error.message}. Try again.`, true);
  }
}
