const esbuild = require("esbuild");
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
    namespace: "web",
    target: "es2017",
    entryPoints: [
      "web/index.tsx",
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
    ],
  },
];

const buildBundle = async () => {
  try {
    const baseOptions = {
      logLevel: "info",
      bundle: true,
      charset: "utf8",
      minifyWhitespace: !IS_WATCH_MODE,
      absWorkingDir: process.cwd(),
      // plugins: [
      // {
      //   name: "onRebuild",
      //   setup(build) {
      //     let count = 0;
      //     build.onEnd((result) => {
      //       console.log(result);
      //       // if (count++ === 0)
      //       //   return console.log(
      //       //     `[ESBuild Watch] (${outputFiles[0].path}) Files first build`
      //       //   );

      //       // return console.log(
      //       //   `[ESBuild Watch] (${outputFiles[0].path}) Sucessfully rebuilt bundle`
      //       // );
      //     });
      //   },
      // },
      // ],
    };

    for (const targetOpts of TARGET_ENTRIES) {
      const { namespace, ...mergedOpts } = { ...baseOptions, ...targetOpts };

      if (IS_WATCH_MODE) {
        let ctx = await esbuild.context(mergedOpts);

        await ctx.watch();

        if (targetOpts.namespace === "web") {
          await ctx.serve({
            servedir: "dist/web",
            port: Number(process.env.SP_WATCHMODE_PORT || 5000),
          });
        }
      } else {
        const { errors } = await esbuild.build(mergedOpts);

        if (errors.length) {
          console.error(`[ESBuild] Bundle failed with ${errors.length} errors`);
          for (let i = 0; i < errors.length; i++) {
            console.error(errors[i]);
          }

          process.exit(1);
        }
      }
    }
  } catch (e) {
    console.log("[ESBuild] Build failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));
