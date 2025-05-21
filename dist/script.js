document.addEventListener("DOMContentLoaded", function () {
  // MENU TOGGLE
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

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

  if (form && submitBtn) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("fullName").value.trim();
      var email = document.getElementById("email").value.trim();
      var password = document.getElementById("password1").value.trim();
      var team = document.getElementById("teamName").value.trim();

      if (!name || !email || !password || !team) {
        responseMessage.textContent = "⚠️ Please fill in all fields.";
        responseMessage.className = "text-red-600 text-sm text-center";
        return;
      }

      if (password.length < 8) {
        responseMessage.textContent =
          "⚠️ Password must be at least 8 characters.";
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
              "✅ " + result.body.user.name + ", registration successful!";
            responseMessage.className = "text-green-600 text-sm text-center";
            form.reset();
          } else {
            responseMessage.textContent =
              "❌ " + (result.body.message || "Registration failed");
            responseMessage.className = "text-red-600 text-sm text-center";
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
          responseMessage.textContent = "❌ Network error. Try again.";
          responseMessage.className = "text-red-600 text-sm text-center";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Register";
        });
    });
  }

  // LOGIN FORM
  var loginForm = document.querySelector("form");
  var message = document.getElementById("message");

  if (loginForm && message) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = loginForm.elements["email"].value.trim();
      var password = loginForm.elements["password"].value.trim();

      if (!email || !password) {
        message.innerText = "Please enter both email and password.";
        message.style.color = "red";
        return;
      }

      var data = { email: email, password: password };
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
});
