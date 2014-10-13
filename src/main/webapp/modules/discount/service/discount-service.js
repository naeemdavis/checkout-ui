angular.module('checkout.discount')
    .factory('DiscountService', ['$resource', function ($resource) {
        return $resource('checkout-service/checkout/discount', {}, {
            login: {
                method: 'POST',
                isArray: false
            }
        });
    }]);