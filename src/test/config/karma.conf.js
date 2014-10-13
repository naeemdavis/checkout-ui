module.exports = function(config){
    config.set({
    basePath : '../../',

    files : [
      'main/webapp/lib/angular/angular.js',
      'main/webapp/lib/angular/angular-*.js',
      'test/lib/angular/angular-mocks.js',
	  'main/webapp/lib/angular-ui/ui-router/*.js',
	  'main/webapp/lib/angular-ui/ui-bootstrap/*.js',
	  
      'main/webapp/application/**/*.js',
      'main/webapp/modules/**/*.js',
      'test/unit/**/*.js'
    ],

    exclude : [
      'main/webapp/lib/angular/angular-loader.js',
      'main/webapp/lib/angular/*.min.js',
      'main/webapp/lib/angular/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    /* PhantomJS is the only client that will run on our red hat build server*/
    browsers : ['PhantomJS'],

    plugins : [
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

})}
