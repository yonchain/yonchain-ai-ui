// vite.config.ts
import vue from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.0.5_vi_c3e690de0356c1b988b04b93fb335a54/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/vite@5.3.3_@types+node@20.0.0_sass@1.58.3_terser@5.31.1/node_modules/vite/dist/node/index.js";
import vueSetupExtend from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/unplugin-vue-setup-extend-plus@1.0.1/node_modules/unplugin-vue-setup-extend-plus/dist/vite.js";
import AutoImport from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/unplugin-auto-import@0.18.0_ed724790253a997f7010c2894eb5643d/node_modules/unplugin-auto-import/dist/vite.js";
import topLevelAwait from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/vite-plugin-top-level-await_fd49b4c54ebbdecde44c484868f0b805/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import viteCompression from "file:///D:/01Money/01Software/Ui/dify4j-ui/node_modules/.pnpm/vite-plugin-compression@0.5_6bdf7548b27f49350f8fde2dbc33787e/node_modules/vite-plugin-compression/dist/index.mjs";

// src/components/IconSelector/index.ts
import { readFileSync, readdirSync } from "fs";
var idPerfix = "";
var iconNames = [];
var svgTitle = /<svg([^>+].*?)>/;
var clearHeightWidth = /(width|height)="([^>+].*?)"/g;
var hasViewBox = /(viewBox="[^>+].*?")/g;
var clearReturn = /(\r)|(\n)/g;
var clearFill = /(fill="[^>+].*?")/g;
function findSvgFile(dir) {
  const svgRes = [];
  const dirents = readdirSync(dir, {
    withFileTypes: true
  });
  for (const dirent of dirents) {
    iconNames.push(`${idPerfix}-${dirent.name.replace(".svg", "")}`);
    if (dirent.isDirectory()) {
      svgRes.push(...findSvgFile(dir + dirent.name + "/"));
    } else {
      const svg = readFileSync(dir + dirent.name).toString().replace(clearReturn, "").replace(clearFill, 'fill=""').replace(svgTitle, ($1, $2) => {
        let width = 0;
        let height = 0;
        let content = $2.replace(clearHeightWidth, (s1, s2, s3) => {
          if (s2 === "width") {
            width = s3;
          } else if (s2 === "height") {
            height = s3;
          }
          return "";
        });
        if (!hasViewBox.test($2)) {
          content += `viewBox="0 0 ${width} ${height}"`;
        }
        return `<symbol id="${idPerfix}-${dirent.name.replace(".svg", "")}" ${content}>`;
      }).replace("</svg>", "</symbol>");
      svgRes.push(svg);
    }
  }
  return svgRes;
}
var svgBuilder = (path, perfix = "local") => {
  if (path === "") return;
  idPerfix = perfix;
  const res = findSvgFile(path);
  return {
    name: "svg-transform",
    transformIndexHtml(html) {
      return html.replace(
        "<body>",
        `
                <body>
                <svg id="local-icon" data-icon-name="${iconNames.join(
          ","
        )}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0">
                ${res.join("")}
                </svg>
                `
      );
    }
  };
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\01Money\\01Software\\Ui\\dify4j-ui";
var pathResolve = (dir) => {
  return resolve(__vite_injected_original_dirname, ".", dir);
};
var alias = {
  "/@": pathResolve("./src/"),
  "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
};
var viteConfig = defineConfig((mode) => {
  const env = loadEnv(mode.mode, process.cwd());
  const isDev = env.ENV === "development";
  return {
    plugins: [
      vue(),
      // Vue 插件
      svgBuilder("./src/assets/icons/"),
      // 将 SVG 文件转换成 Vue 组件
      vueSetupExtend({}),
      // setup语法糖增强插件
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        // 自动导入的依赖库数组
        dts: "./auto-imports.d.ts"
        // 自动导入类型定义文件路径
      }),
      topLevelAwait({
        promiseExportName: "__tla",
        // TLA Promise 变量名
        promiseImportName: (i) => `__tla_${i}`
        // TLA Promise 导入名
      }),
      viteCompression({
        deleteOriginFile: false
        // 压缩后删除原来的文件
      })
    ],
    root: process.cwd(),
    // 项目根目录
    resolve: { alias },
    // 路径别名配置
    base: mode.command === "serve" ? "./" : env.VITE_PUBLIC_PATH,
    optimizeDeps: {
      include: ["element-plus/es/locale/lang/zh-cn", "element-plus/es/locale/lang/en"]
    },
    server: {
      host: "0.0.0.0",
      // 服务器地址
      port: env.VITE_PORT,
      // 服务器端口号
      open: env.VITE_OPEN === "true",
      // 是否自动打开浏览器
      hmr: true,
      // 启用热更新
      proxy: {
        "/api/gen": {
          //单体架构下特殊处理代码生成模块代理
          target: env.VITE_IS_MICRO === "true" ? env.VITE_ADMIN_PROXY_PATH : env.VITE_GEN_PROXY_PATH,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        },
        "/api": {
          target: env.VITE_ADMIN_PROXY_PATH,
          // 目标服务器地址
          ws: true,
          // 是否启用 WebSocket
          changeOrigin: true,
          // 是否修改请求头中的 Origin 字段
          rewrite: (path) => path.replace(/^\/api/, "")
        },
        "^/ws/info/.*": {
          target: env.VITE_ADMIN_PROXY_PATH,
          // 目标服务器地址
          ws: true,
          // 是否启用 WebSocket
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: "dist",
      // 打包输出目录
      chunkSizeWarningLimit: 1500,
      // 代码分包阈值
      // 开发使用 esbuild 更快，生产环境打包使用 terser 可以删除更多注释
      minify: isDev ? "esbuild" : "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          // 删除 console
          drop_debugger: true
          // 删除 debugger
        },
        format: {
          comments: false
          // 删除所有注释
        }
      },
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          compact: true,
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            echarts: ["echarts"]
          }
        }
      }
    },
    css: { preprocessorOptions: { css: { charset: false }, scss: { api: "modern-compiler" } } },
    define: {
      __VUE_I18N_LEGACY_API__: JSON.stringify(false),
      __VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
      __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
      __VERSION__: JSON.stringify(process.env.npm_package_version),
      __NEXT_NAME__: JSON.stringify(process.env.npm_package_name)
    }
  };
});
var vite_config_default = viteConfig;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL2NvbXBvbmVudHMvSWNvblNlbGVjdG9yL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFNb25leVxcXFwwMVNvZnR3YXJlXFxcXFVpXFxcXGRpZnk0ai11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcMDFNb25leVxcXFwwMVNvZnR3YXJlXFxcXFVpXFxcXGRpZnk0ai11aVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMDFNb25leS8wMVNvZnR3YXJlL1VpL2RpZnk0ai11aS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIENvbmZpZ0VudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgdnVlU2V0dXBFeHRlbmQgZnJvbSAndW5wbHVnaW4tdnVlLXNldHVwLWV4dGVuZC1wbHVzL3ZpdGUnO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcclxuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSAndml0ZS1wbHVnaW4tdG9wLWxldmVsLWF3YWl0JztcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IHsgc3ZnQnVpbGRlciB9IGZyb20gJy9AL2NvbXBvbmVudHMvSWNvblNlbGVjdG9yL2luZGV4JztcclxuXHJcbmNvbnN0IHBhdGhSZXNvbHZlID0gKGRpcjogc3RyaW5nKSA9PiB7XHJcblx0cmV0dXJuIHJlc29sdmUoX19kaXJuYW1lLCAnLicsIGRpcik7XHJcbn07XHJcblxyXG5jb25zdCBhbGlhczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuXHQnL0AnOiBwYXRoUmVzb2x2ZSgnLi9zcmMvJyksXHJcblx0J3Z1ZS1pMThuJzogJ3Z1ZS1pMThuL2Rpc3QvdnVlLWkxOG4uY2pzLmpzJyxcclxufTtcclxuXHJcbmNvbnN0IHZpdGVDb25maWcgPSBkZWZpbmVDb25maWcoKG1vZGU6IENvbmZpZ0VudikgPT4ge1xyXG5cdGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZS5tb2RlLCBwcm9jZXNzLmN3ZCgpKTtcclxuXHQvLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcclxuXHRjb25zdCBpc0RldiA9IGVudi5FTlYgPT09ICdkZXZlbG9wbWVudCdcclxuXHRyZXR1cm4ge1xyXG5cdFx0cGx1Z2luczogW1xyXG5cdFx0XHR2dWUoKSwgLy8gVnVlIFx1NjNEMlx1NEVGNlxyXG5cdFx0XHRzdmdCdWlsZGVyKCcuL3NyYy9hc3NldHMvaWNvbnMvJyksIC8vIFx1NUMwNiBTVkcgXHU2NTg3XHU0RUY2XHU4RjZDXHU2MzYyXHU2MjEwIFZ1ZSBcdTdFQzRcdTRFRjZcclxuXHRcdFx0dnVlU2V0dXBFeHRlbmQoe30pLCAvLyBzZXR1cFx1OEJFRFx1NkNENVx1N0NENlx1NTg5RVx1NUYzQVx1NjNEMlx1NEVGNlxyXG5cdFx0XHRBdXRvSW1wb3J0KHtcclxuXHRcdFx0XHRpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NFx1NEY5RFx1OEQ1Nlx1NUU5M1x1NjU3MFx1N0VDNFxyXG5cdFx0XHRcdGR0czogJy4vYXV0by1pbXBvcnRzLmQudHMnLCAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTdDN0JcdTU3OEJcdTVCOUFcdTRFNDlcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcclxuXHRcdFx0fSksXHJcblx0XHRcdHRvcExldmVsQXdhaXQoe1xyXG5cdFx0XHRcdHByb21pc2VFeHBvcnROYW1lOiAnX190bGEnLCAvLyBUTEEgUHJvbWlzZSBcdTUzRDhcdTkxQ0ZcdTU0MERcclxuXHRcdFx0XHRwcm9taXNlSW1wb3J0TmFtZTogKGkpID0+IGBfX3RsYV8ke2l9YCwgLy8gVExBIFByb21pc2UgXHU1QkZDXHU1MTY1XHU1NDBEXHJcblx0XHRcdH0pLFxyXG5cdFx0XHR2aXRlQ29tcHJlc3Npb24oe1xyXG5cdFx0XHRcdGRlbGV0ZU9yaWdpbkZpbGU6IGZhbHNlLCAvLyBcdTUzOEJcdTdGMjlcdTU0MEVcdTUyMjBcdTk2NjRcdTUzOUZcdTY3NjVcdTc2ODRcdTY1ODdcdTRFRjZcclxuXHRcdFx0fSlcclxuXHRcdF0sXHJcblx0XHRyb290OiBwcm9jZXNzLmN3ZCgpLCAvLyBcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcclxuXHRcdHJlc29sdmU6IHsgYWxpYXMgfSwgLy8gXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHJcblx0XHRiYXNlOiBtb2RlLmNvbW1hbmQgPT09ICdzZXJ2ZScgPyAnLi8nIDogZW52LlZJVEVfUFVCTElDX1BBVEgsXHJcblx0XHRvcHRpbWl6ZURlcHM6IHtcclxuXHRcdFx0aW5jbHVkZTogWydlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvemgtY24nLCAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJ10sXHJcblx0XHR9LFxyXG5cdFx0c2VydmVyOiB7XHJcblx0XHRcdGhvc3Q6ICcwLjAuMC4wJywgLy8gXHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXHJcblx0XHRcdHBvcnQ6IGVudi5WSVRFX1BPUlQgYXMgdW5rbm93biBhcyBudW1iZXIsIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1N0FFRlx1NTNFM1x1NTNGN1xyXG5cdFx0XHRvcGVuOiBlbnYuVklURV9PUEVOID09PSAndHJ1ZScsIC8vIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxyXG5cdFx0XHRobXI6IHRydWUsIC8vIFx1NTQyRlx1NzUyOFx1NzBFRFx1NjZGNFx1NjVCMFxyXG5cdFx0XHRwcm94eToge1xyXG5cdFx0XHRcdCcvYXBpL2dlbic6IHtcclxuXHRcdFx0XHRcdC8vXHU1MzU1XHU0RjUzXHU2N0I2XHU2Nzg0XHU0RTBCXHU3Mjc5XHU2QjhBXHU1OTA0XHU3NDA2XHU0RUUzXHU3ODAxXHU3NTFGXHU2MjEwXHU2QTIxXHU1NzU3XHU0RUUzXHU3NDA2XHJcblx0XHRcdFx0XHR0YXJnZXQ6IGVudi5WSVRFX0lTX01JQ1JPID09PSAndHJ1ZScgPyBlbnYuVklURV9BRE1JTl9QUk9YWV9QQVRIIDogZW52LlZJVEVfR0VOX1BST1hZX1BBVEgsXHJcblx0XHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXHJcblx0XHRcdFx0XHRyZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Jy9hcGknOiB7XHJcblx0XHRcdFx0XHR0YXJnZXQ6IGVudi5WSVRFX0FETUlOX1BST1hZX1BBVEgsIC8vIFx1NzZFRVx1NjgwN1x1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFxyXG5cdFx0XHRcdFx0d3M6IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBXZWJTb2NrZXRcclxuXHRcdFx0XHRcdGNoYW5nZU9yaWdpbjogdHJ1ZSwgLy8gXHU2NjJGXHU1NDI2XHU0RkVFXHU2NTM5XHU4QkY3XHU2QzQyXHU1OTM0XHU0RTJEXHU3Njg0IE9yaWdpbiBcdTVCNTdcdTZCQjVcclxuXHRcdFx0XHRcdHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHQnXi93cy9pbmZvLy4qJzoge1xyXG5cdFx0XHRcdFx0dGFyZ2V0OiBlbnYuVklURV9BRE1JTl9QUk9YWV9QQVRILCAvLyBcdTc2RUVcdTY4MDdcdTY3MERcdTUyQTFcdTU2NjhcdTU3MzBcdTU3NDBcclxuXHRcdFx0XHRcdHdzOiB0cnVlLCAvLyBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggV2ViU29ja2V0XHJcblx0XHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0XHRidWlsZDoge1xyXG5cdFx0XHRvdXREaXI6ICdkaXN0JywgLy8gXHU2MjUzXHU1MzA1XHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHJcblx0XHRcdGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTUwMCwgLy8gXHU0RUUzXHU3ODAxXHU1MjA2XHU1MzA1XHU5NjA4XHU1MDNDXHJcblx0XHRcdC8vIFx1NUYwMFx1NTNEMVx1NEY3Rlx1NzUyOCBlc2J1aWxkIFx1NjZGNFx1NUZFQlx1RkYwQ1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NjI1M1x1NTMwNVx1NEY3Rlx1NzUyOCB0ZXJzZXIgXHU1M0VGXHU0RUU1XHU1MjIwXHU5NjY0XHU2NkY0XHU1OTFBXHU2Q0U4XHU5MUNBXHJcblx0XHRcdG1pbmlmeTogaXNEZXYgPyAgJ2VzYnVpbGQnIDogJ3RlcnNlcicsXHJcblx0XHRcdHRlcnNlck9wdGlvbnM6IHtcclxuXHRcdFx0XHRjb21wcmVzczoge1xyXG5cdFx0XHRcdFx0ZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBcdTUyMjBcdTk2NjQgY29uc29sZVxyXG5cdFx0XHRcdFx0ZHJvcF9kZWJ1Z2dlcjogdHJ1ZSwgLy8gXHU1MjIwXHU5NjY0IGRlYnVnZ2VyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRmb3JtYXQ6IHtcclxuXHRcdFx0XHRcdGNvbW1lbnRzOiBmYWxzZSAvLyBcdTUyMjBcdTk2NjRcdTYyNDBcdTY3MDlcdTZDRThcdTkxQ0FcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHJvbGx1cE9wdGlvbnM6IHtcclxuXHRcdFx0XHRvdXRwdXQ6IHtcclxuXHRcdFx0XHRcdGVudHJ5RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5baGFzaF0uanNgLFxyXG5cdFx0XHRcdFx0Y2h1bmtGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLltoYXNoXS5qc2AsXHJcblx0XHRcdFx0XHRhc3NldEZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uW2hhc2hdLltleHRdYCxcclxuXHRcdFx0XHRcdGNvbXBhY3Q6IHRydWUsXHJcblx0XHRcdFx0XHRtYW51YWxDaHVua3M6IHtcclxuXHRcdFx0XHRcdFx0dnVlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXHJcblx0XHRcdFx0XHRcdGVjaGFydHM6IFsnZWNoYXJ0cyddLFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHRcdGNzczogeyBwcmVwcm9jZXNzb3JPcHRpb25zOiB7IGNzczogeyBjaGFyc2V0OiBmYWxzZSB9LCAgc2NzczogeyBhcGk6IFwibW9kZXJuLWNvbXBpbGVyXCIgfX19LFxyXG5cdFx0ZGVmaW5lOiB7XHJcblx0XHRcdF9fVlVFX0kxOE5fTEVHQUNZX0FQSV9fOiBKU09OLnN0cmluZ2lmeShmYWxzZSksXHJcblx0XHRcdF9fVlVFX0kxOE5fRlVMTF9JTlNUQUxMX186IEpTT04uc3RyaW5naWZ5KGZhbHNlKSxcclxuXHRcdFx0X19JTlRMSUZZX1BST0RfREVWVE9PTFNfXzogSlNPTi5zdHJpbmdpZnkoZmFsc2UpLFxyXG5cdFx0XHRfX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXHJcblx0XHRcdF9fTkVYVF9OQU1FX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX25hbWUpLFxyXG5cdFx0fSxcclxuXHR9O1xyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHZpdGVDb25maWc7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFNb25leVxcXFwwMVNvZnR3YXJlXFxcXFVpXFxcXGRpZnk0ai11aVxcXFxzcmNcXFxcY29tcG9uZW50c1xcXFxJY29uU2VsZWN0b3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDAxTW9uZXlcXFxcMDFTb2Z0d2FyZVxcXFxVaVxcXFxkaWZ5NGotdWlcXFxcc3JjXFxcXGNvbXBvbmVudHNcXFxcSWNvblNlbGVjdG9yXFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8wMU1vbmV5LzAxU29mdHdhcmUvVWkvZGlmeTRqLXVpL3NyYy9jb21wb25lbnRzL0ljb25TZWxlY3Rvci9pbmRleC50c1wiO2ltcG9ydCB7IHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcyc7XHJcblxyXG5sZXQgaWRQZXJmaXggPSAnJztcclxuY29uc3QgaWNvbk5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5jb25zdCBzdmdUaXRsZSA9IC88c3ZnKFtePitdLio/KT4vO1xyXG5jb25zdCBjbGVhckhlaWdodFdpZHRoID0gLyh3aWR0aHxoZWlnaHQpPVwiKFtePitdLio/KVwiL2c7XHJcbmNvbnN0IGhhc1ZpZXdCb3ggPSAvKHZpZXdCb3g9XCJbXj4rXS4qP1wiKS9nO1xyXG5jb25zdCBjbGVhclJldHVybiA9IC8oXFxyKXwoXFxuKS9nO1xyXG4vLyBcdTZFMDVcdTc0MDYgc3ZnIFx1NzY4NCBmaWxsXHJcbmNvbnN0IGNsZWFyRmlsbCA9IC8oZmlsbD1cIltePitdLio/XCIpL2c7XHJcblxyXG5mdW5jdGlvbiBmaW5kU3ZnRmlsZShkaXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRjb25zdCBzdmdSZXMgPSBbXSBhcyBhbnk7XHJcblx0Y29uc3QgZGlyZW50cyA9IHJlYWRkaXJTeW5jKGRpciwge1xyXG5cdFx0d2l0aEZpbGVUeXBlczogdHJ1ZSxcclxuXHR9KTtcclxuXHRmb3IgKGNvbnN0IGRpcmVudCBvZiBkaXJlbnRzKSB7XHJcblx0XHRpY29uTmFtZXMucHVzaChgJHtpZFBlcmZpeH0tJHtkaXJlbnQubmFtZS5yZXBsYWNlKCcuc3ZnJywgJycpfWApO1xyXG5cdFx0aWYgKGRpcmVudC5pc0RpcmVjdG9yeSgpKSB7XHJcblx0XHRcdHN2Z1Jlcy5wdXNoKC4uLmZpbmRTdmdGaWxlKGRpciArIGRpcmVudC5uYW1lICsgJy8nKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zdCBzdmcgPSByZWFkRmlsZVN5bmMoZGlyICsgZGlyZW50Lm5hbWUpXHJcblx0XHRcdFx0LnRvU3RyaW5nKClcclxuXHRcdFx0XHQucmVwbGFjZShjbGVhclJldHVybiwgJycpXHJcblx0XHRcdFx0LnJlcGxhY2UoY2xlYXJGaWxsLCAnZmlsbD1cIlwiJylcclxuXHRcdFx0XHQucmVwbGFjZShzdmdUaXRsZSwgKCQxLCAkMikgPT4ge1xyXG5cdFx0XHRcdFx0bGV0IHdpZHRoID0gMDtcclxuXHRcdFx0XHRcdGxldCBoZWlnaHQgPSAwO1xyXG5cdFx0XHRcdFx0bGV0IGNvbnRlbnQgPSAkMi5yZXBsYWNlKGNsZWFySGVpZ2h0V2lkdGgsIChzMTogc3RyaW5nLCBzMjogc3RyaW5nLCBzMzogbnVtYmVyKSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmIChzMiA9PT0gJ3dpZHRoJykge1xyXG5cdFx0XHRcdFx0XHRcdHdpZHRoID0gczM7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoczIgPT09ICdoZWlnaHQnKSB7XHJcblx0XHRcdFx0XHRcdFx0aGVpZ2h0ID0gczM7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRpZiAoIWhhc1ZpZXdCb3gudGVzdCgkMikpIHtcclxuXHRcdFx0XHRcdFx0Y29udGVudCArPSBgdmlld0JveD1cIjAgMCAke3dpZHRofSAke2hlaWdodH1cImA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRyZXR1cm4gYDxzeW1ib2wgaWQ9XCIke2lkUGVyZml4fS0ke2RpcmVudC5uYW1lLnJlcGxhY2UoJy5zdmcnLCAnJyl9XCIgJHtjb250ZW50fT5gO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LnJlcGxhY2UoJzwvc3ZnPicsICc8L3N5bWJvbD4nKTtcclxuXHRcdFx0c3ZnUmVzLnB1c2goc3ZnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHN2Z1JlcztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHN2Z0J1aWxkZXIgPSAocGF0aDogc3RyaW5nLCBwZXJmaXggPSAnbG9jYWwnKSA9PiB7XHJcblx0aWYgKHBhdGggPT09ICcnKSByZXR1cm47XHJcblx0aWRQZXJmaXggPSBwZXJmaXg7XHJcblx0Y29uc3QgcmVzID0gZmluZFN2Z0ZpbGUocGF0aCk7XHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6ICdzdmctdHJhbnNmb3JtJyxcclxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbChodG1sOiBzdHJpbmcpIHtcclxuXHRcdFx0LyogZXNsaW50LWRpc2FibGUgKi9cclxuXHRcdFx0cmV0dXJuIGh0bWwucmVwbGFjZShcclxuXHRcdFx0XHQnPGJvZHk+JyxcclxuXHRcdFx0XHRgXHJcbiAgICAgICAgICAgICAgICA8Ym9keT5cclxuICAgICAgICAgICAgICAgIDxzdmcgaWQ9XCJsb2NhbC1pY29uXCIgZGF0YS1pY29uLW5hbWU9XCIke2ljb25OYW1lcy5qb2luKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQnLCdcclxuXHRcdFx0XHRcdFx0XHRcdCl9XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHN0eWxlPVwicG9zaXRpb246IGFic29sdXRlOyB3aWR0aDogMDsgaGVpZ2h0OiAwXCI+XHJcbiAgICAgICAgICAgICAgICAke3Jlcy5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgYFxyXG5cdFx0XHQpO1xyXG5cdFx0XHQvKiBlc2xpbnQtZW5hYmxlICovXHJcblx0XHR9LFxyXG5cdH07XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1MsT0FBTyxTQUFTO0FBQ2xULFNBQVMsZUFBZTtBQUN4QixTQUFTLGNBQWMsZUFBMEI7QUFDakQsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxxQkFBcUI7OztBQ05vVixTQUFTLGNBQWMsbUJBQW1CO0FBRTFaLElBQUksV0FBVztBQUNmLElBQU0sWUFBc0IsQ0FBQztBQUM3QixJQUFNLFdBQVc7QUFDakIsSUFBTSxtQkFBbUI7QUFDekIsSUFBTSxhQUFhO0FBQ25CLElBQU0sY0FBYztBQUVwQixJQUFNLFlBQVk7QUFFbEIsU0FBUyxZQUFZLEtBQXVCO0FBQzNDLFFBQU0sU0FBUyxDQUFDO0FBQ2hCLFFBQU0sVUFBVSxZQUFZLEtBQUs7QUFBQSxJQUNoQyxlQUFlO0FBQUEsRUFDaEIsQ0FBQztBQUNELGFBQVcsVUFBVSxTQUFTO0FBQzdCLGNBQVUsS0FBSyxHQUFHLFFBQVEsSUFBSSxPQUFPLEtBQUssUUFBUSxRQUFRLEVBQUUsQ0FBQyxFQUFFO0FBQy9ELFFBQUksT0FBTyxZQUFZLEdBQUc7QUFDekIsYUFBTyxLQUFLLEdBQUcsWUFBWSxNQUFNLE9BQU8sT0FBTyxHQUFHLENBQUM7QUFBQSxJQUNwRCxPQUFPO0FBQ04sWUFBTSxNQUFNLGFBQWEsTUFBTSxPQUFPLElBQUksRUFDeEMsU0FBUyxFQUNULFFBQVEsYUFBYSxFQUFFLEVBQ3ZCLFFBQVEsV0FBVyxTQUFTLEVBQzVCLFFBQVEsVUFBVSxDQUFDLElBQUksT0FBTztBQUM5QixZQUFJLFFBQVE7QUFDWixZQUFJLFNBQVM7QUFDYixZQUFJLFVBQVUsR0FBRyxRQUFR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
