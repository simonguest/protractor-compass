# protractor-compass

An intuitive, action-based, chainable helper library for [Protractor](http://protractortest.org).

## Usage

Compass supports many fundamental page actions out of the box, such as navigating, clicking, setting, and validating values on a page:

```js
var compass = require('protractor-compass');
compass.navigate('/signin')
  .set({
    username: 'Simon',
    password: 'Compass'
  })
  .click('Sign in')
  .waitFor('Welcome, Simon')
  .click('Orders')
  .validate({
    orderCount: 1
  });
```

### Composability

You can use Compass to compose and chain common actions used throughout your tests:

```js
compass.checkCustomerCount = function (email, password, count) {
  return compass.navigate('/signin')
    .set({username: username, password: password})
    .click('Sign in')
    .waitFor('Welcome, ' + username)
    .validate({
       customerCount: count
    });
};
compass.navigate('/')
  .checkCustomerCount('Simon', 'Password', 10)
  .checkCustomerCount('Joe', 'Password', 5)
  .checkCustomerCount('Bob', 'Password', 9)
  .click('Sign Out');
```

### Selectors

Compass can automatically locate elements based on element id, name, ng-model, text, placeholder text, or even sibling text (e.g. text alongside a radio button):

```js
compass.click('clickMeButton'); // Clicks on a button with the id of clickMeButton
compass.click('anotherButton'); // Clicks on a button with the name of anotherButton
compass.set({
  'amount': 4.50
  }); // Sets the value of an input with ng-model="amount" to 4.50
compass.hover('All Products'); // Hovers over a menu item called "All Products"
compass.set({
  'Enter Amount in USD': '$10.99'
  }); // Sets the input designated with a placeholder text of "Enter Amount in USD" to "$10.99"
compass.set({
  'Residental Address': true
  }); // Sets the value of a checkbox with text "Residential Address" to true (checked)
```

Compass also dereferences labels that have been marked with a "for" attribute. Imagine this username field on a page:

```html
<label for="firstName">First Name</label>
<input type="text" id="firstName">
```

The input field can now be set as follows:

```js
compass.set({'Username': 'Simon'});
```

### Setting Values

Values can be set on the page using the set method. Compass will automatically detect the correct element (input, select, checkbox, radio buttons) and set the value accordingly. True and false values can be used for check boxes and radio buttons.

```js
compass.navigate('/')
  .set({
    'First Name': 'Simon',
    'Last Name': 'Guest',
    'Age': 7,
    'State': 'Washington',
    'Resident': true,
    'Please fill my inbox with more marketing emails': false
  });
```

### Validating Values

Values can be validated using a similar way:

```js
compass.navigate('/')
  .set({
    'Zip Code': '98004'
  })
  .validate({
    'City': 'Bellevue',
    'State': 'Washington'
  });
```

### Validating Select (Drop Down) Values

Using the validate method against a select element will match against the text currently selected. Indexes can be used to validate positions in the drop down list. Wildcards can be used to determine if a value exists in the drop down.

```js
// Check that the selected state is Washington, the first state is Alabama, and that Kentucky is somewhere in the list
compass.navigate('/')
  .validate({
    'State': 'Washington',
    'State(1)': 'Alabama',
    'State(*)': 'Kentucky'
  });
```

### Tables

Compass is also designed to make it simple to write tests that work with tables:

```js
compass.navigate('/')
  .validate({'ordersTable': 5}); // Ensure that there are 5 rows in the table
  .validate({'ordersTable(1,1)': '0001'}) // Ensure that the value of the first row, first column is set to '0001'
  .click('ordersTable(1)'); // Clicks the first row
  .hover({'ordersTable(1,4)'}); // Hover over the element in the 1st row, 4th column
  .set({'ordersTable(3,5)': '$9.99'}); // Will set the value of the third row, fifth column to $9.99
```

### Waiting for Text

Compass will wait for text to appear on the page using the waitFor command:

```js
compass.waitFor('You are signed in.');
```

Multiple arguments can also be passed:

```js
compass.waitFor('You are signed in.', 'Welcome', 'Sign Out'); // Passes if all three are found on the page, otherwise fails
```

By default, Compass will wait for 3000ms before timing out (and failing the test). This can be adjusted by passing a timeout value as an argument:

```js
var compass = require('protractor-compass')({timeout:10000});
compass.waitFor('Sign In'); // Fails if this text is not found on the page within 10 seconds
```

### Vaidating Text Does Not Exist

Often, it can be useful to validate that text does not exist on a page. This can be done using the validateTextNotPresent method:

```js
compass.validateTextNotPresent('Welcome, Simon'); // Fails if this text is found anywhere on the page
compass.validateTextNotPresent('This', 'also', 'works'); // Fails if any of these three words are found on the page
```

### Taking Screenshots

Compass can take a screenshot anywhere in a chain. Simply use the takeScreenshot method and pass the filename as an argument.

```js
compass.click('Register')
  .set({
    'First Name': 'Simon',
    'Last Name': 'Guest',
    'Zip Code': '98004'
  })
  .click('Submit')
  .waitFor('Thank you!')
  .takeScreenshot('capture.png')
  .click('Submit Another')
  .validate({
    'First Name' : ''
  });
```

## Installing

Setup Protractor as per the instructions found on the [Protractor Home Page](http://protractortest.org). Then install Compass:

```
npm i protractor-compass --save-dev
```

You can now use Compass in your tests.

## Testing

Run tests in this project using:

```
npm test
```

The sample page used for testing can be viewed by running:

```
npm start
```

and browsing to http://localhost:3000

## FAQ

Some answers to common questions about Compass:

### Q: Is Compass affiliated with the authors of Protractor and/or Google?

No, it has been developed independently.

### Q: Does Compass work with any other framework apart from Angular/Protractor?

At this time, Compass relies on Protractor, and will only test Angular-based pages. Depending on interest, I might look at putting together a version for React and/or a vanilla version built upon WebDriverJS.

### Q: What is the performance hit of using Compass?

With many helper libraries, there is a performance hit. While care has been taken to minimize, using Compass will certainly be slower than using Protractor directly, or WebDriverJS.

With that said, you may find that the simplicity of writing quick, readable tests might outweigh a few extra milliseconds of test time.

### Q: How do I do an unsupported action using Compass?

Compass is just a helper library that sits alongside Protractor. Just use the regular Protractor/WebDriverJS commands you need instead - or make a pull request to add a feature that you are looking for! 

### Q: Can Compass work with headless environments?

Yes, Compass works well with PhantomJS and has also been tested with CircleCI using ChromeDriver.

### Q: I'm getting a message that "multiple elements were found" - what is this?

Your selector is picking up multiple elements, and will fail by default (instead of just picking one). For example:

```js
compass.click('Cancel');
```

Multiple elements might be detected, especially if there are multiple cancel buttons on the page (for example, when both a dialog and the page behind have a Cancel button). To avoid this, revert back to using the id or name instead:

```js
compass.click('cancelButton');
```

### Q: Can I validate the title of the page using Compass?

Yes, with the following:

```js
compass.validate({
  '(title)': 'Welcome to My Web Page'
  });
```

### Q: Things still aren't working. Is there a way to see what Compass is doing?

Yes, you can enable logging with this command:

```js
var compass = require('protractor-compass')({log:true});
```

### Q: How do I ask Compass to sleep during a test run?

You can use:

```js
compass.sleep(1000);
```

(Although, personally I'm not a fan of pausing tests for a fixed period of time - it's too unpredictable and at best will slow down your tests unnecessarily. I would suggest using the waitFor command instead).

## License

Copyright 2016 Simon Guest

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
