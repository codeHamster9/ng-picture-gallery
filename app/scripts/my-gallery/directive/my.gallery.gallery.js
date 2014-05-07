'use strict';
angular.module('ng-pictureGallery').directive('myGallery', ['$modal', '$mygallery',
    function($modal, $mygallery) {
        return {
            scope: {
                collection: '=?'
            },
            restrict: 'E',
            templateUrl: 'scripts/my-gallery/template/my-gallery.html',            
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
                        templateUrl: 'scripts/my-gallery/template/my-gallery-popup.html',
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
]);
