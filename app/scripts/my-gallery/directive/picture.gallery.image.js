'use strict';
angular.module('ng-pictureGallery').directive('myGalleryImage', function() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/my-gallery/template/picture-gallery-image.html',
            replace: true,
            link: function($scope, iElm, iAttrs, controller) {

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
                    $scope.$emit('imageClicked', image);
                };

                $scope.removeImage = function(item) {
                    $scope.$emit('removeClicked', item);
                };
            }
        };
    });
