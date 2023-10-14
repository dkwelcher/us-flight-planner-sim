$(function () {
  const mapContainer = $("#planner-map");

  if (mapContainer.length) {
    const map = L.map("planner-map").setView([37.0902, -95.7129], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }
});
