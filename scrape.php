<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

// logging in with cURL based on http://thisinterestsme.com/php-login-to-website-with-curl/
// this returns the DOM of the page it fetched as a string
// simple HTML DOM turns that string back into a tree that we can traverse with selectors.

require_once('simple_html_dom.php');
date_default_timezone_set('America/New_York');
$currentDay = date('m-d-Y'); // m includes leading zero, we need this for comparison later.
$tomorrow = date("m-d-Y", strtotime('tomorrow'));
$currentTime = explode(":", date('H:i'));
$currentTimeInMinutes = (intval($currentTime[0]) * 60) + intval($currentTime[1]);

// if UN and PW are set, and not equal to "test" or empty strings.
if (isset($_POST['providedUsername']) && isset($_POST['providedPassword']) && $_POST['providedUsername'] !== '' && $_POST['providedPassword'] !== '' && strtolower($_POST['providedUsername']) !== 'test' && $_POST['providedPassword'] !== 'test') {
    martaLogin();
    $html = fetchMartaPage();
} elseif (strtolower($_POST['providedUsername']) === 'test' && $_POST['providedPassword'] === 'test') { // fetch dummy data for test user Joanna M Customer
    $html = file_get_html('MARTAEXAMPLE.html');
} else { // nothing posted
  $html = file_get_html('MARTAEXAMPLE.html');
  //exit("username or password is missing!");
}

//$bookingsTable = $html->find('td[valign=top]', 4)->find('table',2)->plaintext;


$customerInfo = $html->find('div[class=portletContent even]', 0);

$bookingIDs = $html->find('td[class=tripHeader]');



/* adding the booking IDs inside a function lead to blank booking IDs...
I guess it's a scoping issue of some kind, I couldn't get my head around it so
I moved the loop back outside just to get things working again.
*/
$justBookingIDNumbers;

$i = 0;
foreach ($bookingIDs as $bookingID) {
  $bookingIDNumber = substr($bookingID->plaintext, 12);
    $justBookingIDNumbers[$i] = $bookingIDNumber;
    $arrayOfBookings[$i]["bookingID"] = $justBookingIDNumbers[$i];
    $arrayOfBookings[$i]["iteratorBookingID"] = $i;
    $i++;
}


$datesAndTimes = $html->find('td[valign=middle]');
$arrayOfBookings = datesAndTimes($arrayOfBookings, $datesAndTimes);

// this locates the "Past Trip" status, which can tell us that the bus has registered that the client was picked up.
if ($html->find('span[class=smallbold]', 0)->plaintext !== "") {
    $pastTripInDom = true;
}
$locations = $html->find('td[width=5]');
$arrayOfBookings = locations($arrayOfBookings, $locations);

$arrayOfBookings = removePastBookings($arrayOfBookings);
// so we actually CAN get the latlong, though it is buried deeply within this hidden form field.
// I will have to write a parser function. TODO
$latLongForFirstPickup = $html->find("input[name=PickUpAddress]", 1);
$latLongForFirstPickup = getLatLong($latLongForFirstPickup);
$json = [
    (object) ['clientName' => strip_tags($customerInfo->plaintext), 'bookings' => $arrayOfBookings, 'Pick Up location data' => $latLongForFirstPickup, 'Pickup Long' => $latLongForFirstPickup, 'updatedAt' => date('g:i A'), "Past trip found" => $pastTripInDom]
    ];
header('Content-type:application/json');
echo json_encode($json);

