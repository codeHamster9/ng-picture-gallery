'use strict';
/**
 *  Module my.gallery 1.0.0
 *   1.4.14
 *
 * by idan sagi
 */

angular.module("ng-pictureGallery.tpls", ["picture-gallery.html", "picture-gallery-image.html", "picture-gallery-popup.html"]);
angular.module('ng-pictureGallery', ['ui.bootstrap', "ng-pictureGallery.tpls"]).service('gallerySrv', ['$http', '$q',
    function($http, $q) {

        var sessionStore, that = this;

        this.getImages = function(url) {
            sessionStore = this.restoreState();
            var defered = $q.defer();
            if (angular.isUndefined(sessionStore)) {
                $http({
                    method: 'GET',
                    url: url,
                }).success(function(data, status, headers, config) {
                    if (checkData(data)) {
                        that.saveState(data);
                        defered.resolve(data);
                    } else console.error('data structure Invalid must be {title:,url:,date:}');
                }).error(function(data, status, headers, config) {
                    console.error('GET images failed from : ', url);
                });
            } else defered.resolve(sessionStore);
            return defered.promise;
        };

        this.saveState = function(data) {
            sessionStorage.gallerySrv = angular.toJson(data);
        };

        this.restoreState = function() {
            return angular.fromJson(sessionStorage.gallerySrv);
        };

        function checkData(data) {

            var flag = true;
            for (var i = data.length - 1; i >= 0; i--) {
                if (!data[i].hasOwnProperty('title') || !data[i].hasOwnProperty('url') || !data[i].hasOwnProperty('date')) {
                    flag = false;
                    break;
                } else data[i].date = new Date(data[i].date).toJSON();
            }
            return flag;
        }
    }
]).controller('galleryController', ['$scope', 'gallerySrv',
    function($scope, gallerySrv) {
        $scope.images = [];
        $scope.url = 'http://127.0.0.01:9000/images.json';
    }
]).directive('myGallery', ['$modal', 'gallerySrv',
    function($modal, gallerySrv) {
        return {
            scope: {
                collection: '=?'
            },
            restrict: 'E',
            templateUrl: 'picture-gallery.html',
            replace: true,
            link: function($scope, iElm, iAttrs, controller) {

                if (angular.isUndefined($scope.collection))
                    $scope.collection = [];

                var originCollection = $scope.collection,
                    slideshowInterval = 1000,
                    arrowClickSpacing = 125,
                    totalWidth = 0,
                    nextBtn, previousBtn, container, strip;

                container = iElm[0].getElementsByClassName('gallery-image-container')[0];
                nextBtn = angular.element(iElm[0].getElementsByClassName('nextBtn'));
                previousBtn = angular.element(iElm[0].getElementsByClassName('previousBtn'));

                $scope.currentPage = 0;
                $scope.pages = 10;
                $scope.pageSizes = +iAttrs.pagesizes || [5, 10, 15, 20];
                $scope.pageSize = +iAttrs.defaultsize || 10;
                $scope.sortType = 'title';
                $scope.searchText = '';
                $scope.sortTypes = [{
                    name: 'By Date',
                    value: 'date'
                }, {
                    name: 'By Title',
                    value: 'title'
                }];


                $scope.$watch('searchText', function(newValue, oldValue) {
                    if (newValue !== '')
                        $scope.collection = filterByText(newValue);
                    else if (angular.isDefined(originCollection))
                        $scope.collection = originCollection;

                    totalPages($scope.collection.length);
                    $scope.currentPage = 0;
                });

                $scope.$watch('pageSize', function(newValue, oldValue) {
                    $scope.currentPage = Math.floor(($scope.currentPage * oldValue) / newValue);
                    totalPages($scope.collection.length);

                    container.scrollLeft = 0;

                    totalWidth = iElm[0].querySelector('.image-frame').clientWidth * ($scope.pageSize - 10);

                    if ($scope.pageSize > 10) {
                        nextBtn.css('display', 'block');
                    } else if ($scope.pageSize <= 10) {
                        nextBtn.css('display', 'none');
                    }
                });


                if (iAttrs.hasOwnProperty('url') && !iAttrs.hasOwnProperty('collection')) {
                    gallerySrv.getImages(iAttrs.url).then(function(data) {
                        $scope.collection = originCollection = data;
                    });
                }

                $scope.moveNext = function() {
                    if (container.scrollLeft < totalWidth)
                        container.scrollLeft += arrowClickSpacing;
                    previousBtn.css('display', 'block');
                };

                $scope.movePrevious = function() {
                    if (container.scrollLeft > 0)
                        container.scrollLeft -= arrowClickSpacing;

                    if (container.scrollLeft === 0)
                        previousBtn.css('display', 'none');
                };

                function totalPages(length) {
                    if (length === 1)
                        return 10;
                    $scope.pages = Math.ceil(length / $scope.pageSize);
                }

                function filterByText(str) {
                    return originCollection.filter(function(item) {
                        return item.title.toLowerCase().match(str.toLowerCase());
                    });
                }

                var ModalInstanceCtrl = function($scope, $modalInstance, items, $interval) {

                    $scope.image = items.selected;
                    $scope.slideShow = false;
                    var stop;

                    var index = items.collection.indexOf(items.selected);

                    $scope.slideShowToggle = function() {

                        if (angular.isDefined(stop)) {
                            $interval.cancel(stop);
                            stop = undefined;
                        } else
                            stop = $interval(function() {
                                $scope.next();
                            }, slideshowInterval, 0);
                    };

                    $scope.next = function() {
                        if (index + 1 > items.collection.length - 1)
                            index = 0;
                        else index++;
                        $scope.image = items.collection[index];
                    };

                    $scope.back = function() {
                        if (index - 1 < 0)
                            index = items.collection.length - 1;
                        else index--;
                        $scope.image = items.collection[index];
                    };

                    $scope.ok = function() {
                        $modalInstance.close();
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                };

                $scope.open = function(image) {

                    var modalInstance = $modal.open({
                        templateUrl: 'picture-gallery-popup.html',
                        controller: ModalInstanceCtrl,
                        backdrop: true,
                        resolve: {
                            items: function() {
                                return {
                                    selected: image,
                                    collection: $scope.collection.sort(mySort)
                                };
                            }
                        }
                    });
                };

                function mySort(a, b) {
                    var prop = $scope.sortType,
                        nameB = a[prop].toLowerCase(),
                        nameA = b[prop].toLowerCase();
                    if (nameA < nameB)
                        return 1;
                    if (nameA > nameB)
                        return -1;
                    return 0;
                }

                $scope.$on('imageClicked', function(event, message) {
                    $scope.open(message);
                });

                $scope.$on('removeClicked', function(event, message) {
                    var itemToRemove = $scope.collection.indexOf(message);
                    $scope.collection.splice(itemToRemove, 1);
                    originCollection.splice(itemToRemove, 1);
                    totalPages($scope.collection.length);
                    gallerySrv.saveState(originCollection);
                });
            }
        };
    }
]).directive('myGalleryImage',
    function() {
        return {
            restrict: 'E',
            templateUrl: 'picture-gallery-image.html',
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
    }
).directive('fallbacksrc',
    function() {
        return {

            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                        iElement.bind('load', function() {
                            angular.element(this).attr("ng-src", iAttrs.fallbacksrc);
                        });
                    }
                };
            }
        };
    }).filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});

