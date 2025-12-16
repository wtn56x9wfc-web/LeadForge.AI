<script>
(function () {
  const ACCESS_KEY = "forgealpha";
  const FLAG = "gf_unlocked_v1";

  if (localStorage.getItem(FLAG) === "1") return;

  const entered = prompt("Access key required:");

  if (!entered || entered.trim() !== ACCESS_KEY) {
    alert("Access denied.");
    location.replace("https://google.com");
    return;
  }

  localStorage.setItem(FLAG, "1");
})();
</script>
