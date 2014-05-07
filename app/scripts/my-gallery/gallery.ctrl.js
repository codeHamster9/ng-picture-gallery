/**
 *  Module
 *
 * Description
 */
'use strict';
angular.module('ng-pictureGallery').controller('galleryController', ['$scope','$mygallery',
  function($scope, $mygallery) {
    $scope.images = [];
    $scope.url = 'http://192.168.0.104:9000/images.json';
  }
]);
