// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('application', ['ionic']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'templates/home.html'
  })
  .state('paramsFirst', {
    url: '/params/game/1',
    templateUrl: 'templates/paramsFirstGame.html'
  })
  .state('paramsSecond', {
    url: '/params/game/2',
    templateUrl: 'templates/paramsSecondGame.html'
  })
  .state('menuparams',{
    url: '/params/menu',
    templateUrl:'templates/menuParameters.html'
  })
  .state('menugames',{
    url: '/games/menu',
    templateUrl:'templates/menuPlayGame.html'
  })
  .state('firstgame',{
    url: '/games/1',
    templateUrl:'templates/firstGame.html'
  })
  .state('secondgame',{
    url:'/games/2',
    templateUrl:'templates/secondGame.html'
  });

  $urlRouterProvider.otherwise('/');
});

// Platform specific configuration
app.config(function($ionicConfigProvider) {
  $ionicConfigProvider.navBar.alignTitle('center');

});