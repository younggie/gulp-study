import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";
import postcss from "gulp-postcss";
import tailwincss from "tailwindcss";
import purgecss from "@fullhuman/postcss-purgecss";
import rename from "gulp-rename";

sass.compiler = require("node-sass");

var postcssPlugins = [
  purgecss({
    content: ["src/**/*.html"]
  })
];

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build"
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css"
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js"
  }
};

const pug = () =>
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build/", ".publish"]);

//const webserver = () => gulp.src("build").pipe(ws({ livereload: true }));
const webserver = () => gulp.src("src").pipe(ws({ livereload: true }));

const img = () =>
  gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const tailwind_minify = () =>
  gulp
    //.src("src/css/style.css")
    .src("src/css/postcss/style.css")
    .pipe(miniCSS())
    .pipe(gulp.dest("src/css/minify"));

//tailwindcss 에서 사용한 것만 추출해서 압축함
const tailwind_postcss = () =>
  gulp
    .src("src/css/style.css")
    .pipe(postcss(postcssPlugins))
    .pipe(miniCSS())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("src/css"));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }]
        ]
      })
    )
    .pipe(gulp.dest(routes.js.dest));

//const gh = () => gulp.src("build/**/*").pipe(ghPages());
const gh = () => gulp.src("src/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
//export const deploy = gulp.series([build, gh, clean]);
export const deploy = gulp.series([build, gh]);
export const myzip = gulp.series([tailwind_minify]);
export const tailwind_use_only = gulp.series([tailwind_postcss]);
export const run_server = gulp.series([live]);
