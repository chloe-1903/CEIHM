var app = angular.module('application');

app.controller('MainCtrl', function($scope) {

  // Should exit the app but not sure it actually works...
  $scope.exitApp = function () {
    ionic.Platform.exitApp();
  }
});
