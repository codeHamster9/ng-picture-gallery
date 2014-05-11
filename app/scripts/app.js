'use strict';

angular.module('galleryApp', [
    'ngRoute',
    'ng-pictureGallery'

]).config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'galleryController'
        })
        .otherwise({
            redirectTo: '/'
        });
});
