var socialMediaApp = angular.module('socialMediaApp', ["ngRoute", "firebase", "ui.bootstrap"]);


//routing happens here
socialMediaApp.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/landing', {
            templateUrl: '/templates/landing.html',
            controller: 'landingController'
        })
        .when('/profile', {
            templateUrl: '/templates/profile.html',
            controller: 'profileController'
        })
        .when('/profile/:id', {
            templateUrl: '/templates/profile-view.html',
            controller: 'profileViewController'
        })
        .when('/signup', {
            templateUrl: '/templates/signup.html',
            controller: 'signupController'
        })
        .otherwise({
            redirectTo: "/landing"
        });

}]);


//this service handles all profile getting and setting
socialMediaApp.service('profileService', function ($firebaseObject) {

    var profileService = this;

    this.base = new Firebase("https://allofus.firebaseio.com");

    //reference to the users in the firebase
    this.users = new Firebase("https://allofus.firebaseio.com/users/");

    //get the profile object associated with the clientID
    this.getProfile = function (email, callback) {
        this.users.child(email)
            .once("value", function (friend) {
                callback(friend.val());
            });
    };

    this.createUser = function (email, password, callback) {
        this.base.createUser({
            email: email,
            password: password
        }, function (error, userData) {
            if (error) {
                callback(error);
            } else {
                callback(userData);
            }
        });
    };

    this.searchForUser = function (email, callback) {
        this.users.orderByChild("email")
            .startAt(email)
            .endAt(email)
            .once("value", function (user) {
                callback(user.val());
            });
    }

    this.addFriend = function (userRef, email) {
        profileService.userIdByEmail(email, function (friendID) {
            if (friendID !== null) {

                profileService.users.child(friendID)
                    .once("value", function (user) {
                        userRef.child("friends/" + friendID)
                            .set({
                                priority: 0,
                                username: user.val()
                                    .username,
                                uid: user.key()
                            });
                    });
                userRef.once("value", function (user) {
                    profileService.users.child(friendID + "/friends/" + userRef.key())
                        .set({
                            priority: -2,
                            username: user.val()
                                .username,
                            uid: user.key()
                        });
                });
            }
        });
    }

    this.userIdByEmail = function (email, callback) {
        this.searchForUser(email, function (id) {
            if (id !== null) {
                callback(Object.keys(id)[0]);
            } else {
                callback(null);
            }
        });
    }

    this.userObjectByEmail = function (email, callback) {
        this.searchForUser(email, function (id) {
            this.users.child(Object.keys(id)[0])
                .once("value", function (user) {
                    callback(user.val());
                });
        });
    }

    this.post = function (userRef, newPost) {
        userRef.child("posts")
            .push({
                body: newPost
            });
    }
});

socialMediaApp.controller('profileViewController', function ($scope, $firebaseObject, profileService, $location, $route, $routeParams) {
    //reference to the users in the firebase
    user = profileService.base.getAuth();
    if (user === null) {
        $location.path('/landing');
        $route.reload();
    } else {
        profileService.base.child("users/" + $routeParams.id)
            .once("value", function (user) {
                $scope.$apply(function () {
                    $scope.otherUser = user.val()
                });
            });
        profileService.base.child("users/" + user.uid)
            .once("value", function (user) {
                $scope.$apply(function () {
                    $scope.user = user.val();
                });
            });
    }
});
socialMediaApp.controller('signupController', function ($scope, $firebaseObject, profileService, $location, $route) {
    //reference to the users in the firebase
    var users = new Firebase("https://allofus.firebaseio.com/users/");

    profileService.base.unauth();
    console.log(profileService.base.getAuth());

    $scope.status = "signup is easy!";

    $scope.signup = function (email, password, user) {
        profileService.createUser(email, password, function (info) {
            if (info.code === undefined) {
                users.child(info.uid)
                    .set(user);
                $location.path('/profile');
                $route.reload();
            } else {
                if (info.code === "EMAIL_TAKEN") {
                    $scope.$apply(function () {
                        $scope.status = "user with that email already exists!";
                    });
                }
            }
        });
    }
});

socialMediaApp.controller('landingController', function ($scope, $firebaseObject, profileService, $location, $route) {
    var info = new Firebase("https://allofus.firebaseio.com/info");
    $firebaseObject(info)
        .$bindTo($scope, "info");
    $scope.outer = {
        "background-color": "#A1E078"
    };

    $scope.checkSignin = function (email, password) {
        profileService.base.authWithPassword({
            email: email,
            password: password
        }, function (error, authData) {
            if (error) {
                if (error.code === "INVALID_EMAIL") {
                    $scope.$apply(function () {
                        $scope.status = "No such user";
                    });
                }
                if (error.code === "INVALID_PASSWORD") {
                    $scope.$apply(function () {
                        $scope.status = "Incorrect password";
                    });
                }
                console.log("Login Failed!", error);
            } else {
                $location.path('/profile');
                $route.reload();
            }
        });
    };
});

socialMediaApp.controller('profileController', function ($scope, $firebaseObject, profileService, $location, $route,$firebaseArray) {
    user = profileService.base.getAuth();
    if (user === null) {
        $location.path('/landing');
        $route.reload();
    } else {
        profileService.base.child("users/" + user.uid)
            .on("value", function (user) {
                $scope.$apply(function () {
                    $scope.userData = user.val()
                });
            });
    }
		$scope.friends = $firebaseArray(profileService.base.child("users/" + user.uid).child("friends"));

		$scope.posts = $firebaseArray(profileService.base.child("users/"+user.uid).child("posts"));

    $scope.goToProfile = function (id) {
        console.log(id);
        $location.path('/profile/' + id);
        $route.reload();
    }

    $scope.addFriend = function (email) {
        profileService.addFriend(profileService.users.child(user.uid), email);
    }

    $scope.post = function (newPost) {
        profileService.post(profileService.users.child(user.uid), newPost);
    }

    profileService.users.child(user.uid)
        .once("value", function (user) {
            $scope.$apply(function () {
                $scope.user = user.val();
            });
        });

});

socialMediaApp.filter('friendsFilter', function () {
    return function (items, priority) {
        var result = [];
        angular.forEach(items, function (value, index) {
            if (value.priority === priority) {
                result.push(value);
            }
        });
        return result;
    }
});

socialMediaApp.filter('mutualFilter', function () {
    return function (items, otherFriends) {
        var result = [];
        var otherFriendsArray = [];
        angular.forEach(otherFriends, function (value, index) {
            otherFriendsArray.push(value.username);
        });
        angular.forEach(items, function (value, index) {
            if (otherFriendsArray.indexOf(value.username) !== -1) {
                result.push(value);
            }
        });
        return result;
    }
});
