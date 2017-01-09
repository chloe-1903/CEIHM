var app = angular.module('application');

app.controller('MainCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"objects_active": true, "actions_active": false, "nb_objects":3, "nb_actions":1, "text_descr": true, "voc_descr": false, "nb_questions":3, "nb_try":2};
  $scope.paramsSecondGame = { "play_type" : "action", "nb_rooms":4, "text_descr": true, "voc_descr": false, "nb_questions":3, "nb_try":2};


  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
  };

  // TODO : Prendre en compte les actions !

  // Initialize the rooms and the object/action for the first game
  $scope.initFirstGame = function () {
    $http.get('../json/datav1.json').success(function(data) {
      $scope.questionRoomList = [];
      var roomsArray = data.rooms.slice();
      while($scope.questionRoomList.length < $scope.paramsFirstGame.nb_questions){
        var nb = Math.floor(Math.random()*roomsArray.length);
        $scope.questionRoomList.push(roomsArray[nb]);
        roomsArray.splice(nb,1);
        if(roomsArray.length === 0){
          roomsArray = data.rooms.slice();
        }
      }

      $scope.remaining_questions = $scope.paramsFirstGame.nb_questions;
      nextStepFirstGame();
    });

  };

  // Resets the data for a new game and generates a new set of objects/actions
  function nextStepFirstGame(){
    $scope.fgSelected = undefined;
    $scope.alreadyAnswered = [];

    $http.get('../json/datav1.json').success(function(data) {
      // Retrieves the question room in the question list
      $scope.questionRoom = $scope.questionRoomList[$scope.remaining_questions - 1];

      // Defining the number of good and bad answers randomly (according to the number of objects defined and the actual referenced objects)
      var randMax = $scope.questionRoom.ref_objects.length < $scope.paramsFirstGame.nb_objects ?
        $scope.questionRoom.ref_objects.length : $scope.paramsFirstGame.nb_objects;
      var nbGoodAnswers = Math.floor(Math.random() * randMax) + 1;
      var nbBadAnswers = $scope.paramsFirstGame.nb_objects - nbGoodAnswers;

      // Building the good answers array
      var refObjectsArray = $scope.questionRoom.ref_objects.slice();
      $scope.fgGoodAnswers = [];
      for(var i = 0 ; i < nbGoodAnswers ; i++){
        var nb = Math.floor(Math.random()*refObjectsArray.length);
        console.log(JSON.stringify(refObjectsArray));
        var objToAdd = data.objects.find(function (elmt) {
          if(elmt.image != undefined && elmt.image == refObjectsArray[nb])
            return elmt;
        });
        $scope.fgGoodAnswers.push(objToAdd);
        refObjectsArray.splice(nb,1);
      }

      // Retrieving all the objects not referenced in the question room
      var objectsArray = data.objects.slice();
      var allBadObjectsArray = objectsArray.filter(function (elmt) {
        return $scope.questionRoom.ref_objects.indexOf(elmt.image) === -1;
      });

      // Building the bad answers array
      $scope.fgBadAnswers = [];
      while($scope.fgBadAnswers.length < nbBadAnswers){
        nb = Math.floor(Math.random()*allBadObjectsArray.length);
        $scope.fgBadAnswers.push(allBadObjectsArray[nb]);
        allBadObjectsArray.splice(nb,1);
      }

      // Mixing randomly the good and bad answers
      var answersToMix = $scope.fgBadAnswers.concat($scope.fgGoodAnswers);
      $scope.fgAnswers = [];
      while($scope.fgAnswers.length < $scope.paramsFirstGame.nb_objects){
        var nb = Math.floor(Math.random() * answersToMix.length);
        $scope.fgAnswers.push(answersToMix[nb]);
        answersToMix.splice(nb,1);
      }
    });
  }

  // Checking answer when selecting the main question room in the first game
  $scope.checkMainRoomAnswerFirstGame = function (elem, cadre, text) {

    if($scope.fgSelected !== undefined && $scope.alreadyAnswered.indexOf($scope.fgSelected) === -1){
      if($scope.fgGoodAnswers.indexOf($scope.fgSelected) > -1){
        // success
        $scope.alreadyAnswered.push($scope.fgSelected);
        alert("Yes !");
      } else if($scope.fgBadAnswers.indexOf($scope.fgSelected) > -1) {
        // fail
        alert("Noooo");
      }
    }

    if($scope.alreadyAnswered.length === $scope.paramsFirstGame.nb_objects){
      // fin du jeu !
      alert("Well done !");
      $scope.remaining_questions--;
      if($scope.remaining_questions === 0){
        alert("Finished !");
        location.href = '#/games/menu';
      } else {
        nextStepFirstGame();
      }
    }
  };

  // Checking answer when selecting the "other room" button
  $scope.checkOtherRoomAnswerFirstGame = function (elem, cadre, text) {
    if($scope.fgSelected !== undefined && $scope.alreadyAnswered.indexOf($scope.fgSelected) === -1){
      if($scope.fgSelected.ref_rooms.indexOf($scope.questionRoom.image) === -1){
        // success
        $scope.alreadyAnswered.push($scope.fgSelected);
        alert("Yes !");
      } else if($scope.fgSelected.ref_rooms.length > 1){
        // success
        $scope.alreadyAnswered.push($scope.fgSelected);
        alert("Yes !");
      } else {
        // fail
        alert("Noooo");
      }
    }

    if($scope.alreadyAnswered.length === $scope.paramsFirstGame.nb_objects){
      // fin du jeu !
      alert("Well done !");
      $scope.remaining_questions--;
      if($scope.remaining_questions === 0){
        alert("Finished !");
        location.href = '#/games/menu';
      } else {
        nextStepFirstGame();
      }
    }
  };

  // Assigning the selected item in the scope for the first
  $scope.setSelected = function (selectedItem) {
    $scope.fgSelected = selectedItem;
  };

  // Initialize the rooms and the object/action for the second game
  $scope.initSecondGame = function () {
    $http.get('../json/datav1.json').success(function(data) {
      $scope.questionList = [];
      var objectsArray = data.objects.slice();
      while($scope.questionList.length < $scope.paramsSecondGame.nb_questions){
        var nb = Math.floor(Math.random()*objectsArray.length);
        $scope.questionList.push(objectsArray[nb]);
        objectsArray.splice(nb,1);
        if(objectsArray.length === 0){
          objectsArray = data.objects.slice();
        }
      }

      $scope.remaining_questions = $scope.paramsSecondGame.nb_questions;

      nextStepSecondGame();
    });

  };

  // Resets the data for a new game and generates a new set of rooms
  function nextStepSecondGame(){
    $http.get('../json/datav1.json').success(function(data) {

      // Retrieves the question room in the question list
      $scope.question = $scope.questionList[$scope.remaining_questions - 1];

      // Selects randomly the solution in the referenced rooms of the question
      var nb = Math.floor(Math.random()*$scope.question.ref_rooms.length);
      $scope.solution = data.rooms.find(function (elmt) {
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
      $scope.badrooms.splice(nb, 0, $scope.solution);
      $scope.rooms = $scope.badrooms.slice();
    });
  }

  // Check if the answer is valid (for the second game)
  $scope.checkAnswerSecondGame = function (answer, elem, cadre, text) {
    if(answer == $scope.solution.image){
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

  function failGamePopup(){
    var alertFailPopup = $ionicPopup.alert({
      title: 'Raté !',
      template: 'Ça irait sûrement mieux dans un autre pièce, non ?',
      okText: 'Continuer',
      cssClass: 'failPopup'
    });
  }

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

        nextStepSecondGame();
      }
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
    $http.get('../json/helps.json').success(function(data) {
      var alertPopup = $ionicPopup.alert({
         title: 'Les paramètres',
         template: data[type],
         okText: 'Continuer',
       });

    });
  };


  $scope.showGameHelp = function(type, sound) {
    $http.get('../json/helps.json').success(function(data) {
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
                audio = new Audio('../sound/' + sound + '.mp3');
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

});
