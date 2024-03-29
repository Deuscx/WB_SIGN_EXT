const fs = require("fs");
const { getRollupPlugins } = require("@gera2ld/plaid");
const { terser } = require("rollup-plugin-terser");
const pkg = require("./package.json");

const DIST = "dist";
const FILENAME = "index";
const BANNER = fs
  .readFileSync("src/meta.js", "utf8")
  .replace("process.env.VERSION", pkg.version);

const bundleOptions = {
  extend: true,
  esModule: false,
};
const postcssOptions = {
  ...require("@gera2ld/plaid/config/postcssrc"),
  inject: false,
  minimize: true,
};
const rollupConfig = [
  {
    input: {
      input: "src/index.js",
      plugins: getRollupPlugins({
        esm: true,
        minimize: false,
        postcss: postcssOptions,
      }),
    },
    output: {
      format: "iife",
      file: `${DIST}/${FILENAME}.user.js`,
      ...bundleOptions,
      plugins: [
        terser({
          compress: { defaults: false },
          format: {
            comments: function (node, comment) {
              let text = comment.value;
              let type = comment.type;
              if (type == "comment1") {
                // multiline comment
                return /@name|@description|@homepageURL|@supportURL|@grant|@version|@author|@match|@require|==/i.test(
                  text
                );
              }
            },
            max_line_len: true,
            beautify: true,
          },
          keep_fnames: true,
        }),
      ],
    },
  },
];

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
    ...(BANNER && {
      banner: BANNER,
    }),
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
