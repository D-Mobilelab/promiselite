'use strict';

module.exports = function (grunt) {

    /*************************************
    ****         REQUIREMENTS         ****
    *************************************/

    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    /*************************************
    ****         SINGLE TASKS         ****
    *************************************/

    var versionString = grunt.file.readJSON('package.json').version;
    var version = versionString.split(".");
    var major = parseInt(version[0]), minor = parseInt(version[1]), patch = parseInt(version[2]);
    var versionMajor = (major+1) + ".0.0";
    var versionMinor = (major) + "." + (minor+1) + ".0";
    var versionPatch = (major) + "." + (minor) + "." + (patch+1);

    grunt.initConfig({
        // VARIABLES
        brify: grunt.file.readJSON('package.json').browserify,
        examplePath: 'examples/',
        srcPath: 'src/',
        testPath: 'test/',
        coveragePath: 'test/coverage',
        docPath: 'docs/',
        distPath: 'dist/',
        newVersion: versionString,
        changeLog: '',
        libraryName: '',

        // CLEAN
        clean: {
            docTemp: ["<%= docPath %>temp"],
            docVersion: ["<%= docPath %><%= newVersion %>"],
            coverage: ["<%= coveragePath %>"],
            dist: ["<%= distPath %>/*"]
        },

        // CONNECT
        connect:{
            main: {
                options:{
                    hostname: 'localhost',
                    port: 9000,
                    livereload: true
                }
            }
        },

        // OPEN
        open:{
            coverage:{
                path: 'http://localhost:9000/<%= coveragePath %>'
            },
            docTemp:{
                path: 'http://localhost:9000/<%= docPath %>temp'
            },
            server:{
                path: 'http://localhost:9000/<%= examplePath %>'
            }
        },

        // WATCH
        watch:{
            coverage:{
                files:[
                    '<%= srcPath %>**/*.*',
                    '<%= testPath %>**/*.*',
                    '!<%= testPath %>coverage/**/*.*',
                    'karma.conf.js',
                    'mock.js'
                ],
                tasks: ['clean:coverage', 'karma'],
                options:{
                    livereload: 35729
                }
            },
            docTemp:{
                files:[
                    // '<%= docPath %>welcome.js',
                    '<%= srcPath %>**/*.*'
                ],
                tasks: ['clean:docTemp', 'ngdocs:api'],
                options:{
                    livereload: 35729
                }
            },
            server:{
                files:[
                    'mock.js',
                    '<%= examplePath %>**/*.*',
                    '<%= srcPath %>**/*.*'
                ],
                tasks: ['clean:dist', 'shell:browserify', 'comments'],
                options:{
                    livereload: 35729
                }
            }
        },

        // LINT
        eslint: {
            main: [
                '<%= srcPath %>**/*.js'
            ]
        },

        // KARMA
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        // NG-DOCS
        ngdocs: {
            options: {
                html5Mode: false,
                title: 'Documentation',
            },
            api: {
                options: {
                    dest: '<%= docPath %>temp',
                    startPage: '/api/main'
                },
                // src: ['<%= docPath %>/welcome.js', '<%= srcPath %>/**/*.js'],
                src: ['<%= srcPath %>/**/*.js'],
                title: 'API Reference',
                api: true
            },
            version: {
                options: {
                    dest: '<%= docPath %><%= newVersion %>',
                    startPage: '/version/main'
                },
                // src: ['<%= docPath %>/welcome.js', '<%= srcPath %>/**/*.js'],
                src: ['<%= srcPath %>/**/*.js'],
                title: 'API Reference',
                api: true
            }
        },

        // PROMPT
        prompt: {
            version: {
                options: {
                    questions: [{
                        config: 'newVersion',
                        type: 'list',
                        message: 'Current: ' + versionString + ' - Choose a new version for this library:',
                        default: versionString,
                        choices: [
                            { name: 'No new version (press CTRL+C two times)', value: versionString },
                            { name: 'Major Version (' + versionMajor + ')', value: versionMajor },
                            { name: 'Minor Version (' + versionMinor + ')', value: versionMinor },
                            { name: 'Patch (' + versionPatch + ')', value: versionPatch }                            
                        ]
                    }, {
                        config: 'changeLog',
                        type: 'input',
                        message: 'Features for new version (use ";" to separate features):',
                        default: '',
                        when: function(answers) {
                            return answers['newVersion'] !== versionString;
                        },
                        filter: function(value){
                            // add new version string to changelog
                            value = "** <%= newVersion %> **; " + value; 
                            // remove last char if it's a semicolon
                            if(value.substr(value.length-1) === ';'){ value = value.substr(0, value.length-1)}
                            // replace all semicolons to "\n-"
                            value = value.replace(/;/g, "\n-");
                            // add double newlines and return changelog
                            return value + "\n\n";
                        }
                    }]
                }
            }
        },

        // STRING-REPLACE
        'string-replace': {
            bower: {
                files: {
                    'package.json': 'package.json'
                },
                options: {
                    replacements: [{
                        pattern: '"version": "' + versionString + '",',
                        replacement: '"version": "<%= newVersion %>",'
                    }]
                }
            }
        },

        // FILE-APPEND
        'file_append': {
            changelog: {
                files: [
                    {
                        prepend: "<%= changeLog %>",
                        input: 'CHANGELOG',
                        output: 'CHANGELOG'
                    }
                ]
            }
        },

        // COVERALLS
        coveralls: {
            options: {
                force: false
            },
            docs: {
              src: '<%= coveragePath %>/**/lcov.info'
            },
        },

        // SHELL
        shell: {
            options: {
                stderr: false
            },
            browserify: 'node node_modules/browserify/bin/cmd.js <%= srcPath %><%= brify.src %> -o <%= distPath %><%= brify.dist %> -s <%= brify.global %>'
        },

        // STRIP COMMENTS
        comments: {
            your_target: {
                options: {
                    singleline: false,
                    multiline: true
                },
                src: '<%= distPath %>*.js'
            },
        },

        // SHELL
        shell: {
            options: {
                stderr: false
            },
            add_docs: 'git add <%= docPath %>',
            commit_version: 'git commit -a -m "Version <%= newVersion %>"',
            add_tag: 'git tag <%= newVersion %>',
            push_version: 'git push origin master',
            push_tag: 'git push origin --tags',
            push_docs: 'git subtree push --prefix docs origin gh-pages',
            npm_publish: 'npm publish'
        }
    });

    /*************************************
    ****         GRUNT TASKS          ****
    *************************************/

    grunt.registerTask('lint',[
        // LINT
        'eslint'
    ]);

    /**********************************/

    grunt.registerTask('test',[
        // CLEAN COVERAGE
        'clean:coverage',
        // TEST
        'karma'
    ]);

    /**********************************/

    grunt.registerTask('coverage',[
        // CLEAN COVERAGE
        'clean:coverage',
        // TEST
        'karma',
        // CONNECT
        'connect:main',
        'open:coverage',
        // WATCH
        'watch:coverage'
    ]);

    /**********************************/

    grunt.registerTask('doc',[
        // DOC (TEMP)
        'clean:docTemp',
        'ngdocs:api',
        // CONNECT
        'connect:main',
        'open:docTemp',
        // WATCH
        'watch:docTemp'
    ]);

    /**********************************/

    grunt.registerTask('build',[
        // CREATE BUILD
        'clean:dist',
        'shell:browserify',
        'comments'
    ]);

    /**********************************/

    grunt.registerTask('serve',[
        // CREATE BUILD
        'clean:dist',
        'shell:browserify',
        'comments',
        // CONNECT
        'connect:main',
        'open:server',
        'watch:server'
    ]);

    /**********************************/    

    grunt.registerTask('travis',[
        // CLEAN COVERAGE
        'clean:coverage',
        // CREATE BUILD
        'clean:dist',
        'shell:browserify',
        'comments',
        // TEST
        'karma',
        // COVERALLS
        'coveralls',
        // LINT
        'eslint',
        // DOC (TEMP)
        'clean:docTemp',
        'ngdocs:api'
    ]);

    grunt.registerTask('version',[
        // CLEAN COVERAGE
        'clean:coverage',
        // CREATE BUILD
        'clean:dist',
        'shell:browserify',
        'comments',
        // TEST
        'karma',
        // LINT
        'eslint',
        // PROMPT
        'prompt:version',
        'string-replace:bower',
        'file_append:changelog',
        // DOC (OFFICIAL)
        'clean:docVersion',
        'ngdocs:version',
        // SHELL
        'shell:add_docs',
        'shell:commit_version',
        'shell:add_tag',
        'shell:push_version',
        'shell:push_tag',
        'shell:push_docs',
        'shell:npm_publish'
    ]);
   
}
