/**
 * Copyright 2025 Miele Cie. KG, MIT
 */

(function () {
  var localState = localStorage.getItem("state");
  var urlState = new URLSearchParams(window.location.search).get("state");

  if (localState === urlState) {
    var code = new URLSearchParams(window.location.search).get("code");
    localStorage.setItem("code", code);
    document.getElementById("successnote").classList.remove("hidden");

    window.setTimeout(function () {
      window.close();
    }, 5000);
  } else {
    document.getElementById("errornote").classList.remove("hidden");
  }
})();
