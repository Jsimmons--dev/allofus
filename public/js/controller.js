var socialMediaApp = angular.module('socialMediaApp', ["firebase"]);

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
