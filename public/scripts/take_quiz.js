$(() => {
  const questions = $(".quiz-questions").find(".question");
  const numOfQuestions = Number($("#numOfQuestions").text());

  $(questions[0]).css("display", "block");

  let i = 1;
  $(".next").on("click", function () {
    if (i < numOfQuestions) {
      $(questions[i-1]).css("display", "none");
      $(questions[i]).css("display","block");
      i++;
    }
    else if (i === numOfQuestions) {
      $(questions[i-1]).css("display", "none");
      $("#submit-quiz-slide").css("display", "block");
    }
    else {
      i = numOfQuestions;
    }
  })
})

