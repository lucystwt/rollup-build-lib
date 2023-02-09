---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# 使用 Rollup 构建 JavaScript 库

---
transition: fade-out
---

# 什么是 Rollup ？

Rollup 是 JavaScript 的模块打包器，它可以将小块代码编译成更大更复杂的东西，例如库或应用程序。 它使用标准化的 ES 模块格式来编写代码，而不是以前的 CommonJS 和 AMD 等特殊解决方案。 ES 模块让您可以自由无缝地组合您最喜欢的库中最有用的单个函数。 Rollup 可以优化 ES 模块以在现代浏览器中更快地进行本机加载，或者输出允许 ES 模块工作流程的遗留模块格式。

- 📝 **Web、Node** - Rollup 支持多种输出格式：ES 模块、CommonJS、UMD、SystemJS 等
- 🎨 **Tree-shaking** - 基于深度执行路径分析，消除死代码
- 🧑‍💻 **无开销的代码拆分** - 通过仅使用输出格式的导入机制而不是客户加载程序代码，根据不同的入口点和动态导入拆分代码
- 🤹 **强大的插件** - 易于学习的插件 API，可以使用很少的代码实现强大的代码注入和转换。被 Vite 和 WMR 采用
- 🛠 **理您的特殊需求** - 没有固执己见，许多配置选项和丰富的插件接口使其成为特殊构建流程和更高级别工具的理想打包器
- 📤 **Vite 背后的打包工具** - Vite 使用合理的默认值和强大的插件预配置 Rollup，同时提供一个非常快速的开发服务器

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

---
transition: slide-up
---

# 打包工具库

创建一个目录，然后执行 pnpm init，会生成一个 package.json，接着安装 rollup

```shell
pnpm init
pnpm add rollup -D
```

创建 src/main.js 文件，新增并导出一个 add 函数

```javascript
export function add(a, b) {
  return a + b
}
```

执行 rollup 命令对文件进行打包

- npx rollup src/main.js --file dist/es.js --format es（ES Module)
- npx rollup src/main.js --file dist/cjs.js --format cjs（Node.js）
- npx rollup src/main.js --file dist/iife.js --format iife（browser）
- npx rollup src/main.js --file dist/umd.js --format umd --name "my-lib"（browsers and Node.js）

---

# Rollup 配置文件

创建 rollup.config.js，键入以下代码

```javascript
import { defineConfig } from "rollup"

export default defineConfig([
  {
    input: "src/main.js",
    output: [
      { file: "dist/index.cjs", format: "cjs", sourcemap: true },
      { file: "dist/index.mjs", format: "es", sourcemap: true },
    ],
  },
])
```

安装 rimraf 包（用于每次构建前清理），并在 package.json 的 scripts 下创建一条 build 命令，然后执行 pnpm build，此时会收到一条报错，原因是识别不了当前是 es module，需要将 rollup.config.js 修改为 rollup.config.mjs，并且在 package.json 下新增 "type": "module" 标识

```shell
pnpm add rimraf -D
"build": "rimraf dist && rollup -c"
rollup.config.js => rollup.config.mjs
"type": "module"
```

---

# @rollup/plugin-commonjs

Rollup 原生不支持 commonjs 模块，由于有些第三方库使用 commonjs，所以需要 commonjs 插件来转换 commonjs 模块

将 src/main.js 改造为 commonjs 模块，此时执行 build 会发现，index.mjs 并没有被转换成 ES Module

```javascript
function add(a, b) {
  return a + b
}

exports.add = add
```

接着使用 @rollup/plugin-commonjs 插件，打包后的 ES Module 已被正常转换

```shell
pnpm add @rollup/plugin-commonjs -D
```

```javascript
import commonjs from "@rollup/plugin-commonjs"

plugins: [commonjs()]
```

---

# @rollup/plugin-node-resolver

Rollup 原生不支持打包 node_modules 下的第三方模块，需要使用 node-resolver 处理第三方模块的打包

以流行的工具库 lodash 为例说明，安装 lodash，src/main.js 下新增一个函数 addByLodash，执行 build 命令，会发现 lodash 的 add 函数并没有被打包进我们的代码

```shell
pnpm add lodash
```

```javascript
import _ from "lodash"

export function addByLodash(a, b) {
  return _.add(a, b)
}
```

使用 @rollup/plugin-node-resolver 插件，lodash 的代码已经加入到到打包之后的文件

```shell
pnpm add @rollup/plugin-node-resolver -D
```

```javascript
import nodeResolve from "@rollup/plugin-node-resolve"

plugins: [commonjs(), nodeResolver()]
```

---

# Tree-shaking（摇树）

Tree-shaking 其实就是字面意思，摇树，把死叶子摇下来，只需要新鲜的叶子，也就是实际上使用到的函数

这个时候会发现，我们只使用了 lodash 的 add 函数，却多了将近 2W 行代码，虽然对于后端项目来说问题不大，但对于前端来说是不太可取的，因为 lodash 是 commonjs 实现的， Tree-shaking 只有 ES Module 才支持（我自己理解的），好在 lodash 提供了一个 ES Module 版本，叫 lodash-es

我们把 lodash 替换为 lodash es，再执行 build，会发现之前近 2W 行代码变成了 300 多行，说明 Tree-sharking 已经生效

