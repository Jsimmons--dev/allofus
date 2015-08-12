var socialMediaApp = angular.module('socialMediaApp', []);

socialMediaApp.controller('profileController',function($scope){
  $scope.profile = {
    'name':'Jess'
  }
});
