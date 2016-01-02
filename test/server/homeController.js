function homeController($scope) {
  $scope.counterResult = 0;

  $scope.incrementCounter = function () {
    $scope.counterResult++;
  };

  $scope.registration = {};
  $scope.registrationResult = 'Not Yet Registered';

  $scope.register = function () {
    $scope.registrationResult = 'You have registered for ' + $scope.registration.firstName + ' ' + $scope.registration.lastName
      + ', aged ' + $scope.registration.age + ', living in ' + $scope.registration.state + ' with a ' + $scope.registration.residentStatus + ' residential status.'
      + ' They would ' + ($scope.registration.marketing ? '' : 'not') + ' like marketing materials. Notes: ' + $scope.registration.notes;
    console.log($scope.registration);
  };

  $scope.sampleRegistration = function () {
    $scope.registration.firstName = 'Joe';
    $scope.registration.lastName = 'Bloggs';
    $scope.registration.age = 21;
    $scope.registration.state = 'WA';
    $scope.registration.marketing = true;
    $scope.registration.residentStatus = 'visa';
    $scope.registration.notes = 'N/A';
  };

  $scope.orders = [
    {
      orderNumber: '0001', customerNumber: '4993', itemNumber: '2379', description: 'Pair of Socks', amount: '$9.99'
    },
    {
      orderNumber: '0002', customerNumber: '4993', itemNumber: '9080', description: 'Cycling Shoes', amount: '$159.99'
    },
    {
      orderNumber: '0003', customerNumber: '4829', itemNumber: '7878', description: 'Cycling Shirt', amount: '$59.00'
    }
  ];

  $scope.orderResult = '';
  $scope.deleteOrder = function (orderNumber) {
    $scope.orderResult = 'You really want to delete order #' + orderNumber + '?';
  };
  $scope.changeOrder = function (orderNumber, amount) {
    $scope.orderResult = 'You really want to update order #' +orderNumber + ' with a new amount of ' + amount + '?';
  };
  $scope.selectOrder = function (orderNumber) {
    $scope.orderResult = 'You selected order #' + orderNumber;
  };


}
