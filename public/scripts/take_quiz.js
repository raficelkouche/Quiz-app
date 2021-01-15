$(() => {
  const questions = $(".quiz-questions").find(".question");
  const numOfQuestions = Number($("#numOfQuestions").text());
  $(".question-counter").text(`1 / ${numOfQuestions}`);
  let i = 0;

  $(questions[0]).css("display", "block");

  $(".next").on("click", function () {
    if (i < numOfQuestions) {
      $(questions[i]).css("display", "none");
      if (i === numOfQuestions - 1) {
        $("#submit-quiz-slide").css("display", "flex");
        $(".question-counter").css("display", "none");
      }else {
        $(questions[i+1]).css("display","block");
        $(".question-counter").text(`${i + 2} / ${numOfQuestions}`);
      }
      i++;
    }
  });

  $(".previous").on("click", function () {
    if (i > 0) {
      $(".question-counter").text(`${i} / ${numOfQuestions}`);
      if (i === numOfQuestions) {
        $("#submit-quiz-slide").css("display", "none");
        $(".question-counter").css("display", "block");
      } else {
        $(questions[i]).css("display", "none");
      }
      $(questions[i-1]).css("display", "block");
      i--;
    }

  });



});

