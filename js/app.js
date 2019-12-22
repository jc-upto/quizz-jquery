let figures = $('figure');
let propositionsEl = $('#propositions');
let questionsEl = $('#question');
let progressionEl = $('#progress');
let resultsEl = $("#correction");

let questions = [];
let index = 0;

figures.mousedown(function() {
   $(this).toggleClass("active");
});


figures.mouseup(function() {
   $(this).toggleClass("active");
   startQuizz("assets/sources/" + $(this).attr("id") + ".json");
   figures.parent().stop().fadeOut(500);
});


function startQuizz(source) {
   data = getJsonData(source);

   if(data) {
      // Getting 10 random question from provided JSON data.
       data = shuffle(data);

       for(let i = 0; i < 10; i++) {
          questions.push(
              new Question(data[i].id, data[i].question, data[i].propositions, data[i].reponse, data[i].anecdote)
          );
       }

       displayQuestion(index);
   }

   $('#progress-container').animate({"opacity" : 1}, 1000);
}


/**
 * Check if provided answer is correct.
 */
function checkAnswer(value) {

   if(parseInt(value) === questions[index].rightAnswerId) {
      questions[index].found = true;
   }
   questions[index].userAnswerId = parseInt(value);

   if(index < 9) {
      // J'aurais pu utiliser un callback, il n'empêche que JQuery rend le code très moche !!
      setTimeout(displayQuestion, 800);
   }
   else {
      showGameResults();
   }

   index++;
}


/**
 * Display a question.
 */
function displayQuestion() {
   // Reset elements positions.
   propositionsEl.html("");
   progressionEl.text( index + 1);
   questionsEl.text(`${questions[index].question}`).animate({ left: 0}, { duration: 800, queue: false });

   for(let i = 0; i < questions[index].answers.length; i++) {
      propositionsEl.html( propositionsEl.html() + "<input type='radio' id='" + i + "' name='question-proposal' value='"+ i + "'/>" +
                           "<label for='" + i + "'>" + questions[index].answers[i] + "</label><br />");
   }

   propositionsEl.animate({left: 0}, { duration: 800, queue: true });

   $("#propositions input").click(function() {
      propositionsEl.animate({left: '100%'}, { duration: 800, queue: false });
      questionsEl.animate({left: '-100%'}, { duration: 800, queue: false });
      checkAnswer($(this).val());
   });
}


/**
 * Show the end game message with complete list of incorrect answers.
 */
function showGameResults() {
   propositionsEl.css("display","none");
   questionsEl.css("display", "none");
   $('#progress-container').css("display", "none");

   let found = 0;

   for(let idx in questions) {
      let rDiv = $('<div></div>');
      $(`<div>` + (parseInt(idx) + 1) + `. ${questions[idx].question}</div>`).appendTo(rDiv);
      if(questions[idx].found) {
         $(`<p>Bonne réponse ! ${questions[idx].answers[questions[idx].rightAnswerId]}</p>`).css("color", "green").appendTo(rDiv);
         found++;
      }
      else {
         $(`<p>Mauvaise réponse ! ${questions[idx].answers[questions[idx].userAnswerId]}</p>`).css("color", "red").appendTo(rDiv);
         $(`<p>Il fallait répondre: ${questions[idx].answers[questions[idx].rightAnswerId]}</p>`).appendTo(rDiv);
      }

      let ann = $(`<span>${questions[idx].story}</span>`).css("color", "cadetblue");
      $('<p>Anecdote: </p>').append(ann).appendTo(rDiv);

      rDiv.find("p").css("margin-left", "40px");
      rDiv.css("margin-top", "25px").css("margin-left", "20px").appendTo(resultsEl);
   }

   $(`<div>Votre score est de: ${found} sur 10</div>`).css("text-align", "center").prependTo(resultsEl);

   $('#viewport').css("height", "auto");
}


/**
 * Fetch a Json data.
 * @param path
 * @returns {boolean|any}
 */
function getJsonData(path) {
   let jsonRequest = new XMLHttpRequest();
   jsonRequest.open('GET', path, false);
   jsonRequest.send(null);

   if (jsonRequest.status === 200) {
      return JSON.parse(jsonRequest.response);
   }
   return false;
}


/**
 * Randomly shuffle a provided array.
 */
function shuffle(dataArray) {
   let data = [];

   while(dataArray.length) {
      let index = Math.floor(Math.random() * dataArray.length);
      data.push(dataArray[index]);
      dataArray.splice(index, 1);
   }

   return data;
}



/*************************/
/**** Question Object ****/
/*************************/

// Small helper representing JSON single question entry.
let Question = function(id, question, answers, rAnswer, story) {
   this.id = parseInt(id);
   this.question = question;
   this.answers = answers;
   this.rightAnswerId = parseInt(rAnswer);
   this.userAnswerId = null;
   this.story = story;
   this.found = false;
};