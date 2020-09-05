# toy-react 实现简易版 react

#### 配置
- 项目初始化 `npm init -y` `git init` 配置 `.gitignore` 文件
- 安装 ` yarn add webpack webpack-cli -D` 配置 `webpack.config.js` 文件已经 `package.json` 的 `script` 命令
- 安装 babel ` yarn add babel-loader @babel/core @babel/preset-env @babel/plugin-transform-react-jsx -D` 配置`webpack.config.js`文件和 `.babelrc` 文件
- `.babelrc` 中的 `plugin` 可配置 `pragma`参数，配置修改`React.createElement`

#### react
- react 中标签名是小写则为原生标签，大写则为自己定义的组件(传入 createElement 方法中的 tagName 也不用''包裹)
