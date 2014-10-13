function DiscountCtrl($scope, DiscountService, $state, $rootScope,TimeoutService) {
    $scope.login = function() {
       DiscountService.discount(
                "",
                {   "code" : this.code,
                    "name" : this.name,
                    "price" : this.price
                });
    };
}