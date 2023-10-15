import * as vscode from "vscode";

export const nextCompleteNumberCommand = async () => {
  const numberOptions = ["1", "2", "3", "4", "5"]; // 可供选择的数字选项

  const selectedNumber = await vscode.window.showQuickPick(numberOptions, {
    placeHolder: "请选择连续补全的数量",
  });

  if (selectedNumber) {
    // 获取用户的配置
    const configuration = vscode.workspace.getConfiguration("SentenceCopilot");

    // 更新numberOption的值
    configuration.update(
      "nextCompleteNumber",
      parseInt(selectedNumber),
      vscode.ConfigurationTarget.Global
    );

    // 保存配置更改
    // vscode.workspace.getConfiguration().save();
    vscode.window.showInformationMessage(
      `已修改连续补全数量为: ${selectedNumber}`
    );
  }
};
