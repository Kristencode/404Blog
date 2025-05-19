document.addEventListener("DOMContentLoaded", function () {
  // MENU TOGGLE
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  document
    .querySelector('label[for="menu-toggle"]')
    .addEventListener("click", function () {
      menuToggle.checked = !menuToggle.checked;
      if (menuToggle.checked) {
        mobileMenu.classList.toggle("hidden");
      }
    });

  // REGISTER FORM
  const formCon = document.querySelector("#regForm");
  const plus = document.querySelector("#plus");
  const submitBtn = document.querySelector("#submit");

  if (formCon) {
    formCon.addEventListener("submit", function (e) {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.innerText = "Registering...";

      const newFormObj = new FormData(formCon);
      const data = {
        name: newFormObj.get("name"),
        email: newFormObj.get("email"),
        password: newFormObj.get("password"),
        team: newFormObj.get("team"),
      };

      function showMessage(msg, color) {
        plus.innerText = msg;
        plus.style.color = color;
        plus.style.fontWeight = "bold";
        plus.style.marginTop = "10px";
      }

      function resetButton() {
        submitBtn.disabled = false;
        submitBtn.innerText = "Register";
      }

      if (!data.name || !data.email || !data.password || !data.team) {
        showMessage("Please fill in all fields.", "red");
        resetButton();
        return;
      }

      if (data.password.length < 8) {
        showMessage("Password must be at least 8 characters long.", "red");
        resetButton();
        return;
      }

      fetch("https://test.blockfuselabs.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async function (res) {
          const text = await res.text();
          let json;
          try {
            json = JSON.parse(text);
          } catch (e) {
            throw new Error("Server returned an invalid response.");
          }
          if (!res.ok) {
            throw new Error(json.error || "Registration failed");
          }
          return json;
        })
        .then(function () {
          showMessage("Registration successful", "green");
          formCon.reset();
          setTimeout(function () {
            window.location.href = "/dist/login.html";
          }, 1000);
        })
        .catch(function (err) {
          if (err.message.toLowerCase().includes("email")) {
            showMessage(
              "This email is already registered. Please log in or use another email.",
              "red"
            );
          } else {
            showMessage(err.message, "red");
          }
          resetButton();
        });
    });
  }

  // LOGIN FORM
  const loginForm = document.querySelector("form");
  const message = document.getElementById("message");

  if (loginForm && message) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = loginForm.elements["email"].value.trim();
      const password = loginForm.elements["password"].value.trim();

      if (!email || !password) {
        message.innerText = "Please enter both email and password.";
        message.style.color = "red";
        return;
      }

      const data = { email, password };
      message.innerText = "Logging in...";
      message.style.color = "gray";

      fetch("https://test.blockfuselabs.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async function (res) {
          const text = await res.text();
          let json;
          try {
            json = JSON.parse(text);
          } catch (e) {
            throw new Error("Server returned an invalid response.");
          }
          if (!res.ok) {
            throw new Error(json.error || "Login failed");
          }
          return json;
        })
        .then(function (data) {
          message.innerText = `Welcome back, ${data.user?.name || "User"}!`;
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
