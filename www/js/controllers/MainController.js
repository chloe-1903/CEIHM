var app = angular.module('application');

app.controller('MainCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {};
  $scope.paramsSecondGame = {"nb_questions":3, "nb_rooms":4};

  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
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

  function nextStepSecondGame(){
    $http.get('../json/datav1.json').success(function(data) {
      $scope.question = $scope.questionList[$scope.remaining_questions - 1];
      var nb = Math.floor(Math.random()*$scope.question.ref_rooms.length);
      $scope.solution = data.rooms.find(function (elmt) {
        if(elmt.image != undefined && elmt.image == $scope.question.ref_rooms[nb])
          return elmt;
      });

      var roomsArray = data.rooms.slice();
      var allBadRoomsArray = roomsArray.filter(function (elmt) {
        return $scope.question.ref_rooms.indexOf(elmt.image) === -1;
      });

      $scope.badrooms = [];
      while($scope.badrooms.length < $scope.paramsSecondGame.nb_rooms - 1){
        nb = Math.floor(Math.random()*allBadRoomsArray.length);
        $scope.badrooms.push(allBadRoomsArray[nb]);
        allBadRoomsArray.splice(nb,1);
      }

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
        document.getElementById(cadre).style.display = "none";
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


  $scope.showGameHelp = function(type) {
    $http.get('../json/helps.json').success(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Les règles du jeu',
        template: data[type],
        okText: 'Continuer',
      });

    });
  };

});
