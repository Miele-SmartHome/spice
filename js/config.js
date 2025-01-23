/**
 * Copyright 2025 Miele Cie. KG, MIT
 */

(function () {
  // base data retrieval
  var vendor = window.eesim.data.vendorName;
  if (vendor !== "") {
    var element = document.getElementById("vendor_name");
    element.value = vendor;
    element.readOnly = true;
  }

  var url = window.eesim.data.url;
  if (url !== "") {
    var element = document.getElementById("oauth_url");
    element.value = url;
    element.readOnly = true;
  }

  var client_id = window.eesim.data.client_id;
  if (client_id !== "") {
    var element = document.getElementById("client_id");
    element.value = client_id;
    element.readOnly = true;
  }

  var client_secret = window.eesim.data.client_secret;
  if (client_secret !== "") {
    var element = document.getElementById("client_secret");
    element.value = client_secret;
    element.readOnly = true;
  }

  var redirect_uri = window.eesim.data.redirect_uri;
  if (redirect_uri !== "") {
    var element = document.getElementById("redirect_url");
    element.value = redirect_uri;
    element.readOnly = true;
  }

  window.eesim.checkTokenState();

  // OAuth2 flow
  document
    .getElementById("initiateOAuth")
    .addEventListener("click", function () {
      let url = document.getElementById("oauth_url").value;
      let client_id = document.getElementById("client_id").value;
      let redirect_uri = document.getElementById("redirect_url").value;

      var state = window.eesim.generateState();
      var path = "/thirdparty/login";
      localStorage.setItem("state", state);

      window.eesim.addDebugMessage("OAuth2: state created " + state);
      window.eesim.addDebugMessage("OAuth2: opening user window");
      window.eesim.addDebugMessage(
        "GET " +
          url +
          "?response_type=code" +
          "&client_id=" +
          client_id +
          "&redirect_uri=" +
          redirect_uri +
          "&state=" +
          state,
        true
      );
      window.open(
        url +
          path +
          "?response_type=code" +
          "&client_id=" +
          client_id +
          "&redirect_uri=" +
          redirect_uri +
          "&state=" +
          state,
        "eebusoauth",
        "width=600,height=500,popup=true"
      );
    });

  // storage listener
  window.addEventListener("storage", function (event) {
    let url = document.getElementById("oauth_url").value;
    let client_id = document.getElementById("client_id").value;
    let client_secret = document.getElementById("client_secret").value;
    let redirect_uri = document.getElementById("redirect_url").value;
    let vendor = document.getElementById("vendor_name").value;

    if (event.key !== "code") {
      return;
    }

    window.eesim.addDebugMessage("OAuth2: state is correct");
    window.eesim.addDebugMessage(
      "OAuth2: received access token " + localStorage.getItem("code")
    );
    localStorage.removeItem("state");
    window.eesim.addDebugMessage("OAuth2: state removed", true);

    var fullUrl =
      url +
      "/thirdparty/token" +
      "?client_id=" +
      client_id +
      "&client_secret=" +
      client_secret +
      "&code=" +
      localStorage.getItem("code") +
      "&redirect_uri=" +
      redirect_uri +
      "&state=token" +
      "&grant_type=authorization_code";
    window.eesim.addDebugMessage("POST " + fullUrl);
    axios
      .post(
        fullUrl,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then(function (response) {
        window.eesim.addDebugMessage(
          "OAuth2: received access token -> " + response.data.access_token
        );
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("vendor", vendor);
        localStorage.removeItem("code");
        window.eesim.addDebugMessage("OAuth2: code removed", true);
        window.eesim.checkTokenState();
      })
      .catch(function (error) {
        window.eesim.addDebugMessage("error while fetching access token", true);
        console.error(error);
      });
  });
})();
