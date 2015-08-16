var socialMediaApp = angular.module('socialMediaApp', ["ngRoute","firebase"]);

socialMediaApp.config(['$routeProvider',function($routeProvider){

    $routeProvider
        .when('/landing',{
            templateUrl: '/templates/landing.html',
            controller: 'landingController'
        })
        .when('/profile',{
            templateUrl: '/templates/profile.html',
            controller: 'profileController'
        })
        .otherwise({redirectTo: "/landing"});
        
}]);


socialMediaApp.controller('landingController',function($scope,$firebaseObject){
    var info = new Firebase("https://allofus.firebaseio.com/info");
    $firebaseObject(info).$bindTo($scope,"info");
    console.log("landingController loaded");
});

socialMediaApp.controller('profileController',function($scope,$firebaseObject){       
    var users = new Firebase("https://allofus.firebaseio.com/users");

var onAuthCallback = function(authData) {
  if (!authData) {
    users.authWithOAuthRedirect("github", function (error) {
      console.log("Login Failed!", error);
    });
  }
  else {
    console.log("Authenticated successfully with payload:", authData);
    console.log(authData.github.username);
    var user = users.child(authData.github.username);
    var First = user.child("first");
    console.log(user);
    console.log(First);
    var syncUser = $firebaseObject(user);
    $firebaseObject(user).$bindTo($scope,"user");
    $scope.github = authData.github;
  }
};

// Important: don't request authentication immediately
setTimeout(function() { users.onAuth(onAuthCallback); }, 400);


});
