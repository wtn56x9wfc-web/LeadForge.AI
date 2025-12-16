// auth.js
(function () {
  const ACCESS_KEY = "forgealpha";
  const FLAG = "gf_auth_ok";

  if (localStorage.getItem(FLAG) === "1") return;

  const entered = prompt("Access key:");
  if (!entered || entered.trim() !== ACCESS_KEY) {
    document.body.innerHTML = "";
    throw new Error("blocked");
  }

  localStorage.setItem(FLAG, "1");
})();
