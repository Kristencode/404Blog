
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");

  if (btn && menu) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }

 let formCon = document.querySelector("#regForm");
 let plus = document.querySelector("#plus");

 formCon.addEventListener("submit", function (e) {
   e.preventDefault();

   let newFormOBj = new FormData(formCon);

   let data = {
     name: newFormOBj.get("name"),
     email: newFormOBj.get("email"),
     password: newFormOBj.get("password"),
     team: newFormOBj.get("team"),
   };

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
       plus.innerText = "Registration successful";
       plus.style.color = "green";
       formCon.reset(); 
     })
     .catch(function (err) {
       console.error(err);
       plus.innerText = "Registration failed";
       plus.style.color = "red";
     });
 });


});




