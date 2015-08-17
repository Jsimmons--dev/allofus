module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jade: {
            compile: {
                files:[ {
                    cwd: "public/views",
                    src: "**/*.jade",
                    dest: "public/templates",
                    expand: true,
                    ext: ".html"
                 } ]
            }
        },
        watch: {
            files: ['public/views/*.jade'],
            tasks: ['jade']
        },
        concurrent: {
          target1: {
              tasks: ['watch','execute'],
              options : {
                logConcurrentOutput: true
              }
          }
        },
        execute: {
            target: {
                src: ['bin/www']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-less');

   grunt.registerTask('default',['concurrent:target1']);

};
