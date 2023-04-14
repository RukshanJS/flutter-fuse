
import * as vscode from 'vscode';
import { Diagnostic, Range, TextDocument } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let continueLooping = false;

    // TODO - Make this better
    const MAX_TIMEOUT = 5000; // Maximum timeout in milliseconds

    let importErrors: Diagnostic[];

	console.log('Congratulations, your extension "FlutterFuse" is now active!');

	let disposable = vscode.commands.registerCommand('flutter-fuse.quickFix', async() => {
        // Start looping for errors
        continueLooping = true;

		const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        setTimeout(() => {
            continueLooping = false;
        }, MAX_TIMEOUT);


        const document = editor.document;
        
        do {
            importErrors = getImportErrors(document);
            for (const diagnostic of importErrors) {
                await applyQuickFix(document, diagnostic.range);
            }
        } while (importErrors.length > 0 && continueLooping);

        await fixAllAndOrganizeImports();

        vscode.window.showInformationMessage('Quick fixes applied and unused imports removed.');
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
