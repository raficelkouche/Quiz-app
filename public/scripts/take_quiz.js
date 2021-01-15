$(() => {
  const questions = $(".quiz-questions").find(".question");
  const numOfQuestions = Number($("#numOfQuestions").text());
  let i = 0;

  $(questions[0]).css("display", "block");

  $(".next").on("click", function () {
    if (i < numOfQuestions) {
      $(questions[i]).css("display", "none");
      if (i === numOfQuestions - 1) {
        $("#submit-quiz-slide").css("display", "flex");
      }else {
        $(questions[i+1]).css("display","block");
      }
      i++;
    }
  });

  $(".previous").on("click", function () {
    if (i > 0) {
      if (i === numOfQuestions) {
        $("#submit-quiz-slide").css("display", "none");
      } else {
        $(questions[i]).css("display", "none");
      }
      $(questions[i-1]).css("display", "block");
      i--;
    }

  })
})

