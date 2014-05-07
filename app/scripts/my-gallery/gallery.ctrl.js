/**
 *  Module
 *
 * Description
 */
'use strict';
angular.module('ng-pictureGallery').controller('galleryController', ['$mygallery',
  function($scope, $mygallery) {
    $scope.images = [];
    $scope.url = 'http://192.168.0.103:9000/images.json';
  }
]);
