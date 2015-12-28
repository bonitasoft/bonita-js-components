/* jshint sub:true*/
(function () {
  'use strict';
  angular.module('org.bonitasoft.services.topurl', [])
    .service('manageTopUrl', ['$window', function ($window) {
      var manageTopUrlService = {};

      manageTopUrlService.getCurrentPageToken = function() {
        var pageTokenRegExp = /(^|[&\?])_p=([^&]*)(&|$)/,
          pageTokenMatches = pageTokenRegExp.exec($window.parent.location.hash);

        return Array.isArray(pageTokenMatches) ? pageTokenMatches[2] : '';
      };

      manageTopUrlService.addOrReplaceParam = function (param, paramValue) {

        if (paramValue !== undefined && $window.self !== $window.parent) {

          var pageToken = manageTopUrlService.getCurrentPageToken();

          if (!!$window.parent.location.hash) {

            var paramRegExp  = new RegExp('(^|[&\\?])'+pageToken+param+'=[^&]*(&|$)'),
                paramMatches = $window.parent.location.hash.match(paramRegExp);

            if (!Array.isArray(paramMatches)) {

              var currentHash = $window.parent.location.hash;
              if(paramValue) {
                $window.parent.location.hash += ((currentHash.indexOf('&', currentHash.length - 2) >= 0) ? '' : '&') + pageToken + param + '=' + paramValue;
              }

            } else {

              var paramToSet = '';
              if(paramValue){
                paramToSet = pageToken + param + '=' + paramValue;
              }

              $window.parent.location.hash = $window.parent.location.hash.replace(paramRegExp, '$1'+ paramToSet + '$2');
            }
            return;

          }

          if(paramValue) {
            $window.parent.location.hash = '#' + pageToken + param + '=' + paramValue;
          }

        }
      };

      manageTopUrlService.getCurrentProfile = function () {
        if ($window && $window.parent && $window.parent.location && $window.parent.location.hash) {
          var currentProfileMatcher = $window.parent.location.hash.match(/\b_pf=\d+\b/);
          return Array.isArray(currentProfileMatcher) ? currentProfileMatcher[0] : '';
        }
      };

      manageTopUrlService.getPath = function () {
        return $window.parent.location.pathname;
      };

      manageTopUrlService.getSearch = function () {
        return $window.parent.location.search || '';
      };

      manageTopUrlService.getUrlToTokenAndId = function (id, token) {
        return manageTopUrlService.getPath() + manageTopUrlService.getSearch() + '#?id=' + (id || '') + '&_p=' + (token || '') + '&' + manageTopUrlService.getCurrentProfile();
      };

      /**
       * Update the iframe destination hash
       * @param  {Object} destination Routing configuration for the iframe
       * @return {void}
       */
      manageTopUrlService.goTo = function(destination){

        var params = '&';

        if(angular.isUndefined(destination)) {
          throw new TypeError('You must pass an Object as argument');
        }
        if(typeof destination === 'string'){
          $window.parent.location.hash = '?_p='+ destination+'&' + manageTopUrlService.getCurrentProfile();
          return;
        }
        var prependToken = !angular.isDefined(destination.prependToken) || !!destination.prependToken;

        if(!destination.token){
          throw new Error('You must set a token to define the destination page');
        }

        angular.forEach(destination, function (value, key){
          if(key && value && key !== 'token' && key !== 'prependToken'){
            params += ((prependToken)?destination.token:'') + key + '=' + value + '&';
          }
        });

        // Change the iframe hash only, not the current window hash
        if($window.parent.location.hash !== $window.location.hash) {
          $window.parent.location.hash = '?_p='+ destination.token+'&' + manageTopUrlService.getCurrentProfile() + params;
        }
      };

      //cannot use module pattern or reveling since we would want to mock methods on test
      return manageTopUrlService;
    }]);
})();
