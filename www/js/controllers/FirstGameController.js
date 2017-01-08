var app = angular.module('application');

app.controller('FirstGameCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"nb_questions":3, "nb_objects":4, "nb_actions":0};

  // Initialize the rooms and the object/action for the second game
  $scope.initFirstGame = function () {
    $http.get('../json/datav1.json').success(function(data) {
      $scope.questionList = [];
      var roomsArray = data.rooms.slice();
      while($scope.questionList.length < $scope.paramsFirstGame.nb_questions){
        var nb = Math.floor(Math.random()*roomsArray.length);
        $scope.questionList.push(roomsArray[nb]);
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
      $scope.question = $scope.questionList[$scope.remaining_questions - 1];
      var nb = Math.floor(Math.random()*$scope.question.ref_objects.length);
      $scope.solution = data.objects.find(function (elmt) {
        if(elmt.image != undefined && elmt.image == $scope.question.ref_objects[nb])
          return elmt;
      });

      var roomsArray = data.rooms.slice();
      var filteredRoomsArray = roomsArray.filter(function (elmt) {
        return $scope.question.ref_rooms.indexOf(elmt.image) === -1;
      });

      $scope.badrooms = [];
      while($scope.badrooms.length < $scope.paramsSecondGame.nb_rooms - 1){
        nb = Math.floor(Math.random()*filteredRoomsArray.length);
        $scope.badrooms.push(filteredRoomsArray[nb]);
        filteredRoomsArray.splice(nb,1);
      }

      nb = Math.floor(Math.random()*$scope.paramsSecondGame.nb_rooms);
      $scope.badrooms.splice(nb, 0, $scope.solution)
      $scope.rooms = $scope.badrooms.slice();
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

});
