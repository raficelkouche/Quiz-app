//contains jQuery/JS for the homepage
$(() => {
  let request_counter = 1;
  $("#load-more").on("click", function () {
    $.ajax({
      method:'GET',
      url: `/api/quizzes/${request_counter}`
    })
      .then(results => {
        request_counter++;
        results.forEach(elm => {
          $("#load-more").before(`<div>${elm.title}</div>`);
        })
      })
  });
});
