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

以流行的工具库 lodash 为例说明，安装 lodash，src/main.js 下新增一个 mySum 函数调用 lodash 的 sum 函数，执行 build 命令，会发现 lodash 的 sum 函数并没有被打包进我们的代码里

```shell
pnpm add lodash
```

```javascript
import _ from "lodash"

export function mySum(collection) {
  return _.sum(collection)
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

我们把 lodash 替换为 lodash es，再执行 build，会发现之前近 2W 行代码变成了 70 多行，说明 Tree-sharking 已经生效

```shell
pnpm remove lodash
pnpm add lodash-es
```

```javascript
import { sum } from "lodash-es"

export function mySum(collection) {
  return sum(collection)
}
```

注意，这里的 import \_ 必须换成 import { sum } 的形式，不然 Tree-shaking 是不会生效的

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

# TypeScript 配置
安装 typescript，执行 tsc --init，目录下会新增一个 tsconfig.json

```shell
pnpm add typescript -D
npx tsc --init
```

这是 ts 的配置文件

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node", // 很关键
    "isolatedModules": true,
    "declaration": true,
    "declarationDir": "./types"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts"] // 这里忽略了测试文件，和以后单元测试相关
}
```

---

# 项目结构优化，并改造为 TypeScript 工程

1. 新增 src/string.ts 文件，导出一个 getFullName 的函数
2. 新增一个 src/calc.ts 文件，将 main.js 里所有的内容剪切到这，并修复没有类型导致报错的问题
3. 将 src/main.js 重命名 为 src/main.ts，作为入口文件导出 src/string.ts、src/calc.ts

```typescript
// src/string.ts
export const getFullName = (firstName: string, lastName: string) => `${firstName} ${lastName}`

// src/calc.ts
import { sum } from "lodash-es"

export function add(a: number, b: number) {
  return a + b
}

export function mySum(collection: number[]) {
  return sum(a, b)
}

// src/main.ts
export * from './calc'
export * from './string' 
```

--- 

# TypeScript 声明文件

此时发现 lodash-es 还是报错，提示说需要我们安装 @types/lodash-es，这是因为有些第三方库是 JavaScript 开发的，没有类型的概念，在 TypeScript 文件里面使用根本不知道参数、返回值啥的是什么类型，所以库的开发者或社区会有其他的人来维护这个库里所有的 TypeScript 类型，这个类型文件叫做声明文件，以 {xxx}.d.ts 命名

大部分流行的 JavaScript 库都有提供声明文件，如果库中已经集成了声明文件，就能直接在 TypeScript 里面使用，否则需要单独安装，声明文件库命名标准是 @types/{库名称}。

如果是 TypeScript 开发的项目，打包的时候也可以同时配置帮我们打包声明文件，我们之前在 tsconfig.json 里面也已经配置过了打包声明文件

我们需要安装 @types/lodash-es，安装完毕后发现 lodash-es 的报错已经消失了


```shell
pnpm add @types/lodash-es -D
```

---

# @rollup/plugin-typescript 和 rollup-plugin-dts

Rollup 原生不支持 TypeScript 的打包，需要通过插件集成，先安装相关的插件，然后修改 Rollup 配置

```shell
pnpm add @rollup/plugin-typescript rollup-plugin-dts -D
 
```

```javascript
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"

input: "src/main.ts",
plugins: [nodeResolve(), commonjs(), typescript()], // 插件会自动识别 tsconfig.json 配置文件
// 这里是 defineConfig 数组的第二项配置，意思是帮我们汇总 dist/types 下所有的声明文件到 dist/index.d.ts
{
  input: "dist/types/main.d.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts()],
}
```

执行 build 打包，成功后 dist 目录下会多出一个 types 目录，里面包含了项目所有的声明文件，因为我们在 tsconfig.json 里指定了声明文件输出的目录为 ./types，但同时还有一个 dist/index.d.ts 文件，这就是 rollup-plugin-dts 的作用，这个插件会帮我们汇总所有的声明文件到一个文件里，不至于会四散在各个文件里面

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

# @rollup/plugin-babel
之前我们在 src/string.ts 里新增了一个 getFullName 函数，其实这个函数用到了3个新的 ES2015+ 特性，const、箭头函数和模板字符串，老旧的浏览器中是无法识别这种语法的，我们可以通过 babel 去解决这个问题

```typescript
// ES2015+ 语法
export const getFullName = (firstName: string, lastName: string) => `${firstName} ${lastName}`

// ES2015 之前的语法
export var getFullName = function (firstName: string, lastName: string) {
  return firstName + ' ' + lastName
}
```

安装 Rollup 集成 Babel所需要的依赖，然后修改 rollup.config.js，重新 build 之后，会发现代码已经被转换成了 ES2015 以下的版本

```shell
pnpm add @babel/core @babel/preset-env @rollup/plugin-babel -D
```

```javascript
import { babel } from "@rollup/plugin-babel"

plugins: [
  commonjs(), nodeResolve(), typescript(),
  babel({ babelHelpers: "bundled", presets: ["@babel/preset-env"], extensions: [".js", ".ts"] }), // presets 作用是帮我转换成低版本代码，这里还需要配置支持 .ts 扩展名
],
```