angular.module("picture-gallery.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("picture-gallery.html", "<div class=\"gallery\"> <div class=\"gallery-ribbon gallery-component\"> <div class=\"gallery-ribbon-controls\"> <h1>Image Gallery widget</h1> <select ng-model='pageSize' ng-options=\"page for page in pageSizes\"></select> <input type=\"search\" class=\"gallery-searchbox\" ng-model=\"searchText\"> <select ng-model=\"sortType\" ng-options=\"st.value as st.name for st in sortTypes\"></select> </div> </div> <div class=\"gallery-image-container gallery-component\"> <button class=\"arrowBtn previousBtn\" ng-click=\"movePrevious()\"></button> <div class=\"gallery-image-strip\"> <my-gallery-image ng-repeat=\"image in filteredCollection = (collection | orderBy:sortType:false | startFrom:currentPage*pageSize | limitTo: pageSize)\"> </my-gallery-image> </div> <button class=\"arrowBtn nextBtn\" ng-click=\"moveNext()\"></button> </div> <div class=\"gallery-footer gallery-component\"> <div class=\"footer-controls\"> <button ng-disabled=\"currentPage==0\" ng-click=\"currentPage=currentPage-1\">Back</button> <span>{{currentPage+1}}/{{pages}}</span> <button ng-disabled=\"currentPage==pages-1\" ng-click=\"currentPage=currentPage+1\">Next</button> </div> </div></div>");
    }
]);

angular.module("picture-gallery-image.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("picture-gallery-image.html", "<div class=\"image-frame\" ng-click=\"imageClicked(image)\">\n <button class=\"close-btn\" ng-click=\"removeImage(image)\"></button>\n <p class=\"image-title\">{{image.title}}</p>\n <img class=\"gallery-image\" ng-src={{image.url}} fallbacksrc=\"http://google.com/favicon.ico\">\n <p class=\"image-date\">{{image.date | date:'short'}}</p>\n</div>");
    }
]);

angular.module("picture-gallery-popup.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("picture-gallery-popup.html", "<div class=\"modal-header\">\n <b>{{ image.title }}</b>\n</div>\n<div class=\"modal-body\">\n <img ng-src={{image.url}}>\n</div>\n<div class=\"modal-footer\">\n <button ng-click=\"back()\">Back</button>\n <input type=\"checkbox\" ng-model=\"slideShow\" ng-change=\"slideShowToggle()\">\n <p>Auto Cycle</p>\n </input>\n <button ng-click=\"next()\">Next</button>\n</div>");
    }
]);
