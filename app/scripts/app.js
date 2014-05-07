'use strict';

angular.module('galleryApp', [
    'ngRoute',
    'ng-pictureGallery'

]).config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
         .when('/gallery', {
            templateUrl: 'views/main2.html',
            controller: 'galleryController'
        })
        .otherwise({
            redirectTo: '/'
        });
});