var app = angular.module('application');

app.controller('MainCtrl', function($scope, $http) {

  $scope.paramsFirstGame = {"nb_questions":3};
  $scope.paramsSecondGame = {};

  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
  };

  // Initialize the rooms and the object/action for the first game
  $scope.initFirstGame = function () {
    $http.get('../json/datav1.json').success(function(data) {

      // TODO : Changer pour que ce soit pas en dur !!!!
      $scope.question = data.objects[0];
      $scope.solution = $scope.question.ref_rooms[0];
      $scope.badrooms = data.rooms.slice(1,4);
      $scope.rooms = $scope.badrooms.concat($scope.solution);

      if($scope.remaining_questions == 0 || $scope.remaining_questions == undefined)
        $scope.remaining_questions = $scope.paramsFirstGame.nb_questions;

    });
  };

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

});
