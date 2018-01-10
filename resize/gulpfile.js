const gulp = require('gulp');
const jshint = require('gulp-jshint');
const zip = require('gulp-zip');

// Run JS Hint, fail if warnings are found
gulp.task('lint', () => {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

// Zip up the source
gulp.task('zip', function() {
  const paths = [
    'src/*.js',
    'node_modules/**/*.js',
    'node_modules/**/*.json'
  ];
  gulp.src(paths, { base: '.' })
    .pipe(zip('transform.zip'))
    .pipe(gulp.dest('build'));
});

// default runs lint, then packages the code into the build directory
gulp.task('default', ['lint', 'zip']);