---

# Vitest
Vitest 是一个极速的单元测试框架，特性如下（其实有很多，我没有从官网都抄过来）：

- 重用 Vite 的配置、转换器、解析器和插件——在您的应用程序和测试中保持一致
- Expect、snapshot、coverage 等——从 Jest 迁移非常简单
- 只重新运行相关的更改，就像 HMR 进行测试一样
- 由 esbuild 提供支持的开箱即用的 ESM、TypeScript 和 JSX


目前前端最流行的单元测试框架是 Jest（貌似是），不选它是因为对 ESM 和 TypeScript 支持不友好，需要通过 babel 或 ts-jest 这两种方式支持（库割裂严重且都有一定问题），而 Vitest 开箱即用（真香），安装 Vitest，然后在 package.json 的 scripts 里新增2条命令，coverage 是测试覆盖率相关的

```shell
pnpm add vitest -D
```

```json
scripts: {
  "build": "rollup -c",
  "test": "vitest",
  "coverage": "vitest run --coverage"
}
```

---

# 编写单元测试
新增测试文件，一般测试文件都以 .test.ts 为后缀（看个人风格）

```typescript
// src/calc.test.ts
import { assert, describe, expect, it } from "vitest"
import { add, mySum } from "./calc"
describe("calc module", () => {
  it("add fn", () => {
    expect(add(1, 2)).toEqual(3) // 成功
  })
  it("mySum fn", () => {
    assert.equal(mySum([1, 2, 3]), 6) 成功
  })
})

// src/string.test.ts，这里忽略了 import，因为空间不太够
it("getFullName fn", () => {
  const correctResult = "Chengyang Han"
  expect(getFullName("Chengyang", "Han")).toBe(correctResult) // 成功
  expect(getFullName("cHEnGyang", "HaN")).toBe(correctResult) // 失败
  expect(getFullName(" C heng ya ng", "Ha n ")).toBe(correctResult) // 失败
})
```

describe 我理解为是将测试用例分组的意思。这里故意写了2个失败的测试用例，但发现只抛出了一个错误，是因为在同一个 it 函数下只会抛出第一个错误，如果确实想要2个错误，就单独再用1个 it 函数（个人理解）

---

# 优化 getFullName 函数

修改 getFullName 如下，Vitest 有 HMR 特性无需重新执行 test 命令，发现测试已经通过

```typescript
export const getFullName = (firstName: string, lastName: string) => {
  let _firstName = firstName.replace(/\s+/g, "")
  let _lastName = lastName.replace(/\s+/g, "")

  _firstName =
    _firstName.slice(0, 1).toUpperCase() + _firstName.slice(1).toLowerCase()
  _lastName =
    _lastName.slice(0, 1).toUpperCase() + _lastName.slice(1).toLowerCase()

  return `${_firstName} ${_lastName}`
}
```

总之，单元测试可以让我们的项目变得更加健壮，就和 TypeScript 一样，属于前期多花费一些成本，但可以让后期维护的成本更加低廉！

---

# 项目发布
npm (Node Package Manager) 是一个 Node.js 包管理和分发工具，已经成为了非官方的发布 Node 模块（包）的标准，目前基本已经成为前端统一发布包的网站，发布包之前需要对 package.json 做几个配置

```json
"name": "my-lib", // 包名，也就是通过 npm install 的名字
"version": "1.0.0", // 包版本，第1位代表大版本、第2位代表小版本、第3位代表补丁版本
"license": "MIT", // 开源协议，一般 MIT、BSD、Apache 的开源协议用的比较多
"author": "hcy", // 作者
"description": "A JavaScript helper library, written in TypeScript.", // 描述
"keywords": ["lib", "library", "helpers", "utils"], // 关键词，在 npm 搜索上以 Tags 的形式展示
"homepage": "https://github.com/lucystwt/wingman", // 包的官网，如果没有可以不填，会在 npm 上提供跳转链接
"repository": { "type": "git", "url": "https://github.com/lucystwt/wingman" }, // 包的仓库也就是源码，也会在 npm 上提供跳转链接
"files": ["dist"], // 发布到 npm 上的文件，我们一般只会发布 dist 下的文件，不会把源代码也发布上去。注意这里 npm 也会同时将我们的 LICENSE、README.md、package.json 等文件也一起发布上去，不要在这里填写一些隐私有关的东西
"main": "dist/index.cjs", // CommonJS 识别的入口文件
"module": "dist/index.mjs", // ESM 识别的入口文件
"types": "dist/index.d.ts", // TS 声明文件
```

这些配置完毕之后可以使用 npm whoami，如果没有登录会提示我们使用 npm adduser，终端会提供输入用户名邮箱密码相关的信息（需要邮箱验证），注册完毕之后使用 npm login 命令登录，登录成功之后使用 npm publish 就可以发布到 npm 上了（每次发布前都需要修改之前未使用过的版本号，不然会提示报错）

---

