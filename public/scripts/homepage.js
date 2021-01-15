//contains jQuery/JS for the homepage
$(document).ready(function() {
  const escape = function (input) {
    const div = $("<div>");
    div.text(input);
    return div.text();
  };
  let request_counter = 1;
  $("#load-more").on("click", function () {
    $.ajax({
      method:'GET',
      url: `/api/quizzes/${request_counter}`
    })
      .then(results => {
        console.log(results);
        request_counter++;
        $(".homepage-quizzes .row").last().after(`<div class="row justify-content-center"></div>`)
        results.forEach(elm => {
          $(".homepage-quizzes .row").last().append(`
              <div class="col-12 col-lg-3">
                <div class="card text-center">
                  <img src="${elm.photo_url}" class="card-img-top" alt="quiz thumbnail">
                  <div class="card-body">
                    <h5 class="card-title">${elm.title}</h5>
                    <p class="card-text">${elm.description}</p>
                    <a href="/quizzes/${elm.id}" target="_blank" class="btn btn-primary">Take Quiz</a>
                  </div>
                </div>
              </div>`)
        })
      })
  });

  $("#test-button").on("click", function (event) {
    event.preventDefault();
    alert("button clicked");
  })
});
