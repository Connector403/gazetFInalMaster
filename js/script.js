let country, country_boundary, map, cities_fg, wikipedia_fg, country_code_global = "", country_name, lat, lng, streetMap;

$(document).ready(function () {

    map = L.map("map", {
        attributionControl: false,
    }).setView([0, 0], 1.5);
    L.control.scale().addTo(map);
    map.zoomControl.setPosition("topright");

    streetMap = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
    );

    map.addLayer(streetMap);

    country_boundary = new L.geoJson().addTo(map);

    cities_fg = new L.FeatureGroup();

    map.addLayer(cities_fg);

    wikipedia_fg = new L.FeatureGroup();
    map.addLayer(wikipedia_fg);

    get_country_codes();
    //get_user_location();

    //let lat, lng, countryISO, capitalCity;
    //navigator.geolocation.getCurrentPosition(success);

    //function success(position) {
    //    lat = position.coords.latitude;
         
    //    lng = position.coords.longitude;
    //    //console.log(lng);
    //}

    get_user_location();



});
function get_country_codes() {
    $.ajax({
        url: "php/getCountriesCode.php?",
        type: "GET",
        success: function (json) {
            let countries = JSON.parse(json);
            let option = "";
            for (country of countries) {
                option +=
                    '<option value="' + country[1] + '">' + country[0] + "</option>";
            }
            $("#country_list").append(option).select2();
        },
    });
}


function get_user_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const {
                    latitude
                } = position.coords;
                const {
                    longitude
                } = position.coords;
                const coords = [latitude, longitude];
                map.spin(true);
                $.ajax({
                    url: "php/getCountryCodeFromLatLng.php?lat=" +
                        latitude +
                        "&lng=" +
                        longitude +
                        "&username=ShashAPI",
                    type: "GET",
                    success: function (json) {
                        map.spin(false);
                        json = JSON.parse(json); // Parse the string data to JavaScript object
                        // console.log(json);
                        const country_code = json.countryCode;
                        $("#country_list").val(country_code).trigger("change");
                    },
                });
            },
            function () {
                alert("Could not get your position!");
            }
        );
    }
}
function get_nearby_cities(east, west, north, south) {
    cities_fg.clearLayers();
    $.ajax({
        url: "php/getNearByCities.php",
        type: "GET",
        data: {
            east: east,
            west: west,
            north: north,
            south: south,
            username: "sherazzi403",
        },
        success: function (json) {
            json = JSON.parse(json);
            //console.log(json);
            const data = json.geonames;
            const city_icon = L.ExtraMarkers.icon({
                icon: "fa-building",
                markerColor: "black",
                shape: "square",
                prefix: "fa",
            });
            for (let i = 0; i < data.length; i++) {
                const marker = L.marker([data[i].lat, data[i].lng], {
                    icon: city_icon,
                }).bindPopup(
                    "<b>" +
                    data[i].name +
                    "</b><br>Population: " +
                    parseInt(data[i].population).toLocaleString("en")
                );
                cities_fg.addLayer(marker);
            }
        },
    });
}



function get_country_border(country_code) {
    $.ajax({
        url: "php/getCountryBorder.php",
        type: "GET",
        data: {
            country_code: country_code
        },
        success: function (json) {
            json = JSON.parse(json);
            country_boundary.clearLayers();
            country_boundary.addData(json).setStyle(polystyle());
            const bounds = country_boundary.getBounds();
            map.fitBounds(bounds);

            const east = bounds.getEast();
            const west = bounds.getWest();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            get_nearby_cities(east, west, north, south);
         
        },
    });
}


function zoomToCountry(country_code) {
    if (country_code == "") return;
    country_name = $("#country_list option:selected").text();
    country_code_global = country_code;
    get_country_border(country_code);
    get_country_info(country_code);
}

