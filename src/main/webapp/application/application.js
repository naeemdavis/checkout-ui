"use strict";

// Declare the application module
var application = angular.module('business', ['pascalprecht.translate','ngCookies', 'ui.router', 'ui.bootstrap','checkout.discount', 'checkout.items']);

/******************************************* INITIALISE APPLICATION SERVICES  ***********************************************/
application.factory('ToastService', function() {

    var ToastServiceInstance = function() {

        var toasts = [];

        this.getToasts = function() {
            return toasts;
        };

        this.addToast = function(type,message,field,clearAll) {
            var toast = {
                "type": type ? type.toLowerCase() : 'info',
                "message": message ? message : "",
                "field" :   field ? field : ""
        };
            if(clearAll === true){
                toasts = [];
            }
            return toasts.push(toast);
        };

        this.hasToasts = function() {
            return toasts.length > 0;
        };

        this.firstToastMessage = function() {
            var message = {};

            if(toasts.length > 0){
                message = toasts[0].message;
            }

            return message;
        };

        this.removeAllToasts = function() {
            toasts = [];
        };

        this.removeToastsForType = function(type) {
            var removed = 0;
            if(toasts!=null){
                for(var i = 0; i < toasts.length; i += 1) {
                      if(toasts[i].type === type) {
                          toasts.splice(i - removed, 1);
                          removed = removed +1;
                      }
                  }
              }
        };

        this.removeToasts = function() {
            toasts = [];
        };


        this.hasToastsForType = function(type) {
            if(toasts!=null){
                for(var i = 0; i < toasts.length; i += 1) {
                      if(toasts[i].type === type) {
                          return true;
                      }
                  }
              }
              return false;
       };

        this.hasErrors = function() {
            return this.hasToastsForType('ERROR');
        };

        this.removeErrors  = function() {
            return this.removeToastsForType('ERROR');
        };

        this.getToastsForType = function(type) {
            var toastsForType = [];
            if(toasts!=null){
                for(var i = 0; i < toasts.length; i += 1) {
                      if(toasts[i].type === type) {
                          toastsForType.push(toasts[i]);
                      }
                  }
              }
              return toastsForType;
        };


       // Returns an array containing only the messages
       this.getMessages = function() {
           var messages = [];
           for(var i = 0; i < toasts.length; i += 1) {
              messages.push(toasts[i].message);
           }
           return messages;
        };

    };
    //Returns the error handler service 'ToastService'
    return new ToastServiceInstance();
});

application.factory('TimeoutService',['$timeout','$state','$translate','ToastService',"$rootScope",function($timeout,$state,$translate,ToastService,$rootScope) {

    var TimeoutServiceInstance = function() {
        var promises = [];
        var TIMEOUT = 300000;

        //semaphore for timeout service functionality
        var timeoutServiceStart = false;

        this.isStarted = function(){
            return timeoutServiceStart;
        };

        this.startService = function(){
            timeoutServiceStart = true;
        };

        this.stopService= function(){
            timeoutServiceStart = false;
            this.cancelTimeouts();
        };


        // Cancel current timeout and create new timeout
        this.refreshTimeout = function() {
            if(timeoutServiceStart){
                this.cancelTimeouts();

                // Promise to execute the specified function after the timeout duration.
                var promise = $timeout(function() {
                    $translate('TIMEOUT.NOTICE').then(
                            function (translatedValue) {
                                $rootScope.LoggedInUser = null;
                                ToastService.removeAllToasts();
                                ToastService.addToast('info',translatedValue,'');
                                $rootScope.clearCookies();
                                $state.go('discount');
                            });
                },
                TIMEOUT);

                promises.push(promise);
            }
        };

        // Cancel the promises before they are actioned
        this.cancelTimeouts = function() {
            if(promises!=null){
                for(var i = 0; i < promises.length; i += 1) {
                   $timeout.cancel(promises[i]);
                  }
              }
        };



    };
    //Returns the error handler service 'ErrorHandler'
    return new TimeoutServiceInstance();
}]);

