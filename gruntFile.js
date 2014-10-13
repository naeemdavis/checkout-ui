module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat'); // concatenate certain files
    grunt.loadNpmTasks('grunt-contrib-jshint'); // analise the js files
    grunt.loadNpmTasks('grunt-contrib-uglify'); // minify the js files
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less'); // process css and less files
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-hashres');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task.
    grunt.registerTask('default', ['jshint', 'build']);
    grunt.registerTask('build', ['clean', 'concat:index', 'concat:app','concat:libs',  'less:build', 'copy:assets', 'hashres']);
    grunt.registerTask('release', ['clean', 'jshint', 'uglify', 'concat:index', 'karma:unit', 'less:min', 'copy:assets', 'hashres']);

    grunt.registerTask('test-watch', ['karma:watch']);

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function () {
        grunt.log.subhead(Date());
    });

    var karmaConfig = function (configFile, customOptions) {
        var options = { configFile: configFile, keepalive: true };
        var travisOptions = process.env.TRAVIS && { browsers: ['Chrome'], reporters: 'dots' };
        return grunt.util._.extend(options, customOptions, travisOptions);
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        rootdistdir: 'target',
        appdistdir: 'target/<%= pkg.name %>',

        banner: '   /* \n' +
            '   <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '   Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            '   <%= pkg.homepage %>' +
            ' */\n',

        src: {
            webapp : ['src/main/webapp'],
            js: ['src/main/webapp/application/**/*.js','src/main/webapp/modules/**/*.js'],
            specs: ['src/test/**/*.spec.js'],
            scenarios: ['src/test/**/*.scenario.js'],
            html: ['src/main/webapp/index.html'],
            tpl: {
                app: ['src/main/webapp/modules/**/*.tpl.html']
            },
            less: ['src/main/webapp/assets/css/checkout.less'],
            lessWatch: ['src/main/webapp/lib/bootstrap/less/**/*.less'],
            assets: ['src/main/webapp/assets']
        },
        clean: ['<%= rootdistdir %>/*'],
        copy: {
            assets: {
                files: [
                    { dest: '<%= appdistdir %>/assets/images', src: '**', expand: true, cwd: '<%= src.assets%>/images'},
                    { dest: '<%= appdistdir %>/assets/resources', src: '**', expand: true, cwd: '<%= src.assets%>/resources'},
                    { dest: '<%= appdistdir %>/assets/css', src: '**/*.css', expand: true, cwd: '<%= src.assets%>/css'},
                    { dest: '<%= appdistdir %>/assets/fonts', src: '**', expand: true, cwd: '<%= src.assets%>/fonts'},
                    { dest: '<%= appdistdir %>/assets/i18n', src: '**', expand: true, cwd: '<%= src.assets%>/i18n'},
                    { dest: '<%= appdistdir %>/modules', src: '**/*.tpl.html', expand: true, cwd: '<%= src.webapp %>/modules' },
                    { dest: '<%= appdistdir %>/WEB-INF', src: '**', expand: true, cwd: '<%= src.webapp %>/WEB-INF' }
                ]
            }
        },
        karma: {
            unit: { options: karmaConfig('src/test/config/karma.conf.js', { singleRun: true, autoWatch: false}) },
            watch: { options: karmaConfig('src/test/config/karma.conf.js', { singleRun: false, autoWatch: true}) }
        },
        concat: {
            index : {
                src: ['<%= src.html %>'],
                dest: '<%= appdistdir %>/index.html',
                options: {
                    process: true
                }
            },
            app : {
                options: {
                    banner: "<%= banner %>"
                },
                src: ['<%= src.js %>'],
                dest: '<%= appdistdir %>/modules/<%= pkg.name %>.js'
            },

            libs : {
                src: ['src/main/webapp/lib/angular/angular.js',
                      'src/main/webapp/lib/angular/angular-animate.js',
                      'src/main/webapp/lib/angular/angular-cookies.js',
                      'src/main/webapp/lib/angular/angular-loader.js',
                      'src/main/webapp/lib/angular/angular-resource.js',
                      'src/main/webapp/lib/angular/angular-route.js',
                      'src/main/webapp/lib/angular/angular-sanitize.js',
                      'src/main/webapp/lib/angular/angular-touch.js',
                      'src/main/webapp/lib/angular-ui/ui-bootstrap/ui-bootstrap-tpls-0.10.0.js',
                      'src/main/webapp/lib/angular-ui/ui-router/angular-ui-router-0.2.8.js',
                      'src/main/webapp/lib/angular-translate/angular-translate-2.0.0.js',
                      'src/main/webapp/lib/angular-translate/angular-translate-loader-static-files.js'],
                dest: '<%= appdistdir %>/lib/external-libs-all.js'
            }

        },
        uglify: {
            dist: {
                options: {
                    banner: "<%= banner %>"
                },
                src: ['<%= src.js %>'],
                dest: '<%= appdistdir %>/modules/<%= pkg.name %>.js'
            },
            libs : {
                src: ['src/main/webapp/lib/angular/angular.js',
                    'src/main/webapp/lib/angular/angular-animate.js',
                    'src/main/webapp/lib/angular/angular-cookies.js',
                    'src/main/webapp/lib/angular/angular-loader.js',
                    'src/main/webapp/lib/angular/angular-resource.js',
                    'src/main/webapp/lib/angular/angular-route.js',
                    'src/main/webapp/lib/angular/angular-sanitize.js',
                    'src/main/webapp/lib/angular/angular-touch.js',
                    'src/main/webapp/lib/angular-ui/ui-bootstrap/ui-bootstrap-tpls-0.10.0.js',
                    'src/main/webapp/lib/angular-ui/ui-router/angular-ui-router-0.2.8.js',
                    'src/main/webapp/lib/angular-translate/angular-translate-2.0.0.js',
                    'src/main/webapp/lib/angular-translate/angular-translate-loader-static-files.js'],
                dest: '<%= appdistdir %>/lib/external-libs-all.js'
            }
        },
        less: {
            build: {
                files: {
                    '<%= appdistdir %>/assets/css/<%= pkg.name %>.bootstrap.css': ['<%= src.less %>'] },
                options: {
                    compile: true
                }
            },
            min: {
                files: {
                    '<%= appdistdir %>/assets/css/<%= pkg.name %>.bootstrap.css': ['<%= src.less %>']
                },
                options: {
                    compress: true
                }
            }
        },
        watch: {
            all: {
                files: ['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.modules %>', '<%= src.html %>'],
                tasks: ['default', 'timestamp']
            },
            build: {
                files: ['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.modules %>', '<%= src.html %>'],
                tasks: ['build', 'timestamp']
            }
        },
        jshint: {
            files: ['gruntFile.js', '<%= src.js %>', '<%= src.specs %>', '<%= src.scenarios %>'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                node: true,
                globals: {
                    angular : false,
                    strict: true
                }
            }
        },
        hashres: {
            // Global options
            options: {
                // Optional. Encoding used to read/write files. Default value 'utf8'
                encoding: 'utf8',
                // Optional. Format used to name the files specified in 'files' property.
                // Default value: '${hash}.${name}.cache.${ext}'
                fileNameFormat: '${name}.${hash}.${ext}',
                // Optional. Should files be renamed or only alter the references to the files
                // Use it with '${name}.${ext}?${hash} to get perfect caching without renaming your files
                // Default value: true
                renameFiles: true
            },
            // hashres is a multitask. Here 'prod' is the name of the subtask. You can have as many as you want.
            hash: {
                // Specific options, override the global ones
                options: {
                    // You can override encoding, fileNameFormat or renameFiles
                },
                // Files to hash
                src: [
                    // WARNING: These files will be renamed!
                    '<%= appdistdir %>/assets/css/<%= pkg.name %>.css',
                    '<%= appdistdir %>/assets/css/<%= pkg.name %>.bootstrap.css',

                    '<%= appdistdir %>/modules/<%= pkg.name %>.js',
                    '<%= appdistdir %>/lib/external-libs-all.js'
                ],
                // File that refers to above files and needs to be updated with the hashed name
                dest: '<%= appdistdir %>/index.html'
            }
        },
        compress: {
            main: {
                options: {
                    archive: '<%= rootdistdir %>/<%= pkg.name %>.war',
                    mode: 'zip'
                },
                files: [
                    { cwd: '<%= appdistdir %>/', src: '**', expand: true, dest: '/' }
                ]
            }
        }
    });

};
