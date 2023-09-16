import * as vscode from 'vscode';
import { Diagnostic, Range, TextDocument } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Flutter Fuse: Congratulations, your extension "Flutter Fuse" is now active!');

  let disposable = vscode.commands.registerCommand('flutter-fuse.quickFix', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Flutter Fuse: No active text editor found.');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Flutter Fuse: Fixing import errors...',
        cancellable: true,
      },
      async (progress, token) => {
        try {
          const document = editor.document;

          const changeDiagnosticListener = vscode.languages.onDidChangeDiagnostics(async (e) => {
            if (e.uris.some((uri) => uri.toString() === document.uri.toString())) {
              const importErrors = getImportErrors(document);
              if (importErrors.length === 0) {
                changeDiagnosticListener.dispose();
                vscode.window.showInformationMessage('Flutter Fuse: Import fixing operation completed successfully.');
              }
            }
          });

          await fixAllImportErrors(document, progress);

          if (token.isCancellationRequested) {
            changeDiagnosticListener.dispose();
            vscode.window.showInformationMessage('Flutter Fuse: Import fixing operation canceled.');
          }
        } catch (err) {
          vscode.window.showErrorMessage(`Flutter Fuse: An error occurred: ${err}`);
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

function getImportErrors(document: TextDocument): vscode.Diagnostic[] {
  const diagnostics = vscode.languages.getDiagnostics(document.uri);
  return diagnostics.filter((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error);
}

async function fixAllImportErrors(document: TextDocument, progress: vscode.Progress<{ increment: number }>): Promise<void> {
  let importErrors = getImportErrors(document);
  while (importErrors.length > 0) {
    for (const diagnostic of importErrors) {
      await applyQuickFix(document, diagnostic.range);
    }
    // Re-fetch diagnostics
    await new Promise((resolve) => setTimeout(resolve, 300)); // Give some time for diagnostics to update
    importErrors = getImportErrors(document);
    progress.report({ increment: 1 });
  }
}

async function applyQuickFix(document: TextDocument, range: Range): Promise<void> {
  const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>('vscode.executeCodeActionProvider', document.uri, range);

  if (!codeActions) {
    return;
  }

  const importAction = codeActions.find((action) => action.title.startsWith('Import'));
  if (!importAction) {
    return;
  }

  if (importAction.command) {
    await vscode.commands.executeCommand(importAction.command.command, ...(importAction.command.arguments || []));
  } else if (importAction.edit) {
    await vscode.workspace.applyEdit(importAction.edit);
  }
}

export function deactivate() {}
