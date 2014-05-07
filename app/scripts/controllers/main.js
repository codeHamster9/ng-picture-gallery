'use strict';

angular.module('galleryApp').controller('MainCtrl',['$mygallery',
    function($scope,$mygallery) {

        $scope.images = [];
        $scope.url = 'http://192.168.0.103:9000/images.json';
        
        $mygallery.getImages($scope.url).then(function(data) {
            $scope.images = data;
        });
    }]);