# 发布前的工作
当然发布没有那么简单，可能我们代码写的有问题就不小心发布上去了，建议这里对发布前做一些处理，在 package.json 的 scripts 新增几个脚本命令

```json
"scripts": {
  "build": "rimraf dist && rollup -c",
  "test": "vitest",
  "coverage": "vitest run --coverage",
  "lint": "eslint .", // eslint 是检查代码的语法规范相关的，在之前一次技术分享分享过，这里略过如何使用
  "check": "tsc -p tsconfig.json --noEmit", // tsc 是检查 ts 语法的编译器，-p 意思是提供一个 ts 配置文件，--noEmit 意思是只执行检查而不编译成 js 文件
  "ci": "pnpm build && pnpm test && pnpm lint && pnpm check", // 将 build、test、lint、check 这几个命令串起来执行
  "prepublishOnly": "pnpm ci", // 这是 npm 提供的一个钩子，每次执行 npm publish 之前都会执行这个命令，如果执行失败，npm publish 将不会执行
}
```

发布前执行 ci 命令可以让我们发布的内容更可靠健壮

- build 可以让发布的包是最新的代码
- test 可以让发布前通过单元测试
- lint 和 check 可以保证我们的代码符合语法规范

---

# 构建 React 组件
安装 react、react-dom 和其声明库，新增 src/user.tsx 文件编写一个 React 组件，并从 src/main.ts 默认导出

注意，还需要在 tsconfig.json 的 compilerOptions 里新增一项 "jsx": "react-jsx" 配置，这是 React 17+ 新出来的特性，无需在每次编写 React 组件的时候 import React from 'react' 了

```shell
pnpm add react react-dom @types/react @types/react-dom -D
```

```json
// tsconfig.json
"jsx": "react-jsx" // 可选值有 react、react-jsx、react-native、react-jsxdev 等
```

```typescript
// src/main.ts
export * from "./calc"
export * from "./string"
export { default as User } from "./user"

// user.tsx，代码太多了显示不完整了
import { getFullName } from "./string"

export interface UserProps {
  image: string
  firstName: string
  lastName: string
  description?: React.ReactNode
}

const User: React.FC<UserProps> = ({
  image,
  firstName,
  lastName,
  description,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src={image}
        style={{
          width: 66,
          height: 66,
          border: "1px solid #ccc",
          borderRadius: "50%",
          padding: 8,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "start",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {getFullName(firstName, lastName)}
        </div>
        {description && <div>{description}</div>}
      </div>
    </div>
  )
}

export default User
```

---

# peerDependencies

package.json 主要有3个和管理依赖相关的属性

1. dependencies (执行 install 没有加 -D 的时候，会随着库安装的同时一起被安装)
2. devDependencies (执行 install 加了 -D 的时候，不会随着库安装的同时一起被安装)
3. peerDependencies (这个需要自己管理依赖的指定版本，会让使用者同时一起安装的依赖)

lodash 的 sum 函数与生产环境相关，安装到 dependencies，其余的依赖都是打包、单元测试相关，安装到 devDependencies，React 需要同时放进 peerDependencies 和 devDependencies 而不是 dependencies，因为用户如果需要使用 React 组件，肯定是一个基于 React 的项目，没必要让用户再安装一次了，此时我们要使用 peerDependencies 指定我们的 React 库依赖的 React 版本

```json
"peerDependencies": {
  "react": ">=16.8.0", // React Hooks 基于 16.8，如果需要使用并发相关特性，需要指定 "react": ">=18.0.0"
  "react-dom": ">=16.8.0"
}
```

其实开发库用到的所有依赖都可以不放到 dependencies，而是 peerDependencies，交给用户来安装，比如：

```shell
pnpm add lodash-es react react-dom lib-a lib-b lib-c lib-d lib-e lib-f lib-g # 用户可能要骂人了，所以还是建议库的开发者对依赖管理做一些取舍
```

---

# 简单测试 React 组件

那么如何测试这个组件呢，组件的单元测试编写要复杂的多先不过多介绍了，还有一种方案是使用 Storybook 这个库（简称 SB）,可以以隔离组件的形式进行 UI 测试，这个也需要一些配置，而且目前对 pnpm 支持不友好

我们使用最简单的组件测试形式 link，npm、yarn、pnpm 对 link 的使用都有点不同（需要参照对应的文档）

pnpm link 操作步骤如下：

1. 在当前开发库的根目录下执行 pnpm link --global，这个库就被 link 到全局了，库名为 package.json 里的 name 字段，入口文件 根据环境有所不同，可能是 main 或者 module 字段的值
2. 在别的项目中执行 pnpm link {name} --global，这样就能直接使用开发库了

实际操作一下，使用 pnpm create vite 创建一个 React 项目

```typescript
import { User } from "my-lib" // 库执行 link 时使用的名称

<User 
  image={image} 
  firstName="Chengyang" 
  lastName="Han"
  description={<span style={{ color: "red" }}>我是前端开发</span>}
/>
```

---

# CSS-in-JS
111

---
class: "text-center mt-30"
---

# Thank you for watching
感谢你的观看
