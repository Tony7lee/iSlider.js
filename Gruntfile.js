/*
 * Created by Tony Lee（李 凯） on 7-15-15.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        rootDir: './',
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= rootDir %>*',
                    '<%= rootDir %>*/*',
                    '<%= rootDir %>*/*/*'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35728,
                hostname: '0.0.0.0'
            },
            server: {
                options: {
                    port: 8001,
                    base: './'
                }
            }
        },
        uglify: {
            options: {
                mangle: {
                    except: []
                }
            },
            my_target: {
                files: {
                    'dist/iSlider.min.js': ['./src/iSlider.js']
                }
            }
        }
    });

    //load tasks
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['connect', 'watch']);

    grunt.registerTask('dist', ['uglify']);
};
