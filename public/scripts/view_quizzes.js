$(() => {
  let request_counter = 1;
  $("#load-more-quizzes").on("click", function () {
    $.ajax({
      method: "GET",
      url: `/api/quizzes/${request_counter}`
    })
    .then(results => {
      request_counter++;
      console.log(results);
      results.forEach(elm => {
        $("#load-more-quizzes").before(`<div>${elm.title}</div>`);
      })
    })
});





});
