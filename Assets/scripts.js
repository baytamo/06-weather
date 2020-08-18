$(document).ready(function () {
  let $searchBar = $("#searchBar");
  let $searchButton = $(".searchButton");
  let $searchResults = $(".searchResults");
  let $numberDate = $(".numberDate");
  let $todayWeather = $(".todayWeather");
  let $todayStats = $(".todayStats");
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
      for (i = 0; i < cityArray.length; i++) {
        let savedCity = $("<p>").text(cityArray[i]);
        savedCity.addClass("cityListItem");
        $searchResults.prepend(savedCity);
      }
    }
  }

  // on click for cities listed in left column
  $(".cityListItem").on("click", function (event) {
    
    $(".cityListItem").data("clicked", true);
    todaysWeather();
    forecast();
  });

  // on click for search button
  $searchButton.on("click", function (event) {
    
    todaysWeather();

    // add this item to left column
    let savedCity = $("<p>").text(citySearch);
    savedCity.addClass("cityListItem");
    savedCity.on("click", function (event) {
      todaysWeather();
      forecast();
    });
    $searchResults.prepend(savedCity);

    // add this item to local storage
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    forecast();
  });

  // on submit for search input
  $("form").on("submit", function (event) {
    
    todaysWeather();

    // add this item to left column
    let savedCity = $("<p>").text(citySearch);
    savedCity.addClass("cityListItem");
    savedCity.on("click", function (event) {
      todaysWeather();
      forecast();
    });
    $searchResults.prepend(savedCity);

    // add this item to local storage
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    forecast();
  });

  // display today's weather details
  function todaysWeather() {
    $todayWeather.empty();
    $todayStats.empty();

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
      // these will be needed for UV index
      latitude = response.coord.lat;
      longitude = response.coord.lon;

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
      today.text(moment().format("dddd LT"));

      let date = $("<p>").text("Today is: " + moment().format("MMMM DD, YYYY"));

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

      $todayWeather.append(city, description, icon, currentTemp, today);
      $todayStats.append(date, tempHigh, tempLow, humidity, wind);
      uvIndex();
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
      let UV = $("<div>")
        .addClass("col-3 uvi")
        .text("UV Index: " + Math.round(response.value));
      $todayStats.append(UV);
      let uvIndex = Math.round(response.value);

      let uvRow = $("<p>").addClass("row uviKey");
      let low = $("<div>")
        .addClass("col-sm-2 p-2")
        .text("low")
        .css("background-color", "green");
      let moderate = $("<div>")
        .addClass("col-sm-3 p-2")
        .text("moderate")
        .css("background-color", "yellow");
      let high = $("<div>")
        .addClass("col-sm-2 p-2")
        .text("high")
        .css("background-color", "orange");
      let veryHigh = $("<div>")
        .addClass("col-sm-3 p-2")
        .text("very high")
        .css("background-color", "red");
      let extreme = $("<div>")
        .addClass("col-sm-2 p-2")
        .text("extreme")
        .css("background-color", "blueviolet");

      uvRow.append(low, moderate, high, veryHigh, extreme);
      $todayStats.append(uvRow);

      if (uvIndex <= 2) {
        UV.css("background-color", "green");
      } else if (uvIndex <= 5) {
        UV.css("background-color", "yellow");
      } else if (uvIndex <= 7) {
        UV.css("background-color", "orange");
      } else if (uvIndex <= 10) {
        UV.css("background-color", "red");
      } else {
        UV.css("background-color", "blueviolet");
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
      // start at index 1 because index 0 is today
      for (var i = 1; i < 6; i++) {
        let nextDay = $("<div>").addClass("col-sm-2 pt-2 nextDay");

        let date = $("<p>").text(moment().add(i, "days").format("ddd DD MMM"));

        let temp = $("<p>").text(
          "temp: " + Math.round(response.list[i].main.temp) + "ºF"
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