function martaLogin()
{
    define('USERNAME', $_POST['providedUsername']);
    define('PASSWORD', $_POST['providedPassword']);

    //Set a user agent. This basically tells the server that we are using Chrome ;)
    define('USER_AGENT', 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2309.372 Safari/537.36');

    //Where our cookie information will be stored (needed for authentication).
    define('COOKIE_FILE', 'cookie.txt');

    //URL of the login form.
    define('LOGIN_FORM_URL', 'http://mobility.itsmarta.com/hiwire');

    //Login action URL. Sometimes, this is the same URL as the login form.
    define('LOGIN_ACTION_URL', 'http://mobility.itsmarta.com/hiwire');

    //An associative array that represents the required form fields.
    //You will need to change the keys / index names to match the name of the form
    //fields.
    $postValues = array(
        'UN' => USERNAME,
        'PW' => PASSWORD
    );

    //Initiate cURL.
    $curl = curl_init();

    //Set the URL that we want to send our POST request to. In this
    //case, it's the action URL of the login form.
    curl_setopt($curl, CURLOPT_URL, LOGIN_ACTION_URL);

    //Tell cURL that we want to carry out a POST request.
    curl_setopt($curl, CURLOPT_POST, true);

    //Set our post fields / date (from the array above).
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($postValues));

    //We don't want any HTTPS errors.
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    //Where our cookie details are saved. This is typically required
    //for authentication, as the session ID is usually saved in the cookie file.
    curl_setopt($curl, CURLOPT_COOKIEJAR, COOKIE_FILE);

    //Sets the user agent. Some websites will attempt to block bot user agents.
    //Hence the reason I gave it a Chrome user agent.
    curl_setopt($curl, CURLOPT_USERAGENT, USER_AGENT);

    //Tells cURL to return the output once the request has been executed.
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    //Allows us to set the referer header. In this particular case, we are
    //fooling the server into thinking that we were referred by the login form.
    curl_setopt($curl, CURLOPT_REFERER, LOGIN_FORM_URL);

    //Do we want to follow any redirects?
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);

    //Execute the login request.
    curl_exec($curl);

    //Check for errors!
    if(curl_errno($curl)){
        throw new Exception(curl_error($curl));
    }
}

function fetchMartaPage()
{
    //We should be logged in by now. Let's attempt to access a password protected page
    curl_setopt($curl, CURLOPT_URL, 'http://mobility.itsmarta.com/hiwire?.a=pViewTrips&.s=8ff56be8');

    //Use the same cookie file.
    curl_setopt($curl, CURLOPT_COOKIEJAR, COOKIE_FILE);

    //Use the same user agent, just in case it is used by the server for session validation.
    curl_setopt($curl, CURLOPT_USERAGENT, USER_AGENT);

    //We don't want any HTTPS / SSL errors.
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    //Execute the GET request and print out the result.
    $html = str_get_html(curl_exec($curl));
    return $html;
}



function formatTime($time) {

    // removing the leading space on shorter times
    $time = preg_replace("/ /", "", $time);

    if (mb_strlen($time) === 4) {
        $time = "0" . $time;
        return $time;
    }

    else {
        return $time;
    }
}

function datesAndTimes($arrayOfBookings, $datesAndTimes)
{
    global $currentDay, $currentTimeInMinutes, $tomorrow;

    $i = 0;
    foreach ($datesAndTimes as $dateOrTimeNugget) {

        // nuggets are what we pull out of the DOM, all need a little different parsing.
        $nugget = $dateOrTimeNugget->plaintext;
        if (strpos($nugget, 'Ready')) {
            $eta = substr($nugget, 35, 5);
            //using the preg_replace because the time is not always 5 chars long... eg 7:05 vs 10:05. But sometimes it is, so we need to catch 5 chars anyway. And just remove the line break char if we capture it.
            $eta = preg_replace("/\r/", "", $eta);
            $eta = formatTime($eta);
            $displayEta =  date("g:i A", strtotime($eta));
            $arrayOfBookings[$i]["eta"] = $eta;
            $arrayOfBookings[$i]["displayEta"] = $displayEta;
            $arrayOfBookings[$i]["iteratorreadynugget"] = $i;
        } elseif (strpos($nugget, 'ate')) {
            $tripDate = substr($nugget, 6);
            // we need to replace the hyphens with slashes to get correct results from the strtotime function. If we don't, it returns day of the week based on European format.
            $displayDate = str_replace("-", "/", $tripDate);
            $displayDate = date("l, M j, Y", strtotime($displayDate));
            if ($tripDate === $currentDay){
                $displayDate = "Today";
            }
            if ($tripDate === $tomorrow) {
                $displayDate = "Tomorrow";
            }

            $arrayOfBookings[$i]["displayDate"] = $displayDate;
            $arrayOfBookings[$i]["date"] = $tripDate;
            $arrayOfBookings[$i]["iteratorDate"] = $i;
        } elseif (strpos($nugget, 'tart')) {
            $readyTime = formatTime(substr($nugget, 14));
            $displayReadyTime =  date("g:i A", strtotime($readyTime));
            $arrayOfBookings[$i]['readyTime'] = $readyTime;
            $arrayOfBookings[$i]["displayReadyTime"] = $displayReadyTime;
            $arrayOfBookings[$i]["iteratorreadyTime"] = $i;
        } elseif (strpos($nugget, 'nd Window')) {
            $formattedEndWindow = formatTime(substr($nugget, 12));
            $displayEndWindow =  date("g:i A", strtotime($formattedEndWindow));
            $arrayOfBookings[$i]['displayEndWindow'] = $displayEndWindow;
            $arrayOfBookings[$i]['endWindow'] = $formattedEndWindow;
        } elseif (strpos($nugget, 'Booked')) {
            // this is awlays the last in the set we are looking for, so we increment $i here.
            //this plaintext has a trailing space, so we remove it.
            $status = preg_replace("/ /", "", substr($nugget, 17));
            $arrayOfBookings[$i]["status"] = $status;
            $i++;
        }

    }
    return $arrayOfBookings;
}


