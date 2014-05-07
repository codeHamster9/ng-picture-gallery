'use strict';
/**
 *  Module my.gallery 1.0.0
 *   1.4.14
 *
 * by idan sagi
 */

angular.module("my.gallery.tpls", ["template/gallery/my-gallery.html", "template/gallery/my-gallery-image.html", "template/gallery/my-gallery-popup.html"]);
angular.module('ng-pictureGallery', ['ui.bootstrap',"my.gallery.tpls"]).service('$mygallery', ['$http', '$q',
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
            sessionStorage.$mygallery = angular.toJson(data);
        };

        this.restoreState = function() {
            return angular.fromJson(sessionStorage.$mygallery);
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
]).directive('myGallery', ['$modal', '$mygallery',
    function($modal, $mygallery) {
        return {
            scope: {
                collection: '=?'
            },
            restrict: 'E',
            templateUrl: 'template/gallery/my-gallery.html',
            replace: true,
            link: function($scope, iElm, iAttrs, controller) {

                if (angular.isUndefined($scope.collection))
                    $scope.collection = [];

                var originCollection = $scope.collection;

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
                });


                if (iAttrs.hasOwnProperty('url') && !iAttrs.hasOwnProperty('collection')) {
                    $mygallery.getImages(iAttrs.url).then(function(data) {
                        $scope.collection = originCollection = data;
                    });
                }

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
                            }, 1000, 0);
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
                        templateUrl: 'template/gallery/my-gallery-popup.html',
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
                    $mygallery.saveState(originCollection);
                });
            }
        };
    }
]).directive('myGalleryImage',
    function() {
        return {
            restrict: 'E',
            templateUrl: 'template/gallery/my-gallery-image.html',
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
).directive('fallbacksrc', function() {
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

angular.module("template/gallery/my-gallery.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/gallery/my-gallery.html",
            "    <div class=\"gallery\">\n" +
            "     <div class=\"gallery-ribbon\">\n" +
            "       <div class=\"gallery-ribbon-controls\">\n" +
            "         <h1>Image Gallery widget</h1>\n" +
            "         <select ng-model='pageSize' ng-options=\"page for page in pageSizes\"></select>\n" +
            "         <input type=\"search\" class=\"gallery-searchbox\" ng-model=\"searchText\">\n" +
            "         <select ng-model=\"sortType\" ng-options=\"st.value as st.name for st in sortTypes\"></select>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "    <div class=\"gallery-image-container\">\n" +
            "        <my-gallery-image ng-repeat=\"image in collection | orderBy:sortType:false | startFrom:currentPage*pageSize | limitTo: pageSize\" ></my-gallery-image>\n" +
            "    </div>\n" +
            "    <div class=\"gallery-footer\">\n" +
            "       <div class=\"footer-controls\">\n" +
            "        <button ng-disabled=\"currentPage==0\" ng-click=\"currentPage=currentPage-1\">Back</button>\n" +
            "        {{currentPage+1}}/{{pages}}\n" +
            "        <button ng-disabled=\"currentPage==pages-1\" ng-click=\"currentPage=currentPage+1\">Next</button>\n" +
            "       </div>\n" +
            "    </div>\n" +
            " </div> ");
    }
]);

angular.module("template/gallery/my-gallery-image.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/gallery/my-gallery-image.html",
            "<div class=\"image-frame\" ng-click=\"imageClicked(image)\">\n" +
            "    <p class=\".image-title\">{{image.title}}</p>\n" +
            "    <img class=\"gallery-image\" ng-src={{image.url}} fallbacksrc=\"http://google.com/favicon.ico\">\n" +
            "    <button class=\"close-btn\" ng-click=\"removeImage(image)\"></button>\n" +
            "    <p class=\"image-date\">{{image.date | date:'short'}}</p>\n" +
            "</div>");
    }
]);

angular.module("template/gallery/my-gallery-popup.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/gallery/my-gallery-popup.html",
            "<div class=\"modal-header\">\n" +
            "    <p>{{ image.title }}</p>\n" +
            "</div>\n" +
            "<div class=\"modal-body\">\n" +
            "    <img ng-src={{image.url}}>\n" +
            "</div>\n" +
            "<div class=\"modal-footer\">\n" +
            "    <button ng-click=\"back()\">Back</button>\n" +
            "    <input type=\"checkbox\"  ng-model=\"slideShow\" ng-change=\"slideShowToggle()\"><p>Auto Cycle</p></input>\n" +
            "    <button ng-click=\"next()\">Next</button>\n" +
            "</div>\n" +
            "");
    }
]);
