const esbuild = require("esbuild");
const postCssPlugin = require("@deanc/esbuild-plugin-postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const { dotenvRun } = require("@dotenv-run/esbuild");

const IS_WATCH_MODE = process.env.IS_WATCH_MODE;

const TARGET_ENTRIES = [
  {
    target: "node16",
    entryPoints: ["server/index.ts"],
    platform: "node",
    outfile: "./dist/server/index.js",
  },
  {
    target: "es2020",
    entryPoints: ["client/index.ts"],
    outfile: "./dist/client/index.js",
  },
  {
    target: "es2017",
    entryPoints: [
      "web/index.tsx",
      "web/style.css",
      "web/index.html",
      "web/public/img/parchment_fonts_512x512.png",
    ],
    outdir: "./dist/web/",
    loader: { ".html": "copy", ".png": "copy" },
    assetNames: "[name]",
    sourcemap: true,
    plugins: [
      dotenvRun({
        verbose: true,
        files: [".env"],
        root: "../..",
        prefix: "SP_",
      }),
      postCssPlugin({
        plugins: [tailwindcss, autoprefixer],
      }),
    ],
  },
];

const buildBundle = async () => {
  try {
    const baseOptions = {
      logLevel: "info",
      bundle: true,
      charset: "utf8",
      minifyWhitespace: true,
      absWorkingDir: process.cwd(),
    };

    for (const targetOpts of TARGET_ENTRIES) {
      const mergedOpts = { ...baseOptions, ...targetOpts };

      if (IS_WATCH_MODE) {
        mergedOpts.watch = {
          onRebuild(error) {
            if (error)
              console.error(
                `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Failed to rebuild bundle`
              );
            else
              console.log(
                `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Sucessfully rebuilt bundle`
              );
          },
        };
      }

      const { errors } = await esbuild.build(mergedOpts);

      if (errors.length) {
        console.error(`[ESBuild] Bundle failed with ${errors.length} errors`);
        process.exit(1);
      }
    }
  } catch (e) {
    console.log("[ESBuild] Build failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));