function locations($arrayOfBookings, $locations)
{
  /*
  $locations is tricky - the td[width=5] is a spacer and it's only used between
  the labels "Pick-up" and "Drop-off" and the addresses... so it works as a reference point and we can grab the information from the prev_sibling and
  next_sibling. This is daft but it works.
   */

    $i = 0;
    foreach ($locations as $location) {
        if($location->prev_sibling()->plaintext === "Pick-up:"){

            $arrayOfBookings[$i]["pickupAddress"] = $location->next_sibling()->plaintext;
            $arrayOfBookings[$i]["iteratorLocation"] = $i;

        }
        elseif ($location->prev_sibling()->plaintext === "Drop-off: ") {
            $arrayOfBookings[$i]["dropOffAddress"] = $location->next_sibling()->plaintext;
            $i++;

        }
    }
    return $arrayOfBookings;
}

function removePastBookings($arrayOfBookings)
{
    global $currentDay, $currentTimeInMinutes;

/*
loop through $arrayOfBookings and find ones where date is today, and if the ETA
is more than an hour old, remove the trip from the list.
 */
    foreach ($arrayOfBookings as &$booking) {

        $bookingEta = explode(":", $booking["eta"]);
        $bookingEtaInMinutes = (intval($bookingEta[0]) * 60) + intval($bookingEta[1]);
        $endWindowInMinutesArr = explode(":", $booking["endWindow"]);
        $booking["endWindowInMinutes"] = (intval($endWindowInMinutesArr[0]) * 60) + intval($endWindowInMinutesArr[1]);
        $booking["delayInMinutes"] = 30 - ($booking["endWindowInMinutes"] - $bookingEtaInMinutes);
        $booking["currentDay"] = $currentDay;
        $booking["currentTimeInMinutes"] = $currentTimeInMinutes;
        $booking["etaInMinutes"] = $bookingEtaInMinutes;
        $booking["math"] = ($bookingEtaInMinutes + 60) < $currentTimeInMinutes;
        $booking["delayInMinutesDescription"] = getDelayInMinutesDescription($booking["delayInMinutes"]);
        $booking["statusDescription"] = getStatusDescription($booking["delayInMinutes"]);

        if ($booking["date"] === $currentDay && (($bookingEtaInMinutes + 60) < $currentTimeInMinutes)) {

            array_shift($arrayOfBookings);

        }



    }
    return $arrayOfBookings;
}


function getStatusDescription($delay){
  if ($delay > 30) {
    return ", running late.";
  } elseif ($delay < 30) {
    return ", arriving in window.";
  } else {
    return ", arriving on time.";
  }
}

function getDelayInMinutesDescription($delay)
{
  if ($delay > 1) {
    return "$delay minutes after Ready Time.";
  } elseif ($delay == 1) {
    return "$delay minute after Ready Time.";
  } elseif ($delay < -1) {
    return "abs($delay) minutes before Ready Time.";
  } elseif ($delay == -1) {
    return "abs($delay) minute before Ready Time.";
  } elseif ($delay < 0) {
    return "right on time.";
  }
}



function getLatLong($latLong)
{
    $latLong = $latLong->value;
    $latLong = explode(";", $latLong);
    $firstPickupLong = substr($latLong[2], 2);
    return $firstPickupLong;
}
?>
