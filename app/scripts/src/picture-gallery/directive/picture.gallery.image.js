'use strict';
angular.module('ng-pictureGallery').directive('myGalleryImage', function() {
    return {
        restrict: 'E',
        templateUrl: 'scripts/src/picture-gallery/template/picture-gallery-image.html',
        replace: true,
        require: '^myGallery',
        // scope: {},
        link: function($scope, iElm, iAttrs, mygalleryCtrl) {

            iElm.bind('mouseenter', function() {
                iElm.find('button').css({
                    'visibility': 'visible'
                });
            });

            iElm.bind('mouseleave', function() {
                iElm.find('button').css({
                    'visibility': 'hidden',
                    'border-color': 'black'
                });
            });

            $scope.imageClicked = function(image) {
                mygalleryCtrl.openModal(image);
            };

            $scope.removeImage = function(item) {
                mygalleryCtrl.removeImage(item);
            };
        }
    };
});
