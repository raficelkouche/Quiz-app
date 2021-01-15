$(() => {
  let request_counter = 1;

  $("#load-more-quizzes").on("click", function () {
    $.ajax({
      method: "GET",
      url: `/api/quizzes/${request_counter}`
    })
    .then(results => {
      request_counter++;
      results.forEach(elm => {
        $(".all-quizzes .card").last().after(`
          <div class="card mb-3">
            <div class="row g-0">
              <div class="col-12 col-md-6 d-flex">
                <img src="${elm.photo_url}" alt="">
              </div>
              <div class="col-12 col-md-3">
                <div class="card-body card-content">
                  <h5 class="card-title">${elm.title}</h5>
                  <p class="card-text">${elm.descritpion}</p>
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="card-body card-controls">
                  <a href="/quizzes/${elm.id}" target="_blank" class="btn btn-primary">Take Quiz</a>
                  <a href="#" target="_blank" class="btn btn-primary">Share Quiz</a>
                </div>
              </div>
            </div>
        </div>

        `)

      })
    })
  });

});
