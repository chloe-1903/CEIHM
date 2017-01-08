var app = angular.module('application');

app.controller('FirstGameCtrl', function($scope, $http, $ionicPopup) {

  $scope.paramsFirstGame = {"nb_questions":3, "nb_objects":4, "nb_actions":0};

  // TODO : Prendre en compte les actions !

  // Initialize the rooms and the object/action for the second game
  $scope.initFirstGame = function () {
    $http.get('../json/datav1.json').success(function(data) {
      console.log("eezf");
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

      var randMax = $scope.questionRoom.ref_objects.length < $scope.paramsFirstGame.nb_objects ?
        $scope.questionRoom.ref_objects.length : $scope.paramsFirstGame.nb_objects;
      var nbGoodAnswers = Math.floor(Math.random() * randMax) + 1;
      var nbBadAnswers = $scope.paramsFirstGame.nb_objects - nbGoodAnswers;

      var refObjectsArray = $scope.questionRoom.ref_objects.slice();
      $scope.fgGoodAnswers = [];
      for(var i = 0 ; i < nbGoodAnswers ; i++){
        var nb = Math.floor(Math.random()*refObjectsArray.length);
        $scope.fgGoodAnswers.push(refObjectsArray[nb]);
        refObjectsArray.splice(nb,1);
      }

      var objectsArray = data.objects.slice();
      var allBadObjectsArray = objectsArray.filter(function (elmt) {
        return $scope.questionRoom.ref_objects.indexOf(elmt.image) === -1;
      });

      $scope.fgBadAnswers = [];
      while($scope.fgBadAnswers.length < nbBadAnswers){
        nb = Math.floor(Math.random()*allBadObjectsArray.length);
        $scope.fgBadAnswers.push(allBadObjectsArray[nb]);
        allBadObjectsArray.splice(nb,1);
      }

      var answersToMix = $scope.fgBadAnswers.concat($scope.fgGoodAnswers);
      $scope.fgAnswers = [];
      while($scope.fgAnswers.length < $scope.paramsFirstGame.nb_objects){
        var nb = Math.floor(Math.random() * answersToMix.length);
        $scope.fgAnswers.push(answersToMix[nb]);
        answersToMix.splice(nb,1);
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
