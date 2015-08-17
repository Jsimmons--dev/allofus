var socialMediaApp = angular.module('socialMediaApp', ["ngRoute","firebase","ui.bootstrap"]);

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
        .when('/signup',{
            templateUrl: '/templates/signup.html',
            controller: 'signupController'
        })
        .otherwise({redirectTo: "/landing"});
        
}]);


socialMediaApp.controller('landingController',function($scope,$firebaseObject){
    var info = new Firebase("https://allofus.firebaseio.com/info");
    $firebaseObject(info).$bindTo($scope,"info");
    console.log("landingController loaded");
    $scope.outer = {
    
        "background-color":"#A1E078"

    };
});

socialMediaApp.controller('profileController',function($scope,$firebaseObject){       
    var user;
    var users = new Firebase("https://allofus.firebaseio.com/users");

    var checkIfExists = function(userId,auth) {
        users.child(userId).once('value',function(snap){
            var exists = (snap.val() !== null);
            createIfNew(userId,exists,auth);
        }); 
    };

    var createIfNew = function(userId,exists,auth) {
        if(!exists) {
            var newUser = {};
            newUser[userId] = {
                username:auth.github.username,
            };
          users.update(newUser);  
        }
    };

    var loadFriendsList = function(user,friends){
        user.child("friends").once("value",function(snapshot){
            $.each(snapshot.val(),function(index,friend){
                var friendref = users.child(friend);
                friendref.once("value",function(snap){
                    $scope.friends.push(snap.val().username);
                    $scope.$apply();
                }); 
            }); 
        });
    };

    var onAuthCallback = function(authData) {
        if (!authData) {
            users.authWithOAuthRedirect("github", function (error) {
                console.log("Login Failed!", error);
            },{scopes:"user,user:follow"});
        }
        else {
            checkIfExists(authData.github.id,authData);
            
            user = users.child(authData.github.username);
            $firebaseObject(user).$bindTo($scope,"user");

            $scope.github = authData.github;

            $scope.friends =[];
            loadFriendsList(user,$scope.friends);
        }

    };

    var findUserId = function(username,callback){
        $.get("http://api.github.com/users/"+username,function(data){
            callback(data.id);
        });
    };

    var requestFriend = function(username){
      findUserId(username,function(id){
          user.child("friends").push(id);
      });
    };
    $scope.requestFriend = requestFriend;
    // Important: don't request authentication immediately
    setTimeout(function() { users.onAuth(onAuthCallback); }, 400);


});
