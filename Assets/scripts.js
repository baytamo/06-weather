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

  let apiKey = "166a433c57516f51dfab1f7edaed8413";

  cityColumn();

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

  $(".cityListItem").on("click", function (event) {
    $(".cityListItem").data("clicked", true);
    todaysWeather();
    forecast();
  });

  $searchButton.on("click", function (event) {
    event.preventDefault();
    todaysWeather();

    let savedCity = $("<p>").text(citySearch);
    savedCity.addClass("cityListItem");
    savedCity.on("click", function (event) {
      todaysWeather();
      forecast();
    });
    $searchResults.prepend(savedCity);
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    forecast();
  });

  function todaysWeather() {
    $todayWeather.empty();
    $todayStats.empty();

    getCities = JSON.parse(localStorage.getItem("cities"));

    if ($searchBar.val()) {
      citySearch = $.trim($searchBar.val());
    } else if ($(".cityListItem").data("clicked")) {
      citySearch = $(event.target).text();
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
      latitude = response.coord.lat;
      longitude = response.coord.lon;

      let city = $("<p>").addClass("city");

      city.text(response.name + ", " + response.sys.country);

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
