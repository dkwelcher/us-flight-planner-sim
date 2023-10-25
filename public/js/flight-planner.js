$(function () {
  // Aircraft Select2
  $("#aircraft-name").select2({
    ajax: {
      url: "http://localhost:8888/aircrafts",
      dataType: "json",
      delay: 250,
      data: function (params) {
        return {
          term: params.term || "",
        };
      },
      processResults: function (data) {
        return {
          results: data,
        };
      },
      cache: true,
    },
    minimumInputLength: 1,
  });

  // Airport Select2
  $("#starting-airport-name, #destination-airport-name").select2({
    ajax: {
      url: "http://localhost:8888/airports",
      dataType: "json",
      delay: 250,
      data: function (params) {
        return {
          term: params.term || "",
        };
      },
      processResults: function (data) {
        return {
          results: data,
        };
      },
      cache: true,
    },
    minimumInputLength: 1,
  });

  const mapContainer = $("#planner-map");
  let map;
  let polyline;
  let markersArray = [];

  if (mapContainer.length) {
    map = L.map("planner-map").setView([37.0902, -95.7129], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }

  $("#create-flight-plan").on("click", function () {
    const aircraftId = $("#aircraft-name").val();
    const startingAirportICAO = $("#starting-airport-name").val();
    const destinationAirportICAO = $("#destination-airport-name").val();

    $.ajax({
      url: "http://localhost:8888/create-flight-plan",
      method: "POST",
      data: JSON.stringify({
        aircraftId: aircraftId,
        startingAirportICAO: startingAirportICAO,
        destinationAirportICAO: destinationAirportICAO,
      }),
      contentType: "application/json",
      success: function (response) {
        if (response.status === "success") {
          console.log(response.data);
          generatePathOnMap(response);
        } else {
          console.error(response.message);
        }
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });
  });

  function generatePathOnMap(response) {
    if (polyline) {
      map.removeLayer(polyline);
    }

    markersArray.forEach((marker) => {
      map.removeLayer(marker);
    });

    markersArray = [];

    const detailedPath = response.data;

    const latlngs = detailedPath.map((airport) => [
      airport.Latitude,
      airport.Longitude,
    ]);
    polyline = L.polyline(latlngs, { color: "blue" }).addTo(map);

    detailedPath.forEach((airport) => {
      const marker = L.marker([airport.Latitude, airport.Longitude]).addTo(map);
      marker.bindPopup(`
        <strong>ICAO:</strong> ${airport.ICAO}<br>
        <strong>Name:</strong> ${airport.AirportName}<br>
        <strong>Latitude:</strong> ${airport.Latitude}<br>
        <strong>Longitude:</strong> ${airport.Longitude}
      `);

      markersArray.push(marker);
    });

    map.fitBounds(polyline.getBounds());
  }
});
