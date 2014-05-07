/**
*  Module
*
* Description
*/
angular.module('ng-pictureGallery').directive('fallbacksrc', function() {
    return {

        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    iElement.bind('error', function() {
                        angular.element(this).attr("ng-src", iAttrs.fallbacksrc);
                    });
                }
            };
        }
    };
});