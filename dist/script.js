document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function menuHam(e) {
    e.name = e.name === "menu-outline" ? "close-outline" : "menu-outline";
  }

  document
    .querySelector('label[for="menu-toggle"]')
    .addEventListener("click", function () {
      menuToggle.checked = !menuToggle.checked;

      if (menuToggle.checked) {
        mobileMenu.classList.toggle("hidden");
      }
    });

  let formCon = document.querySelector("#regForm");
  let plus = document.querySelector("#plus");
  let submitBtn = document.querySelector("#submit");

  formCon.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = "Registering...";

    let newFormOBj = new FormData(formCon);

    let data = {
      name: newFormOBj.get("name"),
      email: newFormOBj.get("email"),
      password: newFormOBj.get("password"),
      team: newFormOBj.get("team"),
    };

    // checks if input field is empty

    if (!data.name || !data.email || !data.password || !data.team) {
      showMessage("Please fill in all fields.", "red");
      resetButton();
      return;
    }

    // checks if password is less than 8

    if (data.password.length < 8) {
      showMessage("Password must be at least 8 characters long.", "red");
      resetButton();
      return;
    }

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

    // api starts here

    fetch("https://test.blockfuselabs.com/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        return res.text().then(function (text) {
          let json;

          try {
            json = JSON.parse(text);
          } catch (e) {
            // If response is HTML or not JSON, show error
            throw new Error("Server returned an invalid response.");
          }

          if (!res.ok) {
            // Error message from server
            throw new Error(json.error || "Registration failed");
          }

          return json; // Success
        });
      })
      .then(function (data) {
        plus.innerText = ` Registration successful`;
        plus.style.color = "green";
        formCon.reset();

        setTimeout(function () {
          window.location.href = "/dist/login.html";
        }, 1000);
      })
      .catch(function (err) {
        if (err.message.toLowerCase().includes("email")) {
          plus.innerText =
            "This email is already registered. Please log in or use another email.";
        } else {
          plus.innerText = err.message;
        }

        plus.style.color = "red";
        resetButton();
      });
  });
});

fetch("https://test.blockfuselabs.com/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data), // data should have { email, password }
})
  .then(function (res) {
    return res.text().then(function (text) {
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
    });
  })
  .then(function (data) {
    plus.innerText = `Welcome back, ${data.user?.name || "User"}!`;
    plus.style.color = "green";

    // Store token if provided
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    formCon.reset();

    setTimeout(function () {
      window.location.href = "/dist/index.html"; // change to your desired page
    }, 1000);
  })
  .catch(function (err) {
    if (
      err.message.toLowerCase().includes("invalid") ||
      err.message.toLowerCase().includes("email") ||
      err.message.toLowerCase().includes("credentials")
    ) {
      plus.innerText = "Invalid email or password. Please try again.";
    } else {
      plus.innerText = err.message;
    }

    plus.style.color = "red";
    resetButton(); // re-enable button, etc.
  });

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const emailInput = form.querySelector("input[name='email']");
  const passwordInput = form.querySelector("input[name='password']");
  const submitBtn = document.getElementById("submit");

  // Optional: create a message display element
  const message = document.createElement("p");
  message.id = "plus";
  message.className = "text-center text-sm mt-2";
  form.appendChild(message);

  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.innerText = "Login";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerText = "Logging in...";

    const data = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    fetch("https://test.blockfuselabs.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        return res.text().then(function (text) {
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
        });
      })
      .then(function (data) {
        message.innerText = `Welcome back, ${data.user?.name || "User"}!`;
        message.style.color = "green";
        form.reset();

        // Save user info and token to localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }

        setTimeout(function () {
          window.location.href = "/dist/index.html"; // or wherever you want to redirect
        }, 1000);
      });
  });
});
