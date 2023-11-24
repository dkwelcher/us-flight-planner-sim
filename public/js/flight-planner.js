$(function () {
  // AIRCRAFT SELECT2

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

  // AIRPORT SELECT2

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

  // CREATE FLIGHT PLAN

  $("#create-flight-plan").on("click", function () {
    const aircraftId = $("#aircraft-name").val();
    const startingAirportICAO = $("#starting-airport-name").val();
    const destinationAirportICAO = $("#destination-airport-name").val();

    const errorMessage = validateInput(
      aircraftId,
      startingAirportICAO,
      destinationAirportICAO
    );

    if (errorMessage.length !== 0) {
      $("#error-msg-planner").text(errorMessage).css("visibility", "visible");
    } else {
      $("#error-msg-planner").css("visibility", "hidden");
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
            $("error-msg-planner").css("visibility", "hidden");
            generatePathOnMap(response);
            updateFlightPlanTable(response.data);
          } else {
            console.error(response.message);
          }
        },
        error: function (error) {
          console.error("Error:", error);
          $("#error-msg-planner")
            .text("No path found")
            .css("visibility", "visible");
          resetMap();
          updateFlightPlanTable([]);
        },
      });
    }
  });

  // INPUT VALIDATION HELPER FUNCTION

  function validateInput(
    aircraftID,
    startingAirportICAO,
    destinationAirportICAO
  ) {
    if (aircraftID === null) {
      return "Please select aircraft.";
    } else if (startingAirportICAO === null) {
      return "Please select starting airport.";
    } else if (destinationAirportICAO === null) {
      return "Please select destination airport.";
    } else {
      return "";
    }
  }

  // LEAFLET MAP GENERATION

  function generatePathOnMap(response) {
    resetMap();

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

  function resetMap() {
    if (polyline) {
      map.removeLayer(polyline);
    }

    markersArray.forEach((marker) => {
      map.removeLayer(marker);
    });
  }

  // FLIGHT PLAN TABLE UPDATE

  function updateFlightPlanTable(detailedPath) {
    const tbody = $("#leg-table tbody");

    tbody.empty();

    for (let i = 0; i < detailedPath.length - 1; i++) {
      const fromAirport = detailedPath[i];
      const toAirport = detailedPath[i + 1];

      const row = `
            <tr>
                <td>${i + 1}</td>
                <td>${fromAirport.AirportName}</td>
                <td>${toAirport.AirportName}</td>
            </tr>
        `;

      tbody.append(row);
    }
  }
});
