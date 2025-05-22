document.addEventListener("DOMContentLoaded", function () {
  // MENU TOGGLE
  let menuToggle = document.getElementById("menu-toggle");
  let mobileMenu = document.getElementById("mobile-menu");

  document
    .querySelector('label[for="menu-toggle"]')
    .addEventListener("click", function () {
      menuToggle.checked = !menuToggle.checked;
      if (menuToggle.checked) {
        mobileMenu.classList.toggle("hidden");
      }
    });
  // REGISTER FORM
  let form = document.getElementById("regForm");
  let submitBtn = document.getElementById("submit");
  let responseMessage = document.createElement("div");
  responseMessage.id = "responseMessage";
  responseMessage.className = "text-sm text-center mt-2";
  submitBtn.parentElement.insertBefore(responseMessage, submitBtn.nextSibling);

  // Auto-fill registration form if data exists in localStorage
  if (form) {
    let savedUser = localStorage.getItem("registeredUser");
    if (savedUser) {
      try {
        let userData = JSON.parse(savedUser);
        if (userData.name) {
          document.getElementById("fullName").value = userData.name;
        }
        if (userData.email) {
          document.getElementById("email").value = userData.email;
        }
        if (userData.team_name) {
          document.getElementById("teamName").value = userData.team_name;
        }
        // Note: For security, do NOT autofill password from localStorage
      } catch (e) {
        console.warn("Could not parse saved user data:", e);
      }
    }
  }

  if (form && submitBtn) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      let name = document.getElementById("fullName").value.trim();
      let email = document.getElementById("email").value.trim();
      let password = document.getElementById("password1").value.trim();
      let team = document.getElementById("teamName").value.trim();

      if (!name || !email || !password || !team) {
        responseMessage.textContent = " Please fill in all fields.";
        responseMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      if (password.length < 8) {
        responseMessage.textContent =
          " Password must be at least 8 characters.";
        responseMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";

      fetch("https://test.blockfuselabs.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          team_name: team,
        }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return {
              status: response.status,
              ok: response.ok,
              body: data,
            };
          });
        })
        .then(function (result) {
          if (result.ok) {
            responseMessage.textContent =
              result.body.user.name + ", registration successful!";
            responseMessage.className = "text-green-600 text-sm text-center";

            // data to localStorage
            localStorage.setItem(
              "registeredUser",
              JSON.stringify(result.body.user)
            );

            form.reset();
            window.location.href = "/dist/login.html";
          } else {
            responseMessage.textContent =
              result.body.message || "Registration failed";
            responseMessage.className = "text-red-600 text-sm text-center";
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
          responseMessage.textContent = " Network error. Try again.";
          responseMessage.className = "text-red-600 text-sm text-center";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Register";
        });
    });
  }

  // LOGIN FORM
  let loginForm = document.querySelector("form");
  let message = document.getElementById("message");

  if (loginForm && message) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let email = loginForm.elements["email"].value.trim();
      let password = loginForm.elements["password"].value.trim();

      if (!email || !password) {
        message.innerText = "Please enter both email and password.";
        message.style.color = "red";
        return;
      }

      let data = { email: email, password: password };
      message.innerText = "Logging in...";
      message.style.color = "gray";

      fetch("https://test.blockfuselabs.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var json;
            try {
              json = JSON.parse(text);
            } catch (e) {
              throw new Error("Server returned an invalid response.");
            }
            if (!res.ok) {
              throw new Error(json.error || "Login failed");
            }
            return json;
          });
        })
        .then(function (data) {
          message.innerText =
            "Welcome back, " + (data.user?.name || "User") + "!";
          message.style.color = "green";
          loginForm.reset();

          if (data.token) {
            localStorage.setItem("authToken", data.token);
          }
          if (data.user) {
            localStorage.setItem("userData", JSON.stringify(data.user));
          }

          setTimeout(function () {
            window.location.href = "/dist/index.html";
          }, 1500);
        })
        .catch(function (error) {
          message.innerText =
            error.message || "Login failed. Please try again.";
          message.style.color = "red";
        });
    });
  }

  // ====== Fetch and display blog categories ======

});


document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.getElementById("categoryDropdown");

  const allowedCategories = [
    "health",
    "education",
    "sports",
    "entertainment",
    "food",
    "technology",
  ];

  if (dropdown) {
    fetch("https://test.blockfuselabs.com/api/categories")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not OK");
        return response.json();
      })
      .then((result) => {
        const categories = result.data;

        if (Array.isArray(categories)) {
          const filtered = categories.filter((cat) =>
            allowedCategories.includes(cat.slug.toLowerCase())
          );

          if (filtered.length > 0) {
            dropdown.innerHTML = `<option value="" disabled selected>Category</option>`;

            filtered.forEach((category) => {
              const option = document.createElement("option");
              option.value = category.slug;
              option.textContent = category.name;
              dropdown.appendChild(option);
            });

            dropdown.addEventListener("change", function () {
              const selected = dropdown.value;
              if (selected) {
                // Navigate and reload page to the selected category anchor
                window.location.href = `/dist/index.html#${selected}`;
              }
            });
          } else {
            dropdown.innerHTML = `<option value="">No allowed categories found</option>`;
          }
        } else {
          dropdown.innerHTML = `<option value="">No categories available</option>`;
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        dropdown.innerHTML = `<option value="">Failed to load categories</option>`;
      });
  }
});