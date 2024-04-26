const esbuild = require("esbuild");

const IS_WATCH_MODE = process.env.IS_WATCH_MODE;

const targetOpts = {
  target: "es2017",
  entryPoints: ["web/main.tsx"],
  outdir: "./dist/web",
  loader: { html: "copy" },
  assetNames: "[name]",
  sourcemap: true,
};

const buildBundle = async () => {
  try {
    const baseOptions = {
      logLevel: "info",
      bundle: true,
      charset: "utf8",
      minifyWhitespace: true,
      absWorkingDir: process.cwd(),
    };

    const mergedOpts = { ...baseOptions, ...targetOpts };

    // if (IS_WATCH_MODE) {
    //   mergedOpts.watch = {
    //     onRebuild(error) {
    //       if (error)
    //         console.error(
    //           `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Failed to rebuild bundle`
    //         );
    //       else
    //         console.log(
    //           `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Sucessfully rebuilt bundle`
    //         );
    //     },
    //   };
    // }

    let ctx = await esbuild.context(mergedOpts);

    await ctx.watch();

    let { host, port } = await ctx.serve();

    console.log(`Hosting web build at ${host}:${port}`);
  } catch (e) {
    console.log("[ESBuild] Serve failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));
