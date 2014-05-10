'use strict';

angular.module('ng-pictureGallery').service('gallerySrv', ['$http', '$q',
  function($http, $q) {

    var sessionStore, that = this;

    this.getImages = function(url) {
      sessionStore = this.restoreState();
      var defered = $q.defer();
      var result;
      if (angular.isUndefined(sessionStore)) {
        $http({
          method: 'GET',
          url: url,
        }).success(function(data, status, headers, config) {
          result = checkData(data);
          if (result.flag) {
            that.saveState(data);
            defered.resolve(data);
          } else console.error('data structure Invalid must be {title:,url:,date:} error at index:', result.index);
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

      var result = {
        flag: true,
        index: undefined
      };

      for (var i = data.length - 1; i >= 0; i--) {
        if (!data[i].hasOwnProperty('title') || !data[i].hasOwnProperty('url') || !data[i].hasOwnProperty('date')) {
          result.flag = false;
          result.index = i;
          break;
        } else data[i].date = new Date(data[i].date).toJSON();
      }
      return result;
    }
  }
]);
