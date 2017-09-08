(function mobETA() {
  var etaColors = {
    yellow: "#EFE455",
    green: "#8AB755",
    red: "#FC7455",
    blue: "#00BBE5",
    orange: "#F79044"
  }

  var martaResponse = {};
  var bookings = [];
  var clientName = "";
  var loginDetails = [];

  (function init() {
    addLogInScreen();
    addLogInListeners();
  })();

  function showInfo(username, password) {
    showSpinner();
    loginDetails = [username, password];
    getTrips(username, password);
  }

  function addLogInScreen() {
    document.querySelector("#mobility-eta").innerHTML =
      '<div class="form-wrapper" style="text-align:center; margin-top: 20px; margin-bottom: 40px;"><form class="" id="unpw-form" method="post"> <h1 style="margin-bottom: 40px;"> Log In </h1> <input type="text" name="providedUsername" value="" placeholder="Client ID" style="font-size:18px; padding: 3px"> <br><br> <input type="password" name="providedPassword" id="pw" value="" placeholder="Password" style="font-size:18px; padding: 3px"> <br><br><br> </form> <button type="button" id="login" style="background-color: #333; border: 2px solid #333; color: #fff; display: inline-block; font-size: 14px; font-weight: 700; line-height: 1.2; padding: 11px 20px; position: relative; cursor: pointer;">Check My Trips</button><div id="output"><br><span style="color:' + etaColors.red + '">WARNING: This is site is in a pilot mode. Some errors may still exist. If trip information is unclear or looks wrong, you may confirm with MARTA Mobility ETA by phone: 404-848-4212.</span><br><br> If you do not know your Client ID or Password, you can call Reservations at (404) 848-5826.<br><br> For a demo, enter username <b>test</b> and password <b>test</b>. Contact markthomasnoonan@gmail.com with questions or feedback. </div></div> </div>'
  }

  function addTryAgainScreen() {
    document.querySelector("#mobility-eta").innerHTML =
      '<div class="form-wrapper" style="text-align:center; margin-top: 20px; margin-bottom: 40px;"><form class="" id="unpw-form" method="post"> <h1 style="margin-bottom: 40px;"> Log In </h1> <p style="color:' + etaColors.red + '">Username or Password was not found, please try again:</p><input type="text" name="providedUsername" value="" placeholder="Client ID" style="font-size:18px; padding: 3px"> <br><br> <input type="password" name="providedPassword" id="pw" value="" placeholder="Password" style="font-size:18px; padding: 3px"> <br><br><br> </form> <button type="button" id="login" style="background-color: #333; border: 2px solid #333; color: #fff; display: inline-block; font-size: 14px; font-weight: 700; line-height: 1.2; padding: 11px 20px; position: relative; cursor: pointer;">Check My Trips</button><div id="output"><br><span style="color:' + etaColors.red + '">WARNING: This is site is in a pilot mode. Some errors may still exist. If trip information is unclear or looks wrong, you may confirm with MARTA Mobility ETA by phone: 404-848-4212.</span><br><br> If you do not know your Client ID or Password, you can call Reservations at (404) 848-5826.<br><br> For a demo, enter username <b>test</b> and password <b>test</b>. Contact markthomasnoonan@gmail.com with questions or feedback. </div></div> </div>'
  }

  function addLogInListeners() {
    var usernameInput =
      document.querySelector('input[name=providedUsername]');
    var passwordInput = document.querySelector('input[name=providedPassword]');

    document.querySelector('#login').addEventListener('click', function() {
      var username = usernameInput.value;
      var password = passwordInput.value;
      showInfo(username, password);
    });

    document.querySelector('#pw').addEventListener('keyup', function(event) {
      if (event.keyCode == 13) {
        var username = usernameInput.value;
        var password = passwordInput.value;
        showInfo(username, password);
      }
    });
  }

  function addRefreshListener() {
    var refreshButton = document.querySelector("#refresh-button");
    refreshButton.addEventListener("click", function(){
      showInfo(loginDetails[0], loginDetails[1]);
    });
  }

  function getTrips(username, password) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', "scrape.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function() {
        if (xhr.readyState == 4 && xhr.status === 200) {
          resolve(handleMartaData(xhr.responseText));
        } else {
          reject(Error('Request failed, status was ' + xhr.statusText));
        }
      };
      xhr.send("providedUsername=" + username + "&providedPassword=" + password);
    });
  }

  function handleMartaData(xhrResponse) {

    var proceed = true;
    try {
      martaResponse = JSON.parse(xhrResponse);
      if (!martaResponse[0].clientName) {
        throw new Error("no client found");
      }
    } catch (err) {
      console.log("error: " + err);
      proceed = false;
    }
    if (proceed) {
      bookings = martaResponse[0].bookings;
      clientName = martaResponse[0].clientName;
      checkedTime = martaResponse[0].updatedAt;
      showTrips();
      setMarkers();
      addRefreshListener();
    } else {
      addTryAgainScreen();
      addLogInListeners();
    }
  }


  function showTrips() {
    var htmlBuffer =
      '<div class="bookings-wrapper" style="display: inline-block;font-size: 14px;text-align: center;font-family: sans-serif;"><div class="client-info text-align-center"> Hi, <b>' +
      clientName + '!</b> </div><br><h1>Your Bookings</h1><div style="margin-top: 5px">Checked at ' + checkedTime + '. <input type="button" id="refresh-button" value="Refresh" style="background-color: #333;border: 2px solid #333;color: #fff;display: inline-block;font-size: 14px;font-weight: 700;line-height: 1.2;padding: 3px 10px;position: relative; cursor: pointer"></input></div>';

if (bookings.length) {
  bookings.forEach(function(booking, i) {
    htmlBuffer +=
      '<div class="booking plan-a-trip-box" style="box-shadow: 0 0 3px 2px rgba(200,200,200,0.7); border-radius: 4px; margin: 10px; padding: 0 10px 10px 8px; padding-bottom: 6px; width: 310px; text-align: center; display:inline-block;" id="booking' + i + '"> <div class="date-and-id" id="date-and-id"> <span class="display-date"><h2 style="border:0; margin-bottom: 4px; margin-top: 12px"><b>' +
      booking.displayDate + '</b></h2></span><span><b>Booking ID</b>: ' + booking.bookingID +
      '</span> | <span><b>Ready Time</b>: ' + booking.displayReadyTime +
      '</span></div><hr style="border: 1px solid #fff;"><div class="booking-status" style="margin-top: 8px; margin-bottom: 7px;"><span style="font-weight:bold; font-size: 16px;">Trip Status</span><br> <span class="late-status" style="color:' +
      etaColors[booking.statusColor] + '">' + booking.status + (booking.statusDescription || "") + '</span></div>' +
      '<div class="progress-wrapper' + i + '" style="display: none;font-size: 12px; "> <div class="labels" style="padding-top: 3px; text-align: left; line-height: 1.2; margin-left: -6px;"> <div class="label left" style="width: auto;text-align: left;display: inline-block;padding: 0;"> <span class="tool-tip" style="background-color: #fff;color: #000;border-radius: 3px;display: inline-block;padding: 3px;margin-bottom: -2px;"><b>Start Window</b><br>' +
      booking.displayReadyTime +
      '</span><div class="down-arrow" style=" position: relative; height: 10px; width: 10px; background-color: #fff; transform: translate(6px, -3px) rotate(45deg); "></div></div> <div class="label center" style="width: auto;text-align: left;display: inline-block;transform: translateX(45px);padding: 0"><span class="tool-tip" style="background-color: #fff;color: #000;border-radius: 3px;display: inline-block;padding: 3px;margin-bottom: -2px;"><b>End Window</b><br>' +
      booking.displayEndWindow +
      '</span><div class="down-arrow" style=" position: relative; height: 10px; width: 10px; background-color: #fff; transform: translate(6px, -3px) rotate(45deg); "></div></div></div> <div class="outer" style="text-align: left; width: 240px; background-color: #111; border-radius: 10px; overflow: hidden;"> <div class="inner" style="height: 26px; background-color: #595; background: linear-gradient(to right, #595 0%, #ee5 50%, #f55 80%);"> <span class="eta label" style="position: relative;display: inline-block;box-sizing: border-box;height: 100%;padding-top: 5px;text-align: left;transform: translateY(-5px);" aria-hidden="true"><img src="assets/bus.png" id="martabus' + i + '" style="height: 26px; display: inline; padding: 0 5px 0 0" alt=""/></span> </div> </div> <div class="eta-tooltip' + i + '" style="width: auto;text-align: left; position:absolute; margin-top: 4px"><div class="up-arrow" style=" position: relative; height: 10px; width: 10px; background-color: #fff; transform: translate(4px, 0px) rotate(45deg); "></div><span class="tool-tip" style="background-color: #fff;color: #000;border-radius: 3px;display: inline-block;padding: 3px;transform: translateY(-6px); line-height:1.2"><b>Your ETA</b><br>' + (booking.displayEta || "No ETA yet") + '</span></div></div>';

    if (booking.status === "Scheduled") {
      htmlBuffer += '<span class="eta-wrapper" style="margin-top: 44px; display: inline-block; font-size: 14px; line-height: 1.3">Bus expected at <b>' + (booking.displayEta || "No ETA yet") + '</b>,<br>' + (booking.delayInMinutesDescription || "") + '</span>';
    }

    htmlBuffer += '<div class="ready-time-gage" style="text-align: left"><hr style="border: 1px solid #fff;"><div><b>Pick Up</b><Br>' + booking.pickupAddress +
      '<br><Br><b>Drop Off</b><br>' + booking.dropOffAddress +
      '</div><br>' + '</div></div><br>';
  });
} else {
  htmlBuffer += "<span>No bookings found</span>";
}

    htmlBuffer += "</div>";
    document.querySelector('#mobility-eta').innerHTML = htmlBuffer;

  }

  function setMarkers() {

    var potentialActiveTrips = [];

    bookings.forEach(function(booking, i) {
      if (booking.status === "Scheduled") {
        setMarker(booking);
      }

      if (booking.date === booking.currentDay && (booking.etaInMinutes + 60) > booking.currentTimeInMinutes) {
        potentialActiveTrips.push(i);
      }

      function setMarker(booking) {
        var marker = document.querySelector("#martabus" + i);
        var tooltip = document.querySelector(".eta-tooltip" + i);
        var progressWrapper = document.querySelector(".progress-wrapper" + i);
        var lateMins = booking.delayInMinutes;
        var markerPixels = lateMins * 4;
        var markerDistance = markerPixels;
        var tooltipMargin = 0;
        var remainingDistance = 0;
        var borderStyle = " solid rgba(100,100,100,0.5)";

        // to account for being very late.
        if (markerDistance < 234) {
          markerDistance += "px";
          remainingDistance = (240 - markerPixels - 28) + "px";
        } else {
          markerDistance = "220" + "px";
        }

        //to manage marker boundaries
        if (markerPixels < -16) {
          tooltipMargin = "-16px";
        } else if (markerPixels > 215) {
          tooltipMargin = "216px";
        } else {
          tooltipMargin = (markerPixels - 8) + "px";
        }

        // position everything
        marker.style.borderLeft = markerDistance + borderStyle;
        marker.style.borderRight = remainingDistance + borderStyle;
        tooltip.style.marginLeft = tooltipMargin;
        progressWrapper.style.display = "inline-block";
      }
    });

    var bookingPanel = document.querySelector("#booking" + potentialActiveTrips[0])
    bookingPanel.style.boxShadow = "0 0 0 3px #00BBE5";
    bookingPanel.querySelector("h2").innerHTML += " (Your Next Trip)";

  }

  function showSpinner() {
    var spinner = '<style>@-webkit-keyframes sweep { to { -webkit-transform: rotate(360deg); } }</style><div id="spinner" style="width: 50px; height: 50px; -webkit-animation: sweep 1s infinite linear; border-radius: 75px; border-bottom: 5px solid #00bbe5; margin: 50px auto"></div><div style="margin: 20px auto; display: inline-block">Loading your trips...</div>'
    document.querySelector("#mobility-eta").innerHTML = spinner;
  }
})();
