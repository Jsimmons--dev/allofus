var socialMediaApp = angular.module('socialMediaApp', ["firebase"]);

socialMediaApp.controller('profileController',function($scope,$firebaseAuth){        
	var users = new Firebase("https://allofus.firebaseio.com/users");

	var auth = $firebaseAuth(users);
	auth.$authWithOAuthPopup("github").then(function(authData) {
		console.log("Logged in as:",authData.uid);
		$scope.authData = authData;
		console.log(authData);
	}).catch(function(error) {
	console.log("Authentication Failed:",error);
	});

	//var corey = users.child('cshan-dev');
	//var coreyFirst = corey.child('first');
	//$firebaseObject(corey).$bindTo($scope,"corey");
		});
