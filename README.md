# line Copilot

## Usage

- 安装需要的包

  ```bash
  npm install
  npm install vsce -g
  ```

- 使用 `vsce` 进行打包

  ```bash
  vsce package
  ```

- 直接从 VSCode 中安装 `vsix` 文件

- 在插件设置中，填写 EasySearch 服务器的地址和 BOOK_ID（API_KEY 暂时不用设置）

- 在文件中使用 「空格」 触发补全

## Logic

- 当光标前出现 src/config.ts 中设置的触发词时，触发补全
- 获取当前行的内容，按照中文标点进行划分，获取最后一个中文标点后的内容
- 将内容发送到 EasySearch 服务器，获取返回的结果
