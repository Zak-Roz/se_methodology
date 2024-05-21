const fs = require('fs');
const path = require('path');

class LinesInformation {
    constructor(code = "") {
        if (code === "") {
            this.physicalLines = 0;
            this.logicalLines = 0;
            this.blankLines = 0;
            this.commentLines = 0;
            this.cyclomaticComplexity = 1;
        } else {
            this.physicalLines = LinesInformation.countPhysicalLines(code);
            this.logicalLines = LinesInformation.countSLOC(code);
            this.blankLines = LinesInformation.countBlankLines(code);
            this.commentLines = LinesInformation.countCommentLines(code);
            this.cyclomaticComplexity = LinesInformation.calculateCyclomaticComplexity(code);
        }
    }

    get commentingLevel() {
        return this.physicalLines === 0 ? 0 : (this.commentLines / this.physicalLines) * 100;
    }

    static countPhysicalLines(code) {
        return code.split('\n').length;
    }

    static countBlankLines(code) {
        return code.split('\n').filter(line => line.trim() === '').length;
    }

    static countCommentLines(code) {
        const lines = code.split('\n');
        let commentLineCount = 0;
        let isInsideComment = false;

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith("/*")) {
                isInsideComment = true;
            }

            if (isInsideComment || trimmedLine.startsWith("//") || trimmedLine.endsWith("*/")) {
                commentLineCount += 1;
            }

            if (trimmedLine.endsWith("*/")) {
                isInsideComment = false;
            }
        }

        return commentLineCount;
    }

    static removeComments(code) {
        return code
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");
    }

    static countSLOC(code) {
        const codeWithoutComments = this.removeComments(code);
        const tokens = codeWithoutComments.split(/\s+/).filter(token => token);

        const selectionStatements = new Set(["if", "else", "else if", "?", "try", "catch", "switch", "case"]);
        const iterationStatements = new Set(["for", "while", "do"]);
        const jumpStatements = new Set(["return", "break", "goto", "exit", "continue", "throw"]);
        const expressionStatements = new Set(["=", "(", "[", "{", "+=", "-=", "*=", "/=", "%=", ";"]);
        const compilerDirective = new Set(["#"]);
        
        let slocCount = 0;

        for (const token of tokens) {
            if (selectionStatements.has(token) || 
                iterationStatements.has(token) || 
                jumpStatements.has(token) || 
                compilerDirective.has(token) || 
                expressionStatements.has(token)) {
                slocCount += 1;
            }
        }

        return slocCount;
    }

    static calculateCyclomaticComplexity(code) {
        const codeWithoutComments = this.removeComments(code);

        const patterns = [
            /if\s*\(/g, /else\s+if\s*\(/g, /while\s*\(/g, /for\s*\(/g,
            /case\s+\S+\s*:/g, /\?\s*\S+\s*:/g, /catch\s*\(/g
        ];

        let complexity = 1;

        patterns.forEach(pattern => {
            const matches = codeWithoutComments.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });

        return complexity;
    }

    combine(second) {
        this.physicalLines += second.physicalLines;
        this.logicalLines += second.logicalLines;
        this.blankLines += second.blankLines;
        this.commentLines += second.commentLines;
        this.cyclomaticComplexity += second.cyclomaticComplexity - 1; // To avoid over counting the base complexity
    }

    toString() {
        return `Physical lines: ${this.physicalLines}\n` +
               `Logical lines: ${this.logicalLines}\n` +
               `Blank lines: ${this.blankLines}\n` +
               `Comment lines: ${this.commentLines}\n` +
               `Commenting level: ${this.commentingLevel.toFixed(2)}%\n` +
               `Cyclomatic complexity: ${this.cyclomaticComplexity}`;
    }
}

function countLinesInDirectory(directoryPath) {
    let totalLinesInfo = new LinesInformation();

    function processDirectory(directoryPath) {
        const files = fs.readdirSync(directoryPath);

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                processDirectory(filePath);
            } else if (stat.isFile() && ['.js', '.mjs', '.ts', '.map'].includes(path.extname(filePath))) {
                const code = fs.readFileSync(filePath, 'utf-8');
                const linesInfo = new LinesInformation(code);
                totalLinesInfo.combine(linesInfo);
            }
        });
    }

    processDirectory(directoryPath);

    return totalLinesInfo;
}

const directoryPath = path.join(__dirname, 'node_modules/@angular/core');
const totalLinesInfo = countLinesInDirectory(directoryPath);
console.log(totalLinesInfo.toString());
