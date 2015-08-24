var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('serve', function(){
	browserSync.init({
		server: './src/'
	});
	
	gulp.watch('src/**').on('change', browserSync.reload);
});