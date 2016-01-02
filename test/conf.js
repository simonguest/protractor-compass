exports.config = {
  capabilities: {
    'browserName': 'chrome'
  },
  chromeOnly: true,
  baseUrl: 'http://localhost:3000/',
  specs: ['spec.js'],
  framework: 'jasmine2',
  getPageTimeout: 60000,
  allScriptsTimeout: 60000,

  jasmineNodeOpts: {
    isVerbose: true,
    defaultTimeoutInterval: 60000
  }
};
