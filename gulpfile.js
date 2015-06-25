var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var wait = require('gulp-wait');

gulp.task('lint', function() {
  return gulp.src(['client/**/*.js', 'common/**/*.js', 'server/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('serve-nodemon', function() {
  nodemon({
    script: 'server/server.js',
    ext: 'html js',
    env: {'NODE_ENV': 'development'}
  })
    .on('restart', function() {
      console.log('restarted!')
    })
});

gulp.task('test', function() {
  gulp.src('test/**/*.js')
    .pipe(wait(2500)) // wait for server to restart
    .pipe(mocha({
      reporter: 'nyan',
      clearRequireCache: true,
      ignoreLeaks: true
    }));
});

gulp.task('watch', function() {
    gulp.watch(['client/**/*.js', 'common/**/*.js', 'server/**/*.js', 'test/**/*.js'], ['lint', 'test']);
});

gulp.task('develop', ['lint', 'serve-nodemon', 'test', 'watch']);

gulp.task('default', ['lint']);
