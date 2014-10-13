angular.module('checkout.items')
    .factory('ItemService', ['$resource', function ($resource) {
        return $resource('checkout-service/item/itemlist', {}, {
            getItems : {
                method : 'GET',
                isArray : false
            }
        });
    }]);