var app = angular.module('application');

app.controller('MainCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"nb_questions":3, "nb_rooms":4};
  $scope.paramsSecondGame = {};

  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
  };

  // Initialize the rooms and the object/action for the first game
  $scope.initFirstGame = function () {
    $http.get('../json/datav1.json').success(function(data) {

      // TODO : Changer pour que ce soit pas en dur !!!!

      $scope.questionList = [];
      var objectsArray = data.objects.slice();
      while($scope.questionList.length < $scope.paramsFirstGame.nb_questions){
        var nb = Math.ceil(Math.random()*objectsArray.length);
        $scope.questionList.push(objectsArray[nb]);
        objectsArray.splice(nb,1);
      }

      $scope.remaining_questions = $scope.paramsFirstGame.nb_questions;

      nextStepFirstGame();
    });

  };

  function nextStepFirstGame(){
    $http.get('../json/datav1.json').success(function(data) {
      $scope.question = $scope.questionList[$scope.remaining_questions];
      var nb = Math.ceil(Math.random()*$scope.question.ref_rooms.length);
      $scope.solution = data.rooms.find(function (elmt) {
        if(elmt.image != undefined && elmt.image == $scope.question.ref_rooms[nb])
          return elmt;
      });

      var roomsArray = data.rooms.slice();
      var filteredRoomsArray = roomsArray.filter(function (elmt) {
        return $scope.solution.ref_rooms.indefOf(elmt) === -1;
      });

      $scope.badrooms = [];
      while($scope.badrooms.length < $scope.paramsFirstGame.nb_rooms - 1){
        nb = Math.ceil(Math.random()*filteredRoomsArray.length);
        $scope.badrooms.push(filteredRoomsArray[nb]);
        filteredRoomsArray.splice(nb,1);
      }

      nb = Math.ceil(Math.random()*$scope.paramsFirstGame.nb_rooms);
      $scope.rooms = $scope.badrooms.concat($scope.solution);

    });
  }

  // Check if the answer is valid (for the first game)
  $scope.checkAnswerFirstGame = function (answer) {
    if(answer == $scope.solution.image){
      // TODO : Message de succès
      alert("Youpi un alert tout moche pour dire que c'est gagné !");
      $scope.remaining_questions--;
      if($scope.remaining_questions == 0){
        alert("Fin du jeu !");
        location.href = '#/';
      } else {
        $scope.initFirstGame();
      }
    } else {
      alert("T'es mauvais !");
    }
  };

  $scope.showHelp = function(type) {
    $http.get('../json/helps.json').success(function(data) {
      console.log(type);
      var alertPopup = $ionicPopup.alert({
         title: 'Les paramètres',
         template: data[type]
       });

    });
  };

});
