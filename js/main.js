var creds;

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");

var spreadsheetId = "1_jHbct1lB_QgbVODodlpxyDE4Y3CrPzvFwLL9lS56jo";
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  $.getJSON("js/credentials.json", function (json) {
    creds = json;
    console.log(creds);
    loadGapi();
  });
}

function loadGapi() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  // Client ID and API key from the Developer Console
  var CLIENT_ID = creds.client_id;
  var API_KEY = creds.api_key;

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
  ];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function appendSection(title, name, description) {
  clone = document.querySelector("template#section").content.cloneNode(true);
  clone.getElementById("title").textContent = title;
  clone.getElementById("name").textContent = name;
  clone.getElementById("description").textContent = description;
  document.querySelector("#npc-attributes tbody").appendChild(clone);
}

/**
edit https://docs.google.com/spreadsheets/d/1_jHbct1lB_QgbVODodlpxyDE4Y3CrPzvFwLL9lS56jo/ for additional tables to roll on
 */
function getNpcAttribute(tabName, range) {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: tabName + "!A1:B",
    })
    .then(
      function (response) {
        var range = response.result;
        var randomNumber = Math.floor(Math.random() * range.values.length) + 1;
        if (range.values.length > 0) {
          appendSection(tabName, range.values[randomNumber][0], range.values[randomNumber][1]);
        } else {
          appendPre(preId, "No data found.");
        }
      },
      function (response) {
        appendPre(preId, "Error: " + response.result.error.message);
      }
    );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    getNpcAttribute("Talent");
    getNpcAttribute("Quirk");
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}
