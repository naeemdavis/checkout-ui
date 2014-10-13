var checkoutItemModule =
	angular.module("checkout.items", ['ngResource', 'ui.router', 'ui.bootstrap']);

checkoutItemModule.config(
        ['$stateProvider', function ($stateProvider) {
                var items = {
                    name: 'items',
                    url: '/items',
                    views: {
                        // the @ signifies that this view is in the root view
                        "applicationview@": {
                            templateUrl: "modules/item/template/items.tpl.html",
                            controller: ItemsCtrl
                        }
                    }
                };
                $stateProvider.state(items);
            }
        ]);
