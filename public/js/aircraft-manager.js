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

$("#success-close-button").on("click", function () {
  $(".success-strip").addClass("hidden");
});
