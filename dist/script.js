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
        showMessage("Please fill in all fields.", "orange");
        resetButton();
        return;
      }


      // checks if password is less than 8

       if (data.password.length < 8) {
         showMessage("Password must be at least 6 characters long.", "orange");
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
        return res.json();
      })
      .then(function (data) {
        console.log(data);
        plus.innerText = ` ${data.name} Registration successful`;
        plus.style.color = "green";
        formCon.reset();
        window.location.href = "http://127.0.0.1:5503/dist/login.html";
      })
      .catch(function (err) {
        console.error(err);
        plus.innerText = "Registration failed";
        plus.style.color = "red";
      });
  });
});
