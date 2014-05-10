/**
 *  Module
 *
 * Description
 */
'use strict';
angular.module('ng-pictureGallery').controller('galleryController', ['$scope','gallerySrv',
  function($scope, gallerySrv) {
    $scope.images = [];
    $scope.url = 'http://127.0.0.01:9000/images.json';
  }
]);
