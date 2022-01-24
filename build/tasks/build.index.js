import autoprefixer from "autoprefixer";
import consola from "consola";
import crypto from "crypto";
import esbuild from "esbuild";
import { readFileSync, statSync } from "fs";
import { writeFile } from "fs/promises";
import { JSDOM } from "jsdom";
import { join, relative, resolve } from "path";
import postcss from "postcss";
import prettier from "prettier";
import tailwindcss from "tailwindcss";

const entries = ["bin/src/webapp/app.js", "styles/index.css"];
const indexHtml = "statics/index.html";

export async function build() {
  try {
    consola.log("Running build");
    var result = await esbuild.build({
      entryPoints: entries,
      outdir: "output",
      // entryNames: "statics/[name]-[hash]",
      metafile: true,
      sourcemap: true,
      bundle: true,
      plugins: [
        {
          name: "postcss",
          setup(build) {
            build.onLoad({ filter: /.css$/ }, async (args) => {
              var postCssResult = await postcss([
                autoprefixer,
                tailwindcss,
              ]).process(readFileSync(args.path).toString(), {
                map: true,
                from: args.path,
              });
              return {
                loader: "css",
                contents: postCssResult.content,
              };
            });
          },
        },
        {
          name: "html",
          setup(build) {
            build.onEnd(async (result) => {
              await writeFile(
                join(build.initialOptions.outdir, "build-result.json"),
                JSON.stringify(result, null, 1)
              );

              var outputs = Object.keys(result.metafile.outputs)
                .map((o) =>
                  relative(resolve(build.initialOptions.outdir), resolve(o))
                )
                .filter((o) => !o.match(/.map$/));

              var html = readFileSync(indexHtml).toString();
              var dom = new JSDOM(html);
              const document = dom.window.document;

              outputs
                .filter((o) => o.match(/.css$/))
                .forEach((css) => {
                  const linkTag = document.createElement("link");
                  linkTag.setAttribute("rel", "stylesheet");
                  linkTag.setAttribute("href", css);
                  document.head.appendChild(linkTag);
                });
              outputs
                .filter((o) => o.match(/.js$/))
                .forEach((js) => {
                  const scriptTag = document.createElement("script");
                  scriptTag.setAttribute("src", js);
                  scriptTag.setAttribute("type", "module");
                  document.body.append(scriptTag);
                });

              var affectedFiles = getAffectedFiles(result);
              const staticsModifiedString = affectedFiles
                .map((filePath) => filePath + ";" + statSync(filePath)["mtime"])
                .join(";");

              const metaTag = document.createElement("meta");
              metaTag.setAttribute("name", "hash");
              metaTag.setAttribute("content", getHash(staticsModifiedString));

              var metaTags = Array.from(
                document.querySelectorAll("html > head > meta")
              );

              document.head.insertBefore(
                metaTag,
                metaTags && metaTags.length > 1
                  ? metaTags[1]
                  : metaTags && metaTags.length
                  ? metaTags[0]
                  : null
              );

              var html = dom.serialize();
              html = prettier.format(html, { parser: "html" });

              await writeFile(
                join(build.initialOptions.outdir, "index.html"),
                html
              );
            });
          },
        },
      ],
    });

    return getAffectedFiles(result);
  } catch (error) {
    return null;
  }
}

function getAffectedFiles(result) {
  if (result && result.metafile) {
    var affectedFiles = Object.keys(result.metafile.inputs).flatMap((key) => [
      key,
      ...result.metafile.inputs[key].imports.map((imp) => imp.path),
    ]);
    affectedFiles.push(indexHtml);
    return affectedFiles;
  }
}

export function getHash(data) {
  var sha1 = crypto.createHash("sha1");
  sha1.update(data);
  return sha1.digest("base64");
}
