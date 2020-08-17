$(document).ready(function () {
  let $searchBar = $("#searchBar");
  let $searchButton = $(".searchButton");
  let $searchResults = $(".searchResults");
  let $numberDate = $(".numberDate");
  let $todayWeather = $(".todayWeather");
  let $todayStats = $(".todayStats");
  let $nextFive = $(".nextFive");
  let citySearch;
  let latitude;
  let longitude;
  let mostRecentCity;
  let cityArray = [];
  let apiKey = "137d2d7c8cbea26f00e792cd98bb231e";

  cityColumn();

  $searchButton.on("click", function (event) {
    event.preventDefault();
    todaysWeather();
    let savedCity = $("<p>").text(citySearch);
    savedCity.addClass("cityListItem");
    $searchResults.prepend(savedCity);
    forecast();
  });

  function todaysWeather() {
    $todayWeather.empty();
    $todayStats.empty();
    citySearch = $.trim($searchBar.val());
    if (!citySearch) {
      citySearch = $(event.target).text();
    }
    let URL =
      "http://api.openweathermap.org/data/2.5/weather?q=" +
      citySearch +
      "&appid=" +
      apiKey +
      "&units=imperial";

    $.ajax({
      url: URL,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      latitude = response.coord.lat;
      longitude = response.coord.lon;

      console.log(latitude, longitude);

      let city = $("<p>").addClass("city");

      city.text(response.name + ", " + response.sys.country);

      let description = $("<p>").addClass("description");
      description.text(response.weather[0].description);

      let currentTemp = $("<p>").addClass("currentTemp");
      currentTemp.text(Math.round(response.main.temp) + "ºF");

      let today = $("<p>").addClass("today");
      today.text(moment().format("dddd LT"));

      let date = $("<p>").text("Today is " + moment().format("MMMM DD, YYYY"));

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
    storeCities();
  }

  function uvIndex() {
    let URL =
      "http://api.openweathermap.org/data/2.5/uvi?appid=" +
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
        .css("background-color", "violet");

      uvRow.append(low, moderate, high, veryHigh, extreme);
      $todayStats.append(uvRow);

      if (uvIndex <= 2) {
        UV.css("background-color", "green");
      }

      if (uvIndex <= 5) {
        UV.css("background-color", "yellow");
      }

      if (uvIndex <= 7) {
        UV.css("background-color", "orange");
      }

      if (uvIndex <= 10) {
        UV.css("background-color", "red");
      }

      if (uvIndex >= 11) {
        UV.css("background-color", "violet");
      }
    });
  }

  function forecast() {
    $nextFive.empty();
    citySearch = $.trim($searchBar.val());
    if (!citySearch) {
      citySearch = $(event.target).text();
    }
    $.ajax({
      url:
        "http://api.openweathermap.org/data/2.5/forecast?q=" +
        citySearch +
        "&appid=" +
        apiKey +
        "&units=imperial",
      method: "GET",
    }).then(function (response) {
      for (var i = 0; i < 5; i++) {
        let nextDay = $("<div>").addClass("col-sm-2 nextDay");

        let date = $("<p>").text(
          moment()
            .add(i + 1, "days")
            .format("ddd DD MMM")
        );

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

  function storeCities() {
    cityArray.push(citySearch);
    localStorage.setItem("cities", JSON.stringify(cityArray));
  }

  function cityColumn() {
    let getCities = JSON.parse(localStorage.getItem("cities"));
    

    if (getCities) {
      cityArray = getCities;
      mostRecentCity = getCities[getCities.length - 1];
      console.log(mostRecentCity);
      for (i = 0; i < cityArray.length; i++) {
        let savedCity = $("<p>").text(cityArray[i]);
        savedCity.addClass(`cityListItem ${i}`);
        $searchResults.prepend(savedCity);
      }
    }
  }

  $(".cityListItem").on("click", function () {
    todaysWeather();
    forecast();
  });
});