function get_country_info(country_code) {
    if ($("#country_info").css("left") !== "5px") {
        $("#country_info").animate({
            left: "5px"
        }, 1000);
        $(".pull_country_info_popup").animate({
            left: "-40px"
        }, 1000);
    }
    map.spin(true, {
        top: 180,
        left: 150
    });

    $.ajax({
        url: "php/getCountryInfo.php",
        type: "GET",
        data: {
            country_code: country_code
        },
        success: function (response) {
            map.spin(false);
            let details = $.parseJSON(response);
            //console.log(details);
            lat = details.latlng[0];
            lng = details.latlng[1];
            $("#countryName").html(details.nativeName);
            $("#capitalCity").html(details.capital);
            $("#Population").html(details.population);
            $('#continentName').html(details.region);
            $("#countryFlag").attr("src", details.flag);
            $("#country_currency").html(details.currencies[0]["name"]);
            $("#country_wikipedia").attr(
                "href",
                "https://en.wikipedia.org/wiki/" + details.name
            );
        },
    });
}



function polystyle() {
    return {
        fillColor: "green",
        weight: 1,
        opacity: 0.1,
        color: "white", //Outline color
        fillOpacity: 0.6,
    };
}


function CovidResp() {
    map.spin(true);
    $.ajax({
        url: "php/corno.php",
        type: "POST",
        data: {
            country_code: country_code_global
        },
        success: function (response) {
            let details = $.parseJSON(response);
            //console.log(details);
            $("#totalConfirmedCases").html(details.stats.totalConfirmedCases);
            $("#newlyConfirmedCases").html(details.stats.newlyConfirmedCases);
            $("#newlyRecoveredCases").html(details.stats.newlyRecoveredCases);
            $("#newDeaths").html(details.stats.newDeaths);
            $("#totalsDeaths").html(details.stats.totalDeaths);
            //console.log(details.stats.totalDeaths);
            map.spin(false);
            $("#coronoModal").modal();
        }
    })
}



function weatherResp() {
    map.spin(true);
    $.ajax({
        url: "php/openWeather.php",
        type: "GET",
        data: {
            lat: lat,
            lng: lng
        },
        success: function (response) {
            let details = $.parseJSON(response);
            
            $('#weatherCity').html(details.name);
            let timestamp = details.dt;
            let dateObj = new Date(timestamp * 1000);
            let hours = dateObj.getUTCHours().toString().padStart(2, 0);
            let minutes = dateObj.getUTCMinutes().toString().padStart(2, 0);
            $('#weatherTime').html(`${hours}:${minutes}`);
            $('#weatherTemp').html(Math.round(details.main.temp) + " &#8451");
            $('#weatherDescription').html(details.weather[0].description);

            $('#humidity').html(details.main.humidity);
            $('#pressure').html(details.main.pressure + "%");
            $('#windSpeed').html(details.wind.speed + "km/h")
            let iconcode = details.weather[0].icon;
            let iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            $('#wicon').attr("src", iconurl);
            console.log(details.weather[0].icon);
            map.spin(false);
            $("#weatherModal").modal();
        }
    })
}


function newsResp () {
    map.spin(true);
    $.ajax({
        url: "php/newApi.php",
        type: "GET",
        data: {
            country_code: country_name
        },
        success: function (resp) {
            response = JSON.parse(resp);
            console.log(response);
            const data = response["articles"];
            for (let i = 0; i < data.length; i++) {
                $("#news_data").append(newsArray(data[i]));
            }
            map.spin(false);
            $("#newsModal").modal();
        },

    })
}

function newsArray(data) {
    const card = 
        '<div class="card" style="width: 20rem;"> <img class="card-img-top" src="' +
        data["urlToImage"] +
        '" alt="News Image"> <div class="card-body"> <h5 class="card-title">' +
        data["author"] +
        '</h5> <p class="card-text">' +
        data["title"] +
        '</p> <a href="' +
        data["url"] +
        '" target="_blank" class="btn btn-primary">Details</a> </div> </div>';
    return card;
}