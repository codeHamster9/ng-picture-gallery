/**
 *  Module
 *
 * Description
 */
'use strict';
angular.module('ng-pictureGallery').controller('galleryController', ['$scope','$mygallery',
  function($scope, $mygallery) {
    $scope.images = [];
    $scope.url = 'http://127.0.0.01:9000/images.json';
  }
]);
