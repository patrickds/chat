var gulp = require('gulp'),
	nodemon = require('gulp-nodemon');

gulp.task('default', function () {
  nodemon({
    script: 'index.js',
	ext: 'js',
	env: { 'NODE_ENV': 'development' }
  })
});