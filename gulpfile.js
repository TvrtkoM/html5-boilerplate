var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath).mode
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:license',
    'copy:main.css',
    'copy:misc'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:main.css', function () {
    return gulp.src(dirs.src + '/css/main.css')
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('bundle:dist', function() {
    return gulp.src(dirs.src + '/js/main.js')
        .pipe(plugins.browserify({
            debug: false
        }))
        .pipe(plugins.rename('bundle.js'))
        .pipe(gulp.dest(dirs.dist + '/js'));
});

gulp.task('bundle:dev', function() {
    return gulp.src(dirs.src + '/js/main.js')
        .pipe(plugins.rename('bundle.js'))
        .pipe(plugins.browserify({
            debug: true
        }).on('error', function(e) {
            console.log(e.message);
        }))
        .pipe(gulp.dest(dirs.src + '/js'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/js/*.map',
        '!' + dirs.src + '/js/main.js',
        '!' + dirs.src + '/js/bundle.js',
        '!' + dirs.src + '/scss/*',
        '!' + dirs.src + '/scss',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('scss:dev', function() {
    return gulp.src(dirs.src + '/scss/main.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
            cascade: false
        }))
        .pipe(gulp.dest(dirs.src + '/css'));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'bundle:dist',
        'copy',
    done);
});

gulp.task('watch', function () {
    gulp.watch(dirs.src + '/scss/main.scss', ['scss:dev']);
    gulp.watch(dirs.src + '/js/main.js', ['bundle:dev']);
});

gulp.task('default', ['build']);
