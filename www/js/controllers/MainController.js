var app = angular.module('application');

app.controller('MainCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"objects_active": true, "actions_active": false, "nb_objects":2, "nb_actions":2, "text_descr": false, "voc_descr": false, "nb_questions":4, "nb_try":2};
  $scope.paramsSecondGame = { "play_type" : "action", "nb_rooms":3, "text_descr": true, "voc_descr": false, "nb_questions":4, "nb_try":2};

  var dataV1JsonPath = 'json/datav1.json';
  var helpsJsonPath = 'json/helps.json';

  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
  };

  // Initialize the rooms and the object/action for the first game
  $scope.initFirstGame = function () {
    $http.get(dataV1JsonPath).success(function(data) {
      $scope.questionRoomList = [];
      var roomsArray = data.rooms.slice();
      while($scope.questionRoomList.length < $scope.paramsFirstGame.nb_questions){
        var nb = Math.floor(Math.random()*roomsArray.length);
        var currentRoom = roomsArray[nb];

        $scope.questionRoomList.push(roomsArray[nb]);
        roomsArray.splice(nb,1);
        if(roomsArray.length === 0){
          roomsArray = data.rooms.slice();
        }
      }

      $scope.remaining_questions = $scope.paramsFirstGame.nb_questions;
      $scope.current_question = $scope.paramsFirstGame.nb_questions - $scope.remaining_questions + 1;

      //Supprime les trucs vert
      var trueElem = document.getElementsByClassName("true");
      var trueCadre = document.getElementsByClassName("true-cadre");
      var length = trueElem.length;
      console.log(trueElem.length);
      for(var y = length-1; y >= 0; y--) {
        console.log(trueElem[y]);
        trueElem[y].classList.remove("true");
        trueCadre[y].classList.remove("true-cadre");
      }

      nextStepFirstGame();
    });

  };

  // Resets the data for a new game and generates a new set of objects/actions
  function nextStepFirstGame(){
    $scope.fgSelected = undefined;
    $scope.alreadyAnswered = [];
    $scope.fgGoodAnswers = [];
    $scope.fgBadAnswers = [];

    $http.get('json/datav1.json').success(function(data) {
      // Retrieves the question room in the question list
      $scope.questionRoom = $scope.questionRoomList[$scope.remaining_questions - 1];

      /************************ Handling objects **************************/

      var nbBadAnswersObjects = 0;
      if($scope.paramsFirstGame.objects_active) {
        // Defining the number of good and bad answers randomly (according to the number of objects defined
        // and the actual referenced objects)
        var randMaxObjects = $scope.questionRoom.ref_objects.length < $scope.paramsFirstGame.nb_objects ?
          $scope.questionRoom.ref_objects.length : $scope.paramsFirstGame.nb_objects;
        var nbGoodAnswersObjects = 0;
        if(randMaxObjects != 0) nbGoodAnswersObjects = Math.floor(Math.random() * randMaxObjects) + 1;
        var nbBadAnswersObjects = $scope.paramsFirstGame.nb_objects - nbGoodAnswersObjects;

        // Building the good answers array
        var refObjectsArray = $scope.questionRoom.ref_objects.slice();
        for (var i = 0; i < nbGoodAnswersObjects; i++) {
          var nb = Math.floor(Math.random() * refObjectsArray.length);
          var objToAdd = data.objects.filter(function (elmt) {
            if (elmt.image != undefined && elmt.image == refObjectsArray[nb])
              return elmt;
          });

          // objToAdd returns an array, so assign it immediately to a var
          $scope.fgGoodAnswers.push(objToAdd[0]);
          refObjectsArray.splice(nb, 1);
        }

        // Retrieving all the objects not referenced in the question room
        var objectsArray = data.objects.slice();
        var allBadObjectsArray = objectsArray.filter(function (elmt) {
          return $scope.questionRoom.ref_objects.indexOf(elmt.image) === -1;
        });

        // Building the bad answers array
        while ($scope.fgBadAnswers.length < nbBadAnswersObjects) {
          nb = Math.floor(Math.random() * allBadObjectsArray.length);
          $scope.fgBadAnswers.push(allBadObjectsArray[nb]);
          allBadObjectsArray.splice(nb, 1);
        }
      } else {
        $scope.paramsFirstGame.nb_objects = 0;
      }

      /************************ Handling actions **************************/

      if($scope.paramsFirstGame.actions_active) {
        // Defining the number of good and bad answers randomly (according to the number of actions defined
        // and the actual referenced objects)
        var randMaxActions = $scope.questionRoom.ref_actions.length < $scope.paramsFirstGame.nb_actions ?
          $scope.questionRoom.ref_actions.length : $scope.paramsFirstGame.nb_actions;
        var nbGoodAnswersActions = 0;
        if(randMaxActions != 0) nbGoodAnswersActions = Math.floor(Math.random() * randMaxActions) + 1;
        var nbBadAnswersActions = $scope.paramsFirstGame.nb_actions - nbGoodAnswersActions;
        console.log(nbBadAnswersActions+ " Type : "+typeof nbBadAnswersActions);

        // Building the good answers array
        var refActionsArray = $scope.questionRoom.ref_actions.slice();
        for (var i = 0; i < nbGoodAnswersActions; i++) {
          var nb = Math.floor(Math.random() * refActionsArray.length);
          var actToAdd = data.actions.filter(function (elmt) {
            if (elmt.image != undefined && elmt.image == refActionsArray[nb])
              return elmt;
          });
          // actToAdd returns an array, so assign it immediately to a var
          $scope.fgGoodAnswers.push(actToAdd[0]);
          refActionsArray.splice(nb, 1);
        }

        // Retrieving all the actions not referenced in the question room
        var actionsArray = data.actions.slice();
        var allBadActionsArray = actionsArray.filter(function (elmt) {
          return $scope.questionRoom.ref_actions.indexOf(elmt.image) === -1;
        });

        // Building the bad answers array
        while ($scope.fgBadAnswers.length < nbBadAnswersActions + nbBadAnswersObjects) {
          nb = Math.floor(Math.random() * allBadActionsArray.length);
          $scope.fgBadAnswers.push(allBadActionsArray[nb]);
          allBadActionsArray.splice(nb, 1);
        }
      } else {
        $scope.paramsFirstGame.nb_actions = 0;
      }

      /******************************************************************/

      // Mixing randomly the good and bad answers
      var answersToMix = $scope.fgBadAnswers.concat($scope.fgGoodAnswers);

      $scope.fgAnswers = [];
      var nbItems = $scope.paramsFirstGame.nb_objects + $scope.paramsFirstGame.nb_actions;
      while($scope.fgAnswers.length < nbItems){
        var nb = Math.floor(Math.random() * answersToMix.length);
        $scope.fgAnswers.push(answersToMix[nb]);
        answersToMix.splice(nb,1);
      }

      console.log("Good : "+JSON.stringify($scope.fgGoodAnswers));
      console.log("Bad : "+JSON.stringify($scope.fgBadAnswers));
      console.log("Answers : "+JSON.stringify($scope.fgAnswers));

    });
  }

  // Checking answer when selecting the main question room in the first game
  $scope.checkMainRoomAnswerFirstGame = function (elem, cadre, text) {

    if($scope.fgSelected !== undefined && $scope.alreadyAnswered.indexOf($scope.fgSelected) === -1){
      if($scope.fgGoodAnswers.indexOf($scope.fgSelected) > -1){
        // success
        removeSelected();
        //ajout du truc vert
        document.getElementById($scope.elem).className += " true";
        document.getElementById($scope.cadre).className += " true-cadre";
        successGamePopupGame1();
      } else if($scope.fgBadAnswers.indexOf($scope.fgSelected) > -1) {
        // fail
        removeSelected();
        failGamePopup();
      }
    }
  };

  // Checking answer when selecting the "other room" button
  $scope.checkOtherRoomAnswerFirstGame = function (elem, cadre, text) {
    if($scope.fgSelected !== undefined && $scope.alreadyAnswered.indexOf($scope.fgSelected) === -1){
      if($scope.fgSelected.ref_rooms.indexOf($scope.questionRoom.image) === -1){
        // success
        removeSelected();
        //ajout du truc vert
        document.getElementById($scope.elem).className += " true";
        document.getElementById($scope.cadre).className += " true-cadre";
        successGamePopupGame1();
      } else if($scope.fgSelected.ref_rooms.length > 1){
        // success
        removeSelected();
        //ajout du truc vert
        document.getElementById($scope.elem).className += " true";
        document.getElementById($scope.cadre).className += " true-cadre";
        successGamePopupGame1();
      } else {
        // fail
        removeSelected();
        failGamePopup();
      }
    }
  };

  // Assigning the selected item in the scope for the first
  $scope.setSelected = function (selectedItem, elem, cadre) {
    $scope.fgSelected = selectedItem;
    $scope.elem = elem;
    $scope.cadre = cadre;

    removeSelected();

    //add selected
    if(document.getElementById($scope.cadre).style.backgroundImage != 'url("img/")') {
      if (!document.getElementById($scope.cadre).classList.contains("true-cadre")) {
        document.getElementById($scope.cadre).className += " item-selected";
      }
    }
  };

  // remove selected border
  function removeSelected() {
    var selected = document.getElementsByClassName("item-selected");
    for(var i = selected.length-1; i >= 0; i--) {
      selected[i].classList.remove("item-selected");
    }
  }

  // Initialize the rooms and the object/action for the second game
  $scope.initSecondGame = function () {
    $http.get('json/datav1.json').success(function(data) {
      $scope.questionList = [];
      var questionsArray = [];
      var staticQuestionArray = [];
      if($scope.paramsSecondGame.play_type === "action"){
        questionsArray = data.actions.slice();
        staticQuestionArray = data.actions.slice();
      } else if($scope.paramsSecondGame.play_type === "object") {
        questionsArray = data.objects.slice();
        staticQuestionArray = data.objects.slice();
      }
      while($scope.questionList.length < $scope.paramsSecondGame.nb_questions){
        var nb = Math.floor(Math.random()*questionsArray.length);
        $scope.questionList.push(questionsArray[nb]);
        questionsArray.splice(nb,1);
        if(questionsArray.length === 0){
          questionsArray = staticQuestionArray.slice();
        }
      }

      $scope.remaining_questions = $scope.paramsSecondGame.nb_questions;
      $scope.current_question = $scope.paramsSecondGame.nb_questions - $scope.remaining_questions + 1;

      nextStepSecondGame();
      console.log(JSON.stringify($scope.questionList));
    });

  };

  // Resets the data for a new game and generates a new set of rooms
  function nextStepSecondGame(){
    $http.get('json/datav1.json').success(function(data) {

      // Retrieves the question room in the question list
      $scope.question = $scope.questionList[$scope.remaining_questions - 1];

      // Selects randomly the solution in the referenced rooms of the question
      var nb = Math.floor(Math.random()*$scope.question.ref_rooms.length);
      $scope.solution = data.rooms.filter(function (elmt) {
        if(elmt.image != undefined && elmt.image == $scope.question.ref_rooms[nb])
          return elmt;
      });

      // Selects all the rooms which are not referenced in the question
      var roomsArray = data.rooms.slice();
      var allBadRoomsArray = roomsArray.filter(function (elmt) {
        return $scope.question.ref_rooms.indexOf(elmt.image) === -1;
      });

      // Randomly choose the bad answers
      $scope.badrooms = [];
      while($scope.badrooms.length < $scope.paramsSecondGame.nb_rooms - 1){
        nb = Math.floor(Math.random()*allBadRoomsArray.length);
        $scope.badrooms.push(allBadRoomsArray[nb]);
        allBadRoomsArray.splice(nb,1);
      }

      // Inserts randomly the solution in the bad answers
      nb = Math.floor(Math.random()*$scope.paramsSecondGame.nb_rooms);
      $scope.badrooms.splice(nb, 0, $scope.solution[0]);
      $scope.rooms = $scope.badrooms.slice();
    });
  }

  // Check if the answer is valid (for the second game)
  $scope.checkAnswerSecondGame = function (answer, elem, cadre, text) {
    if(answer == $scope.solution[0].image){
      successGamePopup();
      $scope.remaining_questions--;
    }
    else {
      //Put a forbidden circle on the image
      document.getElementById(elem).className += " forbidden";
      document.getElementById(cadre).className += " forbidden-cadre";
      //Hide image if the user spam
      if(document.getElementById(elem).classList.length == 3) {
        //document.getElementById(elem).style.display = "none";
        document.getElementById(cadre).classList.add("cadre-none");
        document.getElementById(text).style.opacity = "0";
      }
      failGamePopup();
    }
  };

  /* ========= Global popups ========= */

  function failGamePopup(){
    var alertFailPopup = $ionicPopup.alert({
      title: 'Raté !',
      template: 'Ça irait sûrement mieux dans un autre pièce, non ?',
      okText: 'Continuer',
      cssClass: 'failPopup'
    });
  }

  function endGamePopup() {
    var alertEndPopup = $ionicPopup.alert({
      title: "Fin du jeu",
      template: "Merci d'avoir joué !",
      okText: 'Continuer',
      cssClass: 'endPopup'
    });
    alertEndPopup.then(function(res) {
      location.href = '#/games/menu';
    });
  }

  $scope.showHelp = function(type) {
    $http.get(helpsJsonPath).success(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Les paramètres',
        template: data[type],
        okText: 'Continuer',
      });

    });
  };

  $scope.showGameHelp = function(type, sound) {
    $http.get(helpsJsonPath).success(function(data) {
      var audio;
      var alertPopup = $ionicPopup.show({
        title: 'Les règles du jeu',
        template: data[type],
        okText: 'Continuer',
        cssClass: 'gameHelp',
        buttons: [
          { text: '',
            type: 'button-clear',
            onTap: function(e) {
              // e.preventDefault() will stop the popup from closing when tapped.
              e.preventDefault();
              if(audio) {
                audio.pause();
              } else {
                audio = new Audio('sound/' + sound + '.mp3');
                audio.play();
              }
            }
          },
          { text : 'Continuer',
            type: 'button-positive',
            onTap: function(e) {
              if(audio) {
                audio.pause();
              }
            }}
        ]
      });

    });
  };

  /* ========= Game 2 popups ========= */

  function successGamePopup() {
    var alertSuccessPopup = $ionicPopup.alert({
      title: 'Bien joué !',
      template: 'Vous avez trouvé la bonne pièce !',
      okText: 'Continuer',
      cssClass: 'successPopup'
    });
    alertSuccessPopup.then(function(res) {
      if($scope.remaining_questions == 0){
        endGamePopup();
      } else {
        //Delete all forbidden circles
        var forbidden = document.getElementsByClassName("forbidden");
        var forbiddenCadre = document.getElementsByClassName("forbidden-cadre");
        var length = forbidden.length;
        for(var y = length-1; y >= 0; y--) {
          forbidden[y].classList.remove("forbidden");
          forbiddenCadre[y].classList.remove("forbidden-cadre");
        }
        //Put text visibility back, it override some, but it's just a mock-up...
        var texts = document.getElementsByClassName("tile-text");
        for(var i = 0; i < texts.length; i++) {
          texts[i].style.opacity = "1";
        }
        //Put image visibility back
        var cadres = document.getElementsByClassName("cadre-none");
        for(var i = cadres.length-1; i >= 0; i--) {
          cadres[i].classList.remove("cadre-none");
        }

        $scope.current_question++;
        nextStepSecondGame();
      }
    });
  }

  /* ========= Game 1 popups ========= */

  function successGamePopupGame1() {
    var alertSuccessPopup = $ionicPopup.alert({
      title: 'Bien joué !',
      template: 'Vous avez bien placé cet objet !',
      okText: 'Continuer',
      cssClass: 'successPopup'
    });
    alertSuccessPopup.then(function (res) {
      $scope.alreadyAnswered.push($scope.fgSelected);
      var nbItems = parseInt($scope.paramsFirstGame.nb_objects) + parseInt($scope.paramsFirstGame.nb_actions);
      if($scope.alreadyAnswered.length === nbItems) {
        // fin du jeu !
        endGamePopupGame1();
      }
    })
  }

  function endGamePopupGame1() {
    var alertSuccessPopup = $ionicPopup.alert({
      title: 'Bien joué !',
      template: 'Vous avez placé tous les objets !',
      okText: 'Continuer',
      cssClass: 'successPopup'
    });
    alertSuccessPopup.then(function (res) {
      $scope.remaining_questions--;
      if($scope.remaining_questions === 0){
        endGamePopup();
      } else {
        //Supprime les trucs vert
        var trueElem = document.getElementsByClassName("true");
        var trueCadre = document.getElementsByClassName("true-cadre");
        var length = trueElem.length;
        console.log(trueElem.length);
        for (var y = length - 1; y >= 0; y--) {
          console.log(trueElem[y]);
          trueElem[y].classList.remove("true");
          trueCadre[y].classList.remove("true-cadre");
        }
        $scope.current_question++;
        nextStepFirstGame();
      }
    });
  }

  /*
  function endGamePopupGame1b() {
    var alertSuccessPopup = $ionicPopup.alert({
      title: 'Bien joué !',
      template: 'Vous avez placé tous les objets !',
      okText: 'Continuer',
      cssClass: 'successPopup'
    });
    alertSuccessPopup.then(function (res) {
      $scope.remaining_questions--;
      if($scope.remaining_questions === 0){
        endGamePopup();
      } else {

        //Supprime les trucs vert
        var trueElem = document.getElementsByClassName("true");
        var trueCadre = document.getElementsByClassName("true-cadre");
        var length = trueElem.length;
        console.log(trueElem.length);
        for (var y = length - 1; y >= 0; y--) {
          console.log(trueElem[y]);
          trueElem[y].classList.remove("true");
          trueCadre[y].classList.remove("true-cadre");
        }

        nextStepFirstGame();
      }
    });

  }
  */
});
