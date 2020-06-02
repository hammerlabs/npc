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

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(id, message) {
  var pre = document.getElementById(id);
  var textContent = document.createTextNode(message + "\n");
  pre.appendChild(textContent);
}

function getNpcAttribute(preId, tabName, range) {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: tabName+"!A1:A",
    })
    .then(
      function (response) {
        var range = response.result;
        var randomNumber = Math.floor(Math.random() * range.values.length) + 1;
        if (range.values.length > 0) {
          appendPre(preId, tabName+": " + range.values[randomNumber][0]);
        //   for (i = 0; i < range.values.length; i++) {
        //     var row = range.values[i];
        //     // Print columns A and E, which correspond to indices 0 and 4.
        //     appendPre(row[0]);
        //   }
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
    getNpcAttribute("npc-talent", "Talent");
    getNpcAttribute("npc-quirk", "Quirk");
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}
