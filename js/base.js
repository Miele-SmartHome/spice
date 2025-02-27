/**
 * Copyright 2025 Miele Cie. KG, MIT
 */

(function () {
  document.getElementById("clearls").addEventListener("click", function () {
    window.eesim.addDebugMessage("OAuth2: removing auth tokens and devices");
    localStorage.clear();
    window.eesim.checkTokenState();
  });

  function addDebugMessage(message, marker) {
    const debugTextarea = document.getElementById("debug-messages");
    debugTextarea.value += message + "\n";

    if (marker) {
      debugTextarea.value += "----------------------- \n";
      debugTextarea.scrollTop = debugTextarea.scrollHeight;
    }
  }

  function addFormattedDebugMessage(message, marker = true) {
    if (message === "") {
      addDebugMessage("Empty Response", marker);
      return;
    }
    addDebugMessage(JSON.stringify(message, null, 2), marker);
  }

  function generateState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  function checkTokenState() {
    var withIcons = document.getElementById("oauth_state_conn") ? true : false;
    var access_token = localStorage.getItem("access_token");
    var refresh_token = localStorage.getItem("refresh_token");

    if (access_token && refresh_token) {
      window.eesim.addDebugMessage("OAuth2: Connected");
      if (withIcons) {
        markIcons(true);
      }
    } else {
      window.eesim.addDebugMessage("OAuth2: Disconnected");
      if (withIcons) {
        markIcons(false);
      }
      let buttons = document.getElementsByClassName("oauth-action");
      for (let button of buttons) {
        button.disabled = true;
      } // disable all buttons
    }
  }

  function markIcons(state) {
    if (state) {
      document.getElementById("oauth_state_conn").innerText = "Connected";
      document
        .getElementById("oauth_state_icon")
        .classList.add("stroke-green-600");
    } else {
      document.getElementById("oauth_state_conn").innerText = "Disconnected";
      document
        .getElementById("oauth_state_icon")
        .classList.remove("stroke-green-600");
    }
  }

  function sendRequest(type, path, payload, successCallback, errorCallback) {
    window.eesim.addDebugMessage(type + " " + path);

    axios
      .request({
        method: type,
        url: path,
        data: payload || {},
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
          "Content-Type": "application/json",
        },
      })
      .then(function (response) {
        if (successCallback) {
          successCallback(response.data);
        }
      })
      .catch(function (error) {
        if (errorCallback) {
          errorCallback(error);
        }
        console.error(error);
      });
  }

  window.eesim = window.eesim || {};
  window.eesim.data = window.eesim.data || {};

  // expose functions
  window.eesim.addDebugMessage = addDebugMessage;
  window.eesim.addFormattedDebugMessage = addFormattedDebugMessage;
  window.eesim.generateState = generateState;
  window.eesim.checkTokenState = checkTokenState;
  window.eesim.markIcons = markIcons;
  window.eesim.sendRequest = sendRequest;

  // Fill these values below with your own data.
  // - "Optional" values: These will pre-populate the form fields for the OAuth2 Configuration.
  //   If you leave them empty, you need to supply the data directly in the form.
  // - URLs must not have a trailing slash.
  // - SPINE API URL must have the version included, e.g. https://mycompany.com/api/v1

  window.eesim.data.vendorName = ""; // Vendor Name (Optional)
  // OAuth2 data
  window.eesim.data.url = ""; // OAuth2 URL (Optional)
  window.eesim.data.client_id = ""; // OAuth2 Client ID (Optional)
  window.eesim.data.client_secret = ""; // OAuth2 Client Secret (Optional)
  window.eesim.data.redirect_uri = window.location.origin + "/target.html"; // OAuth2 Redirect URI (MANDATORY)
  // API data
  window.eesim.data.apiurl = ""; // SPINE API URL (MANDATORY)
})();
