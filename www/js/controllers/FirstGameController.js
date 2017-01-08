var app = angular.module('application');

app.controller('FirstGameCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"nb_questions":3, "nb_objects":4, "nb_actions":0};

  // TODO : Prendre en compte les actions !

  // Initialize the rooms and the object/action for the second game
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

  function nextStepFirstGame(){
    $http.get('../json/datav1.json').success(function(data) {
      $scope.questionRoom = $scope.questionRoomList[$scope.remaining_questions - 1];

      var nbGoodAnswers = Math.floor(Math.random() * $scope.paramsFirstGame.nb_objects) + 1;
      var nbBadAnswers = $scope.paramsFirstGame.nb_objects - nbGoodAnswers;

      var objectsArray = $scope.questionRoom.ref_objects.slice();
      $scope.solutions = [];
      for(var i = 0 ; i < nbGoodAnswers ; i++){
        var nb = Math.floor(Math.random()*objectsArray.length);
        $scope.solutions.push(objectsArray[nb]);
        objectsArray.splice(nb,1);
      }

    });
  }

  // Check if the answer is valid (for the second game)
  $scope.checkAnswerSecondGame = function (answer) {
    if(answer == $scope.solution.image){
      // TODO : Faire en sorte que les messages d'alerte soient bloquants
      successGamePopup();
      $scope.remaining_questions--;
      if($scope.remaining_questions == 0){
        endGamePopup();
        location.href = '#/games/menu';
      } else {
        nextStepSecondGame();
      }
    } else {
      failGamePopup();
    }
  };

  function failGamePopup(){
    var alertFailPopup = $ionicPopup.alert({
      title: 'Raté patate !',
      template: 'Waaaaa la looooooze'
    });
  }

  function successGamePopup() {
    var alertSuccessPopup = $ionicPopup.alert({
      title: 'Well done',
      template: 'Prends pas la grosse tête hein'
    });
  }

  function endGamePopup() {
    var alertEndPopup = $ionicPopup.alert({
      title: "Fin du jeu",
      template: "Merci d'avoir joué !"
    });
  }

  $scope.showHelp = function(type) {
    $http.get('../json/helps.json').success(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Les paramètres',
        template: data[type]
      });

    });
  };

  $scope.showGameHelp = function(type) {
    $http.get('../json/helps.json').success(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Les règles du jeu',
        template: data[type]
      });

    });
  };

});