/******************************************* INITIALISE SECURITY INTERCEPTORS ***********************************************/
application.factory(
        'authenticationRequiredHttpInterceptor', ["$q", "$rootScope",
            function ($q, $rootScope) {
                return {

                    //Successful response
                    'response': function(response) {

                        $rootScope.toastService.removeErrors();

                        $rootScope.timeoutService.refreshTimeout();

                        return response || $q.when(response);
                    },

                    'responseError': function (response) {

                        // Clear all existing messages and add the response errors
                        $rootScope.toastService.removeAllToasts();

                        $rootScope.timeoutService.refreshTimeout();

                        var resErrors = null;
                        if(response.data != null){
                            //multiple errors
                            if(response.data.errors!=null){
                                resErrors = response.data.errors;
                            }
                            //single error
                            else{
                                resErrors = [response.data[0]];
                            }
                        }
                        if(resErrors){
                            for(var i = 0; i < resErrors.length; i += 1){
                                $rootScope.toastService.addToast('error',resErrors[i].message,'',resErrors[i].field);
                            }
                        }
                        else if (response.status === 404) {
                            $rootScope.translateService('404.API.DOWN').then(
                            function (translatedValue) {
                                $rootScope.toastService.addToast('error',translatedValue,'','');
                           });
                       }

                        if (response.status === 401) {
                            $rootScope.$broadcast("event:authentication-required");
                        }

                        return $q.reject(response);
                    }
                };
            }
        ]);

//Configure the interceptor
application.config(['$urlRouterProvider','$httpProvider', function($urlRouterProvider,$httpProvider) {

    $httpProvider.interceptors.push('authenticationRequiredHttpInterceptor');

    $urlRouterProvider.otherwise("/discount");
} ]);

/******************************************* CONFIGURE I18N  ***********************************************/
application.config(['$translateProvider',function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'assets/i18n/',
        suffix: '.json'
      });

    $translateProvider.preferredLanguage('en');

  }]);

/************************************************* APPLICATION STATE CONFIG ***************************************************/
application.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

	var application = {
            name: 'application',
            abstract: true,
            url: "/app",
            onEnter: function ($rootScope, $state, ProfileService) {
                ProfileService.get("",
                         function(res, headers) {
                     $rootScope.LoggedInUser = res;
                 },

                 function(res) {
                     $rootScope.clearCookies();
                     $state.go("discount");
                 }
                 );
            },
            views: {
                // the @ signifies that this view is in the rootview rather than a
                // child view of accounts. (after the @ is the state name)
                "applicationview@": {
                    templateUrl: function (stateParams) {
                        return "application/template/main.tpl.html";
                    },
                    controller: "ApplicationCtrl"
                }
            }
        };

        $stateProvider.state(application);

}]);

/***************************** INITIALISATION COMPLETE CALLBACK - set root level objects ************************************/
application.run(function($rootScope,$translate,ToastService,TimeoutService,$cookieStore,$http) {
    $rootScope.toastService = ToastService;
    $rootScope.translateService = $translate;
    $rootScope.timeoutService = TimeoutService;
    $rootScope.cookieStore = $cookieStore;

    $http.get('assets/resources/color.json').success(function (data) {
        $rootScope.colors = data;
      });

    $rootScope.clearCookies = function() {
        $cookieStore.remove('XSRF-TOKEN');
    };

});

/******************************************************* DIRECTIVES **********************************************************/
application.directive('rxfPageHeaderTitle', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'application/directives/rxf-page-header-title.tpl.html'
      };
    });

application.directive('rxfAddFirstView', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'application/directives/rxf-add-first-view.tpl.html'
      };
    });

application.directive('rxfAddButtonView', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'application/directives/rxf-add-button-view.tpl.html'
      };
    });

application.directive('rxfCurrencyEuroView', function() {
    return {
        restrict: 'E',
        transclude: false,
        templateUrl: 'application/directives/rxf-currency-euro-view.tpl.html'
      };
    });

application.directive('rxfCurrencySterlingView', function() {
    return {
        restrict: 'E',
        transclude: false,
        templateUrl: 'application/directives/rxf-currency-sterling-view.tpl.html'
      };
    });

/******************************************************* FILTERS **********************************************************/
application.filter('formatNsc',function(){
    return function(text){
        var result = text + '';
        if(result && result.length === 6){
            return result.substr(0,2) + '-' +  result.substr(2,2) + '-' +  result.substr(4,2);
        }
        return result;
    };
});

application.filter('numberFixedLen', function () {
    return function (n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = ''+num;
        while (num.length < len) {
            num = '0'+num;
        }
        return num;
    };
});

application.filter('colorvalue', function ($rootScope) {
    return function (colorAlias) {

        var hexValue = $rootScope.colors[colorAlias];

        if(hexValue){
            return hexValue;
        }

        return $rootScope.colors["DEFAULT"];
    };
});

application.filter('addEllipsis', function () {
    return function (text, limit) {
        if(text.length>limit) {
            return text.substring(0, limit-3) + '...';
        }
        if(text.length<=limit) {
            return text;
        }
    };
});
