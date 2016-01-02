var fs = require('fs');
module.exports = function (options) {
  if (!options) options = {};

  var log = {
    message: function (message) {
      if (options.log === true) {
        //TODO: Find a nicer way of adding this function to the webdriver flow apart from sleep(0)?
        browser.sleep(0).then(function () {
          console.log(message);
        });
      }
    }
  };

  var ElementTypes = {
    Unknown: -1,
    Button: 0,
    Anchor: 1,
    Label: 2,
    Table: 3,
    Select: 4,
    Input: 5,
    Checkbox: 6,
    TextArea: 7,
    Radio: 8,
    Title: 9,
    TableCell: 10,
    TableRow: 11,
    Paragraph: 12,
    H1: 13,
    H2: 14,
    H3: 15,
    H4: 16,
    H5: 17,
    H6: 18
  };

  var getElementType = function (element, selector) {
    var deferred = protractor.promise.defer();
    element.getOuterHtml().then(function (html) {
      if (html.toLowerCase().indexOf('<button') === 0) deferred.fulfill(ElementTypes.Button);
      if (html.toLowerCase().indexOf('<a') === 0) deferred.fulfill(ElementTypes.Anchor);
      if (html.toLowerCase().indexOf('<label') === 0) deferred.fulfill(ElementTypes.Label);
      if (html.toLowerCase().indexOf('<table') === 0) deferred.fulfill(ElementTypes.Table, selector);
      if (html.toLowerCase().indexOf('<td') === 0) deferred.fulfill(ElementTypes.TableCell, selector);
      if (html.toLowerCase().indexOf('<select') === 0) deferred.fulfill(ElementTypes.Select);
      if (html.toLowerCase().indexOf('<input') === 0) {
        if (html.toLowerCase().indexOf('type="checkbox"') > 0) deferred.fulfill(ElementTypes.Checkbox);
        if (html.toLowerCase().indexOf('type="radio"') > 0) deferred.fulfill(ElementTypes.Radio);
        // default input type
        deferred.fulfill(ElementTypes.Input);
      }
      if (html.toLowerCase().indexOf('<textarea') === 0) deferred.fulfill(ElementTypes.TextArea);
      if (html.toLowerCase().indexOf('<p') === 0) deferred.fulfill(ElementTypes.Paragraph);
      if (html.toLowerCase().indexOf('<h1') === 0) deferred.fulfill(ElementTypes.H1);
      if (html.toLowerCase().indexOf('<h2') === 0) deferred.fulfill(ElementTypes.H2);
      if (html.toLowerCase().indexOf('<h3') === 0) deferred.fulfill(ElementTypes.H3);
      if (html.toLowerCase().indexOf('<h4') === 0) deferred.fulfill(ElementTypes.H4);
      if (html.toLowerCase().indexOf('<h5') === 0) deferred.fulfill(ElementTypes.H5);
      if (html.toLowerCase().indexOf('<h6') === 0) deferred.fulfill(ElementTypes.H6);

      deferred.fulfill(ElementTypes.Unknown);
    });
    return deferred;
  };

  var parseSelector = function (name) {
    var selector = {};
    selector.name = name;
    selector.id = false;
    selector.hasSpace = false;
    selector.params = [];
    if (name.indexOf('#') === 0) {
      selector.name = name.replace('#', '');
      selector.id = true;
    }
    if (name.indexOf(' ') > 0) {
      selector.hasSpace = true;
    }
    if (name.indexOf('(') > 0) {
      var regExp = /\(([^)]+)\)/;
      var matches = regExp.exec(name);
      if (matches.length > 0) {
        selector.name = name.substring(0, name.indexOf('('));
        selector.params = matches[1].split(',');
      }
    }
    return selector;
  };

  var locateElementInDOM = function (name) {
    var selector = parseSelector(name);
    var deferred = protractor.promise.defer();
    log.message('Searching for ' + selector.name);
    var promises = [];
    promises.push(element.all(by.xpath("//*[@id|@name|@ng-model='" + selector.name + "']")));
    promises.push(element.all(by.xpath("//*[normalize-space(text()|@placeholder|following-sibling::text()[position()=1 and normalize-space(.)])='" + selector.name + "']")));
    protractor.promise.all(promises).then(function (results) {
      var found = false;
      results.map(function (result) {
        log.message('Checking results...');
        if (result.length === 1) {
          found = true;
          log.message('Found element matching: ' + selector.name);
          deferred.fulfill({base: result[0], selector: selector});
        } else {
          if (result.length > 1) {
            found = true;
            log.message('Multiple elements with same match of ' + selector.name);
            deferred.reject('Multiple elements with same match of ' + selector.name + '?');
          }
        }
      });
      if (found === false) {
        log.message('No element found matching ' + selector.name);
        deferred.reject('No element found matching ' + selector.name);
      }
    });
    return deferred;
  };

  var findElement = function (name) {
    var deferred = protractor.promise.defer();
    // check for special types
    if (name.toLowerCase() === '(title)') {
      var result = {};
      result.type = ElementTypes.Title;
      deferred.fulfill(result);
      return deferred;
    }

    locateElementInDOM(name).then(function (el) {
      getElementType(el.base).then(function (type) {
          var result = {};
          result.base = el.base;
          result.selector = el.selector;
          result.type = type;
          switch (type) {
            case ElementTypes.Button:
              el.base.getText().then(function (text) {
                result.text = text;
                deferred.fulfill(result);
              });
              break;
            case ElementTypes.Label:
              el.base.getAttribute('for').then(function (forElement) {
                log.message('Label has reference to: ' + forElement);
                // pass any parameters while derefencing the element
                forElement = (el.selector.params.length > 0 ? forElement + '(' + el.selector.params + ')' : forElement);
                findElement(forElement).then(function (element) {
                  deferred.fulfill(element);
                });
              });
              break;
            case ElementTypes.Table:
              switch (el.selector.params.length) {
                case 0:
                  result.type = ElementTypes.Table;
                  element.all(by.xpath("//table[@id='" + el.selector.name + "']/tbody/tr")).then(function (elements) {
                    result.rows = elements.length;
                    deferred.fulfill(result);
                  });
                  break;
                case 1:
                  result.type = ElementTypes.TableRow;
                  result.base = element(by.xpath("//table[@id='" + el.selector.name + "']/tbody/tr[" + el.selector.params[0] + "]"));
                  deferred.fulfill(result);
                  break;
                case 2:
                case 3:
                  result.base = element(by.xpath("//table[@id='" + el.selector.name + "']/tbody/tr[" + el.selector.params[0] + "]/td[" + el.selector.params[1] + "]/*"));
                  // dereference the cell to find out the type of the cell
                  element.all(by.xpath("//table[@id='" + el.selector.name + "']/tbody/tr[" + el.selector.params[0] + "]/td[" + el.selector.params[1] + "]/*")).then(function (elements) {
                    if (elements.length != 1) {
                      result.type = ElementTypes.TableCell;
                      result.base = element(by.xpath("//table[@id='" + el.selector.name + "']/tbody/tr[" + el.selector.params[0] + "]/td[" + el.selector.params[1] + "]"));
                      deferred.fulfill(result);
                    } else {
                      getElementType(result.base).then(function (type) {
                        result.type = type;
                        if (result.selector.params.length == 3) {
                          // curry the additional param to the inner element
                          var additional = result.selector.params[2];
                          result.selector.params = [];
                          result.selector.params.push(additional);
                        } else {
                          // just clear the params
                          result.selector.params = [];
                        }
                        deferred.fulfill(result);
                      });
                    }
                  });
                  break;
                default:
                  result.base = element(by.xpath("//table[@id='" + el.selector.name + "']"));
                  deferred.fulfill(result);
                  break;
              }
              break;
            default:
              deferred.fulfill(result);
          }
        }
      );
    });
    return deferred;
  };

  return {
    ElementTypes: ElementTypes,
    navigate: function (url) {
      log.message('Navigating to ' + url);
      browser.get(url);
      return this;
    },
    click: function (name) {
      findElement(name).then(function (element) {
        if (element) {
          log.message('Clicking on ' + name);
          element.base.click();
        }
      });
      return this;
    },
    hover: function (name) {
      findElement(name).then(function (element) {
        if (element) {
          browser.driver.actions().mouseMove(element.base).perform();
        }
      });
      return this;
    },
    set: function (fields) {
      if (arguments.length !== 1) throw 'set method requires one argument';
      var promises = [];
      Object.keys(fields).map(function (key) {
        promises.push(findElement(key).then(function (el) {
          if (el) {
            switch (el.type) {
              case ElementTypes.Input:
              case ElementTypes.TextArea:
                log.message('Clearing and Typing... "' + fields[key] + '"');
                el.base.clear();
                el.base.sendKeys(fields[key]);
                break;
              case ElementTypes.Select:
                switch (el.selector.params.length) {
                  case 0:
                    log.message('Validating select/drop down contains ' + fields[key]);
                    expect(el.base.getText()).toContain(fields[key]);
                    log.message('Selecting ' + fields[key] + ' by text from select dropdown');
                    el.base.all(by.xpath('option[.="' + fields[key] + '"]')).click();
                    break;
                  case 1:
                    log.message('Selecting ' + fields[key] + ' by value from select dropdown');
                    el.base.all(by.css('option[value="' + fields[key] + '"]')).click();
                    break;
                  default:
                    throw 'Too many parameters for a drop down box';
                    break;
                }
                break;
              case ElementTypes.Checkbox:
                log.message('Setting checkbox to ' + fields[key]);
                el.base.isSelected().then(function (isClicked) {
                  if (isClicked != fields[key]) {
                    el.base.click();
                  }
                });
                break;
              case ElementTypes.Radio:
                log.message('Setting radio value to ' + fields[key]);
                if (fields[key] != true) throw 'can only set radio buttons to true (you turn them off by clicking on other things)';
                el.base.click();
                break;
              case ElementTypes.Table:
              case ElementTypes.TableRow:
                throw 'Not sure how to set the values of a table or table row. Maybe try setting the cell individually instead?';
                break;
              case ElementTypes.TableCell:
                throw 'Not sure how to set the value of a table cell - I just found text in the HTML';
                break;
              default:
                throw 'Not sure how to set the value an unknown type';
                break;
            }
          }
        }));
      });
      protractor.promise.all(promises).then(function () {
        log.message('Set promise chain completed');
      });
      return this;
    },
    validate: function (fields) {
      if (arguments.length !== 1) throw 'validate method requires one argument';
      var promises = [];
      Object.keys(fields).map(function (key) {
        promises.push(findElement(key).then(function (el) {
          if (el) {
            switch (el.type) {
              case ElementTypes.Input:
              case ElementTypes.TextArea:
                if (el.selector.params.length === 0) {
                  log.message('Validating text input contains ' + fields[key]);
                  expect(el.base.getAttribute('value')).toEqual(fields[key]);
                } else {
                  log.message('Validating text(' + el.selector.params[0] + ') input contains ' + fields[key]);
                  expect(el.base.getAttribute(el.selector.params[0])).toEqual(fields[key]);
                }
                break;
              case ElementTypes.Select:
                if (el.selector.params.length === 0) {
                  log.message('Validating select/drop down is set to ' + fields[key]);
                  expect(el.base.$('option:checked').getText()).toEqual(fields[key]);
                } else {
                  if (el.selector.params[0] === '*') {
                    log.message('Validating select/drop down contains ' + fields[key]);
                    expect(el.base.getText()).toContain(fields[key]);
                  } else {
                    log.message('Validating select/drop down (option ' + el.selector.params[0] + ') contains ' + fields[key]);
                    el.base.all(by.tagName('option')).then(function (elements) {
                      expect(elements[parseInt(el.selector.params[0])].getText()).toEqual(fields[key]);
                    })
                  }
                }
                break;
              case ElementTypes.Title:
                log.message('Validating title is set to ' + fields[key]);
                expect(browser.getTitle()).toEqual(fields[key]);
                break;
              case ElementTypes.Table:
                log.message('Validating there are ' + fields[key] + ' row(s) in the table');
                expect(el.rows).toEqual(fields[key]);
                break;
              case ElementTypes.TableRow:
                throw "You can only click on a table row, not validate it";
                break;
              case ElementTypes.TableCell:
                log.message("Validating table cell is set to " + fields[key]);
                expect(el.base.getText()).toEqual(fields[key]);
                break;
              case ElementTypes.Radio:
              case ElementTypes.Checkbox:
                log.message("Validating checkbox/radio button is set to " + fields[key]);
                if ((fields[key] === true) || (fields[key] === false)) {
                  expect(el.base.isSelected()).toEqual(fields[key]);
                } else {
                  throw "Checkboxes and radio buttons can only be set to true or false values";
                }
                break;
              case ElementTypes.Paragraph:
              case ElementTypes.H1:
              case ElementTypes.H2:
              case ElementTypes.H3:
              case ElementTypes.H4:
              case ElementTypes.H5:
              case ElementTypes.H6:
              case ElementTypes.Button:
              case ElementTypes.Anchor:
                log.message("Validating text-based element is set to " + fields[key]);
                expect(el.base.getText()).toEqual(fields[key]);
                break;
              default:
                log.message('Not sure how to validate the value of an unknown type');
                throw "Not sure how to validate the value of an unknown type";
                break;
            }
          }
        }));
      });
      protractor.promise.all(promises).then(function () {
        log.message('Validate promise chain completed');
      });
      return this;
    },
    get: function (name) {
      var deferred = protractor.promise.defer();
      findElement(name).then(function (element) {
        if (element) deferred.fulfill(element);
      });
      return deferred;
    },
    waitFor: function () {
      var timeout = (options.timeout || 3000);
      var EC = protractor.ExpectedConditions;
      var args = Array.prototype.slice.call(arguments, 0);
      args.map(function (arg) {
        log.message('Waiting for "' + arg + '"');
        browser.wait(EC.textToBePresentInElement(element(by.tagName('body')), arg), timeout, 'Did not find text: "' + arg + '"');
      });
      return this;
    },
    //TODO: is there a better function name than this one?
    validateTextNotPresent: function () {
      browser.waitForAngular();
      var args = Array.prototype.slice.call(arguments, 0);
      var body = element(by.tagName('body')).getText();
      args.map(function (arg) {
        expect(body).not.toContain(arg);
      });
      return this;
    },
    takeScreenshot: function (filename) {
      browser.takeScreenshot().then(function (data) {
        stream = fs.createWriteStream(filename);
        stream.on('finish', function () {
          log.message('Screenshot was captured to ' + filename);
        });
        stream.write(new Buffer(data, 'base64'));
        stream.end();
      });
      return this;
    },
    refresh: function () {
      browser.refresh();
      return this;
    },
    sleep: function (ms) {
      browser.sleep(ms);
      return this;
    },
    debug: function () {
      browser.debugger();
      return this;
    }
  }
};
