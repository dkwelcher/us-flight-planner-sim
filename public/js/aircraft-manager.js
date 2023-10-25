$(function () {
  // CREATE AIRCRAFT

  $("#create-button").on("click", function () {
    const id = $("#create-aircraft-id").val().trim();
    const name = $("#create-aircraft-name").val().trim();
    const range = $("#create-aircraft-range").val().trim();

    const errorMessage = validateInput(id, name, range);

    if (errorMessage.length !== 0) {
      $("#error-msg-create").text(errorMessage).css("visibility", "visible");
    } else {
      $("#error-msg-create").css("visibility", "hidden");
      $.ajax({
        type: "POST",
        url: "http://localhost:8888/create-aircraft",
        data: JSON.stringify({
          id: id,
          name: name,
          range: range,
        }),
        contentType: "application/json",
        success: function (response) {
          if (response.message === "SUCCESS") {
            $("#aircraft-name").text(name);
            $("#success-fail-msg").text(" has been successfully created!");
            $(".success-strip")
              .removeClass("hidden")
              .removeClass("failure-background-color")
              .addClass("success-background-color");
          } else {
            $("#success-fail-msg").text("Something went wrong.");
            $(".success-strip")
              .removeClass("hidden")
              .removeClass("success-background-color")
              .addClass("failure-background-color");
          }
        },
        error: function (error) {
          console.log("Error: " + error);
        },
      });
    }
  });

  function validateInput(id, name, range) {
    if (id.length > 25) {
      return "ID must be 25 characters or fewer.";
    } else if (name.length > 50) {
      return "Name must be 50 characters or fewer.";
    } else if (range.length > 10 || !isAllDigits(range)) {
      return "Range must be 10 digits or fewer.";
    } else {
      return "";
    }
  }

  function isAllDigits(range) {
    return /^\d+$/.test(range);
  }

  // SUCCESS STRIP

  $("#success-close-button").on("click", function () {
    $(".success-strip").addClass("hidden");
  });

  // SEARCH MODAL

  $("#select-button").on("click", function () {
    $("#aircraft-search-modal").css("display", "block");
  });

  $("#modal-search-button").on("click", function () {
    searchAircrafts();
  });

  $("#modal-close-button").on("click", function () {
    $("#modal-search-input").val("");
    $("#aircraft-search-modal").css("display", "none");
  });

  function searchAircrafts() {
    const query = $("#modal-search-input").val().trim();
    $.ajax({
      url: "http://localhost:8888/search-aircraft",
      method: "POST",
      data: JSON.stringify({ query }),
      contentType: "application/json",
      success: function (data) {
        const resultsContainer = $("#modal-search-results");
        resultsContainer.empty();

        data.forEach((aircraft) => {
          const resultDiv = $("<div>")
            .addClass("modal__result-item")
            .addClass("flex");
          resultDiv.append($("<p>").text(aircraft.name));
          const selectBtn = $("<button>").text("Select");
          selectBtn.on("click", function () {
            $("#manage-aircraft-id").val(aircraft.id);
            $("#manage-aircraft-name").val(aircraft.name);
            $("#manage-aircraft-range").val(aircraft.range);
            $("#modal-search-input").val("");
            $("#aircraft-search-modal").css("display", "none");
            $("#manage-aircraft-name, #manage-aircraft-range").removeAttr(
              "disabled"
            );
          });
          resultDiv.append(selectBtn);
          resultsContainer.append(resultDiv);
        });
      },
    });
  }
});
