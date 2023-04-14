
import * as vscode from 'vscode';
import { Diagnostic, Range, TextDocument } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let continueLooping = false;

    // TODO - Make this better
    const MAX_TIMEOUT = 10000; // Maximum timeout in milliseconds

    let importErrors: Diagnostic[];

	console.log('Flutter Fuse: Congratulations, your extension "Flutter Fuse" is now active!');

	let disposable = vscode.commands.registerCommand('flutter-fuse.quickFix', async() => {
        // Start looping for errors
        continueLooping = true;

		const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Flutter Fuse: No active text editor found.');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Flutter Fuse: Fixing import errors...",
            cancellable: true
        }, async (progress, token) => {
            let continueLooping = true;
            const timeout = setTimeout(() => {
                continueLooping = false;
            }, MAX_TIMEOUT);
        
            try {
                const document = editor.document;
                let importErrors = getImportErrors(document);
        
                while (importErrors.length > 0 && continueLooping && !token.isCancellationRequested) {
                    for (const diagnostic of importErrors) {
                        await applyQuickFix(document, diagnostic.range);
                    }
                    importErrors = getImportErrors(document);
                    progress.report({ increment: 1 });
                }
        
                if (!continueLooping) {
                    vscode.window.showWarningMessage("Flutter Fuse: Import fixing operation timed out. Some imports may not have been fixed.");
                } else if (token.isCancellationRequested) {
                    vscode.window.showInformationMessage("Flutter Fuse: Import fixing operation canceled.");
                } else {
                    vscode.window.showInformationMessage("Flutter Fuse: Import fixing operation completed successfully.");
                }
            } finally {
                clearTimeout(timeout);
            }
        });

        
	});

	context.subscriptions.push(disposable);
}

function getImportErrors(document: TextDocument): vscode.Diagnostic[] {
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    return diagnostics.filter(diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Error);
}

async function applyQuickFix(document: TextDocument, range: Range): Promise<void> {
    const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>('vscode.executeCodeActionProvider', document.uri, range);

    if (!codeActions) {
        return;
    }

    const importAction = codeActions.find(action => action.title.startsWith('Import'));
    if (!importAction) {
        return;
    }

    if (importAction.command) {
        await vscode.commands.executeCommand(importAction.command.command, ...(importAction.command.arguments || []));
    } else if (importAction.edit) {
        await vscode.workspace.applyEdit(importAction.edit);
    }
}

async function fixAllAndOrganizeImports(): Promise<void> {
    await vscode.commands.executeCommand('editor.action.fixAll');
	return;
}

export function deactivate() {}
