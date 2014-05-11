'use strict';
angular.module('ng-pictureGallery').directive('myGallery', ['$modal', 'gallerySrv',
    function($modal, gallerySrv) {
        return {
            scope: {
                collection: '=?'
            },
            restrict: 'E',
            templateUrl: 'scripts/src/picture-gallery/template/picture-gallery.html',
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
                }

                $scope.movePrevious = function() {
                    if (container.scrollLeft > 0)
                        container.scrollLeft -= arrowClickSpacing;

                    if (container.scrollLeft == 0)
                        previousBtn.css('display', 'none');
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
                        templateUrl: 'scripts/src/picture-gallery/template/picture-gallery-popup.html',
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
]);
