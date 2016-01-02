require('./server/server');
var compass = require('../lib/index')({log: process.env.LOG ? true : false});

describe('All Tests', function () {

  describe('Selector Tests', function () {

    it('should click on a button based on id and view the result', function () {
      compass.navigate('/')
        .validate({
          counterResult: '0'
        })
        .click('incrementCounter')
        .validate({
          counterResult: '1'
        });
    });

    it('should click on a button based on the name of the button and view the result', function () {
      compass.navigate('/')
        .validate({
          counterResult: '0'
        })
        .click('Increment Counter')
        .validate({
          counterResult: '1'
        });
    });

    it('should support hovering over elements', function () {
      compass.navigate('/')
        .validate({
          counterResult: '0'
        })
        .hover('Increment Hover')
        .validate({
          counterResult: '1'
        });
    });

    it('should return the text value of the button', function () {
      compass.navigate('/')
        .validate({
          incrementCounter: 'Increment Counter'
        });
    });

    it('should click on a row of a table', function(){
      compass.navigate('/')
        .click('ordersTable(1)')
        .validate({
          'orderResult': 'You selected order #0001'
        })
        .click('ordersTable(2)')
        .validate({
          'orderResult': 'You selected order #0002'
        })
        .click('ordersTable(3)')
        .validate({
          'orderResult': 'You selected order #0003'
        });
    });

    it('should click on a button within a table cell using coordinates', function(){
      compass.navigate('/')
        .click('ordersTable(1,6)')
        .validate({
          'orderResult': 'You really want to delete order #0001?'
        })
        .click('ordersTable(2,6)')
        .validate({
          'orderResult': 'You really want to delete order #0002?'
        })
        .click('ordersTable(3,6)')
        .validate({
          'orderResult': 'You really want to delete order #0003?'
        })
    });

  });

  describe('Validation Tests', function () {
    it('should validate the basic types from a form', function () {
      compass.navigate('/')
        .click('Sample Registration')
        .validate({
          'First Name': 'Joe',
          'Last Name': 'Bloggs',
          'Age': '21',
          'State': 'Washington',
          'Send me marketing information': true,
          'Citizen': false,
          'Visa': true,
          'Visitor': false,
          'Notes': 'N/A'
        });
    });

    it('should validate values in a drop down list using ids', function () {
      compass.navigate('/')
        .validate({
          'state(1)': 'Alabama',
          'state(*)': 'Kentucky'
        });
    });

    it('should validate values in a drop down list using labels', function () {
      compass.navigate('/')
        .validate({
          'State(1)': 'Alabama',
          'State(*)': 'Kentucky'
        });
    });

    it('should validate the number of rows in a table', function(){
      compass.navigate('/')
        .validate({
          'ordersTable' : 3
        });
    });

    it('should validate a text-based table cell using coordinates', function(){
      compass.navigate('/')
        .validate({
          'ordersTable(1,1)' : '0001',
          'ordersTable(2,1)' : '0002',
          'ordersTable(3,1)' : '0003'
        });
    });

    it('should validate an input-based table cell using coordinates', function(){
      compass.navigate('/')
        .validate({
          'ordersTable(1,5)' : '$9.99',
          'ordersTable(2,5)' : '$159.99',
          'ordersTable(3,5)' : '$59.00'
        });
    });
  });

  describe('Set Tests', function () {
    it('should set the basic types in a form', function () {
      compass.navigate('/')
        .set({
          'First Name': 'Mary',
          'Last Name': 'Smith',
          'Age': 40,
          'State': 'California',
          'Send me marketing information': true,
          'Citizen': true,
          'Notes': 'Thanks'
        })
        .click('Register')
        .waitFor('You have registered for Mary Smith, aged 40, living in CA with a citizen residential status.')
        .waitFor('They would like marketing materials.', 'Notes: Thanks');
    });

    it('should set and validate select drop downs correctly', function () {
      compass.navigate('/')
        .set({
          'State': 'Hawaii'
        })
        .validate({
          'State': 'Hawaii'
        });
    });

    it('should set and validate checkboxes correctly', function () {
      compass.navigate('/')
        .set({
          'Send me marketing information': false
        })
        .validate({
          'Send me marketing information': false
        })
        .set({
          'Send me marketing information': true
        })
        .validate({
          'Send me marketing information': true
        });
    });

    it('should set fields based on ng-model correctly', function () {
      compass.navigate('/')
        .set({
          'registration.firstName': 'Simon',
          'registration.lastName': 'Guest'
        })
        .validate({
          'First Name': 'Simon',
          'Last Name': 'Guest'
        });
    });

    it('should set fields based on placeholder text, if present', function () {
      compass.navigate('/')
        .set({
          'Your notes go here': 'These are my notes!'
        })
        .validate({
          'notes': 'These are my notes!'
        });
    });

    it('should set the value of an input-based table cell using coordinates', function(){
      compass.navigate('/')
        .set({
          'ordersTable(1,5)' : '$40.00'
        })
        .validate({
          'orderResult' : 'You really want to update order #0001 with a new amount of $40.00?'
        });
    });

  });

  describe('Composition Tests', function () {
    it('Should support composing of tests', function () {
      compass.increment = function () {
        return compass.click('Increment Counter');
      };

      compass.navigate('/')
        .validate({
          counterResult: '0'
        })
        .increment()
        .increment()
        .increment()
        .validate({
          counterResult: '3'
        });
    });
  });

  describe('Page Text Tests', function () {
    it('Should validate that text does not appear on the page', function () {
      compass.navigate('/')
        .validateTextNotPresent('Zombie', 'Alien', 'Spaceship');
    });
  });

  describe('Misc. Tests', function () {
    it('Should validate the correct page title', function () {
      compass.navigate('/')
        .validate({
          '(title)': 'Compass Tests'
        });
    });

    it('Should support a browser refresh', function () {
      compass.navigate('/')
        .click('Increment Counter')
        .validate({
          counterResult: '1'
        })
        .refresh()
        .validate({
          counterResult: '0'
        });
    });

    it('Should take a screenshot', function () {
      compass.navigate('/')
        .takeScreenshot('screenshot.png');
    })
  });

});