```javascript
import { add as _add } from "lodash-es"

export function addByLodash(a, b) {
  return _add(a, b)
}
```

注意，这里的 import \_ 必须换成 import { add } 的形式，不然 Tree-shaking 是不会生效的

---

# Babel

Babel 是一个工具链，主要用于将 ECMAScript 2015+ 代码转换为当前和旧版浏览器或环境中向后兼容的 JavaScript 版本。以下是 Babel 可以做的主要事情

- 转换语法
- 目标环境中缺少的 Polyfill 功能（通过第三方 polyfill，例如 core-js）
- 源代码转换 (codemods)

```javascript
// Babel Input: ES2015 arrow function
;[1, 2, 3].map((n) => n + 1)

// Babel Output: ES5 equivalent
;[1, 2, 3].map(function (n) {
  return n + 1
})
```

---

# @rollup/plugin-babel (Rollup 集成 Babel)

src/main.js 新增一个 getFullName 函数，这个函数用到了 3 个新的 ES2015+ 特性，const、箭头函数和模板字符串，build 之后，文件没有什么变化

```javascript
export const getFullName = (firstName, lastName) => {
  return `${firstName} ${lastName}`
}
```

接着我们使用 @rollup/plugin-babel 插件，重新 build 之后，发现代码已经被转换成了 ES2015 以下的版本

```shell
pnpm add @babel/core @babel/preset-env @rollup/plugin-babel -D
```

```javascript
import { babel } from "@rollup/plugin-babel"

plugins: [
  nodeResolve(),
  commonjs(),
  babel({
    presets: ["@babel/preset-env"],
    extensions: [".js"],
    babelHelpers: "bundled",
  }),
],
```

---

# TypeScript

TypeScript 是一种基于 JavaScript 构建的强类型编程语言

- TypeScript 向 JavaScript 添加了额外的语法，以支持与你的编辑器更紧密的集成。在编辑器中尽早发现错误
- TypeScript 代码转换为 JavaScript，它可以在 JavaScript 运行的任何地方运行：在浏览器中、在 Node.js 或 Deno 上以及在您的应用程序中
- TypeScript 理解 JavaScript 并使用类型推断为您提供出色的工具，而无需额外的代码。

```typescript
interface User {
  id: number
  firstName: string
  lastName: string
  role: string
}
 
function updateUser(id: number, update: Partial<User>) {
  const user = getUser(id)
  const newUser = { ...user, ...update }
  saveUser(id, newUser)
}
```

---

# TypeScript 集成
安装 typescript，执行 tsc --init，目录下会新增一个 tsconfig.json，这是 ts 的配置文件

```shell
pnpm add typescript -D
npx tsc --init
```

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationDir": "./types"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

# @rollup/plugin-typescript

Rollup 原生不支持 TypeScript 的打包，需要通过插件集成
```shell
pnpm add @rollup/plugin-typescript -D
```

需要注意，Rollup 插件有先后顺序之分，typescript 插件需要放在 babel 之前

```javascript
import typescript from "@rollup/plugin-typescript"

plugins: [
  nodeResolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
  babel({
    presets: ["@babel/preset-env", "@babel/preset-typescript"],
    extensions: [".js", ".ts"],
    babelHelpers: "bundled",
  }),
]
```

---

# 改造为 TypeScript 工程
替换 src/main.js 为 src/main.ts，此时会发现文件会有很多报错，先把函数的类型补全，然后发现 lodash-es 还是飘红，提示说需要我们安装 @types/lodash-es，因为有些第三方库是 JavaScript 开发的，没有提供类型声明，所以库的开发者或社区有其它的人来维护这个库的声明文件，大部分流行的 JavaScript 库都有提供声明文件，声明文件需要单独安装，命名标准是 @types/{库名称}

```
pnpm add -D @types/lodash-es
```

改造后的 src/main.ts

```typescript
import { add as _add } from "lodash-es"

export function add(a: string, b: number) {
  return a + b
}

export function addByLodash(a: number, b: number) {
  return _add(a, b)
}

export const getFullName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`
}
```

---

# 打包 TypeScript 工程

修改 Rollup 入口文件配置，执行 build 打包，打包成功后 dist 目录下会多出一个 types 目录，里面有一个 main.d.ts，这是 TypeScript 源代码输出的所有声明文件，就是之前在 tsconfig.json 里的 declaration 配置。

一般比较主流的做法是将所有文件的类型声明全部输出到某一个文件里，而不是四散在各个文件中，有一个库可以帮忙完成这个任务，rollup-plugin-dts，需要在 Rollup 数组配置里新增一项打包声明文件的配置，执行 build 后，会发现 dist 目录下有一个 index.d.ts 文件，这个就是汇总之后的声明文件

```shell
pnpm add rollup-plugin-dts -D
```

```javascript
import dts from "rollup-plugin-dts"

input: "src/main.ts",

// 这里是数组的第二项，之前的打包配置是数组的第一项
{
  input: "dist/types/main.d.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts()],
},
```

可以先试着不加 Rollup 的 TypeScript 插件，打包会报
<span style="color: red;">[!] RollupError: Unexpected token (Note that you need plugins to import files that are not JavaScript)</span>
错误
