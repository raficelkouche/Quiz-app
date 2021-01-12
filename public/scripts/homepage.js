//contains jQuery/JS for the homepage
$(() => {
  let requestCounter = 0;
  $("#load-more").on("click", function () {
    alert("button clicked");
    db.getQuizzes(requestCounter)
      .then(result => {
        requestCounter++;
        console.log(result);
        //create a function that will create a new div with 3 new quizzes
        result.foreach(elm => {
          $("#load-more").append(`<div>${elm.title}</div`);
        });
      });
  });
});
