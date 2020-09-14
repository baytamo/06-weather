$(document).ready(function () {
  let $searchBar = $("#searchBar");
  let $searchButton = $(".searchButton");
  let $searchResults = $(".searchResults");
  let $numberDate = $(".numberDate");
  let $todayWeather = $(".todayWeather");
  let $todayStats = $(".todayStats");
  let $todayAQI = $(".todayAQI");
  let $nextFive = $(".nextFive");
  let citySearch;
  let cityArray = [];
  let getCities = JSON.parse(localStorage.getItem("cities"));
  let latitude;
  let longitude;

  let apiKey = "308a7a0c0f1f0560d6bd1b9fd0cf597d";

  cityColumn();

  // check first for local storage; populate with search results and widgets if it is available
  function cityColumn() {
    if (getCities) {
      cityArray = getCities;
      todaysWeather();
      forecast();
      for (let i = 0; i < cityArray.length; i++) {
        let savedCity = $("<p>").text(cityArray[i]).attr("id", "city" + i);
        let trash = $("<img/>").attr("src", "Assets/trash.png").css("width", "26px").addClass("trash");
        trash.data('index', i);
        savedCity.append(trash);
        savedCity.addClass("cityListItem");
        $searchResults.prepend(savedCity);
      }
    }
  }

  // on click for cities listed in left column
  $(".cityListItem").on("click", function (event) {
    event.stopPropagation();
    $(".cityListItem").data("clicked", true);
    todaysWeather();
    forecast();
  });

  // on click so that user can delete a search result
  $(".trash").on("click", function(event) {
    event.stopPropagation();
    let trashIcon = $(event.target);
    let index = trashIcon.data('index');
    cityArray.splice(index, 1);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    $('#' + trashIcon.parent().attr("id")).remove();
    location.reload();
  });


  // on click for search button
  $searchButton.on("click", function (event) {
    if (!$searchBar.val()) {
      return;
    }
    todaysWeather();
    forecast();
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    location.reload();
  });

  // on submit for search input
  $("form").on("submit", function (event) {
    if (!$searchBar.val()) {
      return;
    }
    todaysWeather();
    forecast();
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
  });

  // display today's weather details
  function todaysWeather() {
    $todayWeather.empty();
    $todayStats.empty();
    $todayAQI.empty();

    getCities = JSON.parse(localStorage.getItem("cities"));

    // if search bar is populated, use this value
    if ($searchBar.val()) {
      citySearch = $.trim($searchBar.val());
      // if city in left column has been clicked, use this value
    } else if ($(".cityListItem").data("clicked")) {
      citySearch = $(event.target).text();
      // if localStorage exists, use this value upon refresh
    } else if (
      getCities &&
      !$searchBar.val() &&
      !$(".cityListItem").data("clicked")
    ) {
      let mostRecentCity = getCities[getCities.length - 1];
      citySearch = mostRecentCity;
    }

    // this boolean works, but database is buggy because it is getting other countries instead of american cities
    // if ($.isNumeric($.trim($searchBar.val()))) {
    //   let ZIP = ($.trim($searchBar.val()));
    //   URL = "https://api.openweathermap.org/data/2.5/weather?zip=" + ZIP + ",us"
    //   "&appid=" + apiKey + "&units=imperial";
    // } else { put below URL here }

    let URL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      citySearch +
      "&appid=" +
      apiKey +
      "&units=imperial";

    $.ajax({
      url: URL,
      method: "GET",
    }).then(function (response) {
      let city = $("<p>").addClass("city");
      city.text(response.name + ", " + response.sys.country);
      if (response.sys.country == undefined) {
        city.text(response.name);
      }

      let description = $("<p>").addClass("description");
      description.text(response.weather[0].description);

      let currentTemp = $("<p>").addClass("currentTemp");
      currentTemp.text(Math.round(response.main.temp) + "ºF");

      let today = $("<p>").addClass("today");
      today.text("TODAY: " + moment().format("dddd"));

      let date = $("<p>").text(moment().format("MMMM DD, YYYY"));

      let tempHigh = $("<p>").addClass("tempHigh");
      tempHigh.text("High: " + Math.round(response.main.temp_max) + "º");

      let tempLow = $("<p>").addClass("tempLow");
      tempLow.text("Low: " + Math.round(response.main.temp_min) + "º");

      let icon = $("<img>").attr(
        "src",
        "https://openweathermap.org/img/wn/" +
          response.weather[0].icon +
          "@2x.png"
      );

      let humidity = $("<p>").addClass("humidity");
      humidity.text("Humidity: " + response.main.humidity + "%");

      let wind = $("<p>").addClass("humidity");
      wind.text("Wind: " + response.wind.speed + "mph");

      $todayWeather.append(city, description, icon, currentTemp, today, date);
      $todayStats.append(tempHigh, tempLow, humidity, wind);

      // these will be needed for UV index and AQI
      cityName = response.name;
      latitude = response.coord.lat;
      longitude = response.coord.lon;
      uvIndex();
      airQualityIndex();
    });
  }

  // show today's UV index
  function uvIndex() {
    let URL =
      "https://api.openweathermap.org/data/2.5/uvi?appid=" +
      apiKey +
      "&lat=" +
      latitude +
      "&lon=" +
      longitude;

    $.ajax({
      url: URL,
      method: "GET",
    }).then(function (response) {
      let row = $("<div>").addClass("row d-flex justify-content-center");
      let UV = $("<div>")
        .addClass("col-5 col-sm-8 uvi")
        .text("UV Index: " + Math.round(response.value));
        row.append(UV)
      $todayStats.append(row);
      let uvIndex = Math.round(response.value);

      let uvRow = $("<div>").addClass("row uviKey");
      let low = $("<div>")
        .addClass("col-12 p-2")
        .text("0-2 low")
        .css("background-color", "green");
      low.css("color", "white");
      let moderate = $("<div>")
        .addClass("col-12 p-2")
        .text("3-5 moderate")
        .css("background-color", "yellow");
      let high = $("<div>")
        .addClass("col-12 p-2")
        .text("6-7 high")
        .css("background-color", "orange");
      let veryHigh = $("<div>")
        .addClass("col-12 p-2")
        .text("8-10 very high")
        .css("background-color", "red");
      veryHigh.css("color", "white");
      let extreme = $("<div>")
        .addClass("col-12 p-2")
        .text("11+ extreme")
        .css("background-color", "blueviolet");
      extreme.css("color", "white");

      uvRow.append(low, moderate, high, veryHigh, extreme);
      $todayStats.append(uvRow);

      if (uvIndex <= 2) {
        UV.css("background-color", "green");
        UV.css("color", "white");
      } else if (uvIndex <= 5) {
        UV.css("background-color", "yellow");
      } else if (uvIndex <= 7) {
        UV.css("background-color", "orange");
      } else if (uvIndex <= 10) {
        UV.css("background-color", "red");
        UV.css("color", "white");
      } else {
        UV.css("background-color", "blueviolet");
        UV.css("color", "white");
      }
    });
  }

  function airQualityIndex() {
    let aqiURL =
      "https://api.waqi.info/feed/geo:" +
      latitude +
      ";" +
      longitude +
      "/?token=8323d177d676bcf5b5562025b17328fc56a804df";

    $.ajax({
      url: aqiURL,
      method: "GET",
    }).then(function (response) {
      let AQI = response.data.aqi;

      let aqiHeader = $("<p>").addClass("aqiHeader").text("Air Quality Index");
      $todayAQI.append(aqiHeader);

      let row = $("<div>").addClass("row d-flex justify-content-center");
      let aqiLocal = $("<div>")
        .addClass("col-4 col-sm-6 aqiLocal")
        .text("AQI: " + AQI);

      if (AQI == undefined) {
        let aqiUnknown = $("<p>").text(
          "AQI: unknown for this location"
        );
        $todayAQI.append(aqiUnknown);
      } else {
        let localTime = moment()
          .utcOffset(response.data.time.tz)
          .format("HH:mm");
        let localTimeDisplay = $("<p>").text(
          cityName + " local time: " + localTime
        );

        let aqiStation = $("<p>").text(
          "Closest station: " + response.data.city.name
        );
        row.append(aqiLocal)
        $todayAQI.append(localTimeDisplay, aqiStation, row);

        let $aqiRow = $("<div>").addClass("row aqiKey");

        let good = $("<div>")
          .addClass("col-12 p-2")
          .text("0-50 good")
          .css("background-color", "green");
        good.css("color", "white");
        let moderate = $("<div>")
          .addClass("col-12 p-2")
          .text("51-100 moderate")
          .css("background-color", "yellow");
        let sensitive = $("<div>")
          .addClass("col-12 p-2")
          .text("101-150 unhealthy for sensitive groups")
          .css("background-color", "orange");
        let unhealthy = $("<div>")
          .addClass("col-12 p-2")
          .text("151-200 unhealthy")
          .css("background-color", "red");
        unhealthy.css("color", "white");
        let veryUnhealthy = $("<div>")
          .addClass("col-12 p-2")
          .text("201-300 very unhealthy")
          .css("background-color", "blueviolet");
        veryUnhealthy.css("color", "white");
        let hazardous = $("<div>")
          .addClass("col-12 p-2")
          .text("301+ hazardous")
          .css("background-color", "maroon");
        hazardous.css("color", "white");

        if (AQI <= 50) {
          aqiLocal.css("background-color", "green");
          aqiLocal.css("color", "white");
        } else if (AQI <= 100) {
          aqiLocal.css("background-color", "yellow");
        } else if (AQI <= 150) {
          aqiLocal.css("background-color", "orange");
        } else if (AQI <= 200) {
          aqiLocal.css("background-color", "red");
          aqiLocal.css("color", "white");
        } else if (AQI <= 300) {
          aqiLocal.css("background-color", "blueviolet");
          aqiLocal.css("color", "white");
        } else {
          aqiLocal.css("background-color", "maroon");
          aqiLocal.css("color", "white");
        }
        $aqiRow.append(
          good,
          moderate,
          sensitive,
          unhealthy,
          veryUnhealthy,
          hazardous
        );
        $todayAQI.append($aqiRow);
      }
    });
  }

  // show forecast for the next 5 days
  function forecast() {
    $nextFive.empty();

    if ($searchBar.val()) {
      citySearch = $.trim($searchBar.val());
    } else if (!$searchBar.val() && $(".cityListItem").data("clicked")) {
      citySearch = $(event.target).text();
    } else if (
      getCities &&
      !$searchBar.val() &&
      !$(".cityListItem").data("clicked")
    ) {
      let mostRecentCity = getCities[getCities.length - 1];
      citySearch = mostRecentCity;
    }

    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        citySearch +
        "&appid=" +
        apiKey +
        "&units=imperial",
      method: "GET",
    }).then(function (response) {
      let fiveDay = $("<div>")
        .text(response.city.name + " 5-Day Forecast")
        .addClass("col-12 d-flex justify-content-center fiveDay");
      $nextFive.append(fiveDay);

      // start at index 1 because index 0 is today
      for (var i = 1; i < 6; i++) {
        let nextDay = $("<div>").addClass("col-5 col-lg-2 pt-2 nextDay");

        let date = $("<p>").text(moment().add(i, "days").format("ddd DD MMM"));

        let temp = $("<p>").text(
          "Temp: " + Math.round(response.list[i].main.temp) + "ºF"
        );

        let humidity = $("<p>").text(
          "Humidity: " + Math.round(response.list[i].main.temp) + "%"
        );

        let description = $("<p>").text(
          response.list[i].weather[0].description
        );

        let icon = $("<img>").attr(
          "src",
          "https://openweathermap.org/img/wn/" +
            response.list[i].weather[0].icon +
            "@2x.png"
        );

        nextDay.append(date, description, icon, temp, humidity);
        $nextFive.append(nextDay);
        $searchBar.val("");
      }
    });
  }
});
