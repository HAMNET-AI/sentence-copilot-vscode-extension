import * as vscode from "vscode";
import { fetchAvailableBookMeta } from "../utils/fetchCodeCompletions";
import { DEFAULT_API_BASE } from "../config";

export const nextCompleteNumberCommand = async () => {
  const numberOptions = ["1", "2", "3", "4", "5"]; // 可供选择的数字选项

  const selectedNumber = await vscode.window.showQuickPick(numberOptions, {
    placeHolder: "🍗 修改连续补全的句子数量",
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

export const chooseBookCommand = async () => {
  try {
    const bookData = await fetchAvailableBookMeta(
      process.env.API_BASE || DEFAULT_API_BASE,
      process.env.API_KEY || ""
    );
    const bookOptions = bookData.map((book: any) => ({
      label: book.name, // 显示的名称
      // description: book.book_id, // 后面的描述
      bookID: book.book_id,
    }));
    const selectedBook = (await vscode.window.showQuickPick(bookOptions, {
      placeHolder: "📓 修改摘要书籍名称",
      matchOnDescription: true, // 根据 ID 进行匹配
    })) as any;

    if (selectedBook) {
      const bookId = selectedBook.bookID;
      // 获取用户的配置
      const configuration =
        vscode.workspace.getConfiguration("SentenceCopilot");
      // 更新numberOption的值
      configuration.update("bookID", bookId, vscode.ConfigurationTarget.Global);
      configuration.update(
        "bookID",
        bookId,
        vscode.ConfigurationTarget.Workspace
      );

      vscode.window.showInformationMessage(
        `已切换摘要书籍: ${selectedBook.label}`
      );
    }
  } catch (error) {
    console.error("An error occurred while fetching book data:", error);
    vscode.window.showErrorMessage("获取待选书籍失败");
  }
};
