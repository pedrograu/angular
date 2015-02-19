//File: Gulpfile.js
'use strict';


var gulp    = require('gulp'),
    connect = require('gulp-connect'),
    stylus  = require('gulp-stylus'),
    nib     = require('nib'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    historyApiFallback = require('connect-history-api-fallback'),
    inject  = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    templateCache = require('gulp-angular-templatecache'),
    gulpif  = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    useref  = require('gulp-useref'),
    uglify  = require('gulp-uglify');

    // Servidor web de desarrollo
    gulp.task('server', function() {
      connect.server({
        root:'./app',
        hostname:'0.0.0.0',
        port:8080,
        livereload: true,
        middleware: function(connect, opt) {
          return [ historyApiFallback ];
        }
      });
    });

    // Buscar errores en el JS y nos lo muestra por pantalla
    gulp.task('jshint', function() {
      return gulp.src('./app/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
    });


    // Pre-procesa archivos Stylus a CSS y recarga los cambios
    gulp.task('css', function() {
      gulp.src('./app/stylesheets/main.styl')
      .pipe(stylus({ use: nib() }))
      .pipe(gulp.dest('./app/stylesheets'))
      .pipe(connect.reload());
    });

    // Recarga el navegador cuando hay cambios en el HTML
    gulp.task('html', function() {
      gulp.src('./app/**/*.html')
        .pipe(connect.reload());
    });


    // Vigila cambios que se produzcan en el código
    // y lanza las tareas relacionadas
    gulp.task('watch', function() {
      gulp.watch(['./app/**/*.html'], ['html']);
      gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
      gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
      gulp.watch(['./bower.json'], ['wiredep']);

    });

    // Busca en las carpetas de estilos y javascript los archivos que hayamos creado
    // para inyectarlos en el index.html
    gulp.task('inject', function() {
      var sources = gulp.src([ './app/scripts/**/*.js', './app/stylesheets/**/*.css']);
      return gulp.src('index.html', { cwd: './app' })
        .pipe(inject(sources, {
          read: false,
          ignorePath: '/app'
        }))
        .pipe(gulp.dest('./app'));
    });

    // Inyecta las librerias que instalemos via Bower
    gulp.task('wiredep', function() {
      gulp.src('./app/index.html')
      .pipe(wiredep({
        directory: './app/lib'
      }))
      .pipe(gulp.dest('./app'));
    });

    // Cachea la plantilla html como un string
    gulp.task('templates', function() {
      gulp.src('./app/views/**/*.tpl.html')
        .pipe(templateCache({
          root: 'views/',
          module: 'blog.templates',
          standlone: true
        }))
        .pipe(gulp.dest('./app/scripts'));
    });

    // Para compimir y mover a dist
    gulp.task('compress', function() {
      gulp.src('./app/index.html')
      .pipe(useref.assets())
      .pipe(gulpif('*.js', uglify({mangle: false })))
      .pipe(gulpif('*.css', minifyCss()))
      .pipe(gulp.dest('./dist'));
    });

    //Para copiar
    gulp.task('copy', function() {
      gulp.src('./app/index.html')
        .pipe(useref())
        .pipe(gulp.dest('./dist'));
      gulp.src('./app/lib/fontawesome/fonts/**')
        .pipe(gulp.dest('./dist/fonts'));
    });

    //Servidor desarrollo
    gulp.task('server-dist', function() {
      connect.server({
        root: './dist',
        hostname: '0.0.0.0.',
        port: 8080,
        livereload :true,
        middleware: function(connect, opt) {
          return [ historyApiFallback ];
        }
      });
    });



    gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);
    gulp.task('build', ['templates', 'compress', 'copy']);
