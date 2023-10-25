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

  if (mapContainer.length) {
    const map = L.map("planner-map").setView([37.0902, -95.7129], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }
});
