var checkoutDiscountModule =
	angular.module("checkout.discount", ['ngResource', 'ui.router', 'ui.bootstrap']);

checkoutDiscountModule.config(
        ['$stateProvider', function ($stateProvider) {
                var discount = {
                    name: 'discount',
                    url: '/discount',
                    views: {
                        // the @ signifies that this view is in the root view
                        "applicationview@": {
                            templateUrl: "modules/discount/template/discount.tpl.html",
                            controller: DiscountCtrl
                        }
                    }
                };
                $stateProvider.state(discount);
            }
        ]);
