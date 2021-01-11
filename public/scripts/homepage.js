//contains jQuery/JS for the homepage
$(() => {
  $.ajax({
    method: "GET",
    url: "/quizzes"
  }).done((quizzes) => {
    for (quiz of quizzes) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;
});
