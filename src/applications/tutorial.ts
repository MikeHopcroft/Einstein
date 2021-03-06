import * as fs from 'fs';
import * as path from 'path';
import { Readable } from "stream";
import stripAnsi = require('strip-ansi');

import { sampleWorld } from '../samples';
import { Shell } from "../shell";
import { sleep, PeekableSequence } from "../utilities";

// Save for unit tests
// const text = `
// # Title

// Here is a non-shell block
// ~~~
// foo
// ~~~

// This is some sameple content.

// [//]: # (shell)
// ~~~
// Welcome to the Einstein interactive command shell.
// Type commands below.
// A blank line exits.

// Type "help" for information on commands.

// einstein:/% help
// einstein:/% cd a
// einstein:/a% cd b
// einstein:/a/b% pwd
// /a/b
// ~~~

// ## Heading 1

// Here is some more content.

// [//]: # (shell)
// ~~~
// einstein:/% services
// no services running
// einstein:/% einstein deploy lab
// Deploying to lab.
// einstein:/% services
// no services running
// einstein:/% # wait 1 seconds for service to start ...
// einstein:/% services
// no services running
// ~~~

// The end.
// `;

// Save for unit tests.
// function go2() {
//     const re = /einstein:[^%]*%\s+(.*)/;
//     const lines = [
//         "einstein:/a/b% pwd",
//         "no services running",
//         "einstein:/% # sleep for a while",
//         "einstein:/a/b% einstein deploy lab",
//     ];

//     for (const line of lines) {
//         const m = line.match(re);
//         console.log(m);
//     }
// }

// function go3() {
//     const re = /(\d+) second/;
//     const lines = [
//         "# wait 5 seconds for",
//         "# wait 10 seconds for",
//         "# pause for 23 seconds",
//         "# wait for service to start",
//         "# wait a few seconds for service to start",
//     ];

//     for (const line of lines) {
//         const m = line.match(re);
//         console.log(m);
//     }
// }

function scriptStream(lines: string[]) {
    const nSecondsRE = /(\d+) second/;
    const stream = new Readable();
    let i = 0;

    stream._read = async () => {
        if (i < lines.length) {
            const line = lines[i++];

            if (line.trim().startsWith('#')) {
                const m = line.match(nSecondsRE);
                if (m) {
                    const seconds = Number(m[1]);
                    await sleep(seconds * 1000);
                }
            }
            await(sleep(1));
            stream.push(line + '\n');
        } else {
            await sleep(1);
            stream.push(null);
        }
    }

    return stream;
}

class Parser {
    textBlocks: string[][] = [];
    codeBlocks: string[][] = [];
    input: PeekableSequence<string> | undefined;

    constructor(text: string) {
    }

    parse(text: string): { textBlocks: string[][], codeBlocks: string[][]} {
        this.input = new PeekableSequence(text.split(/\r?\n/g).values());
        this.textBlocks = [];
        this.codeBlocks = [];

        this.parseRoot();

        return {
            textBlocks: this.textBlocks,
            codeBlocks: this.codeBlocks
        }
    }

    parseRoot() {
        while (!this.input!.atEOS()) {
            this.parseTextBlock();
        }
    }

    parseTextBlock() {
        const textBlock: string[] = [];
        const codeBlock: string[] = [];
        const input = this.input!;
        let lastLine = '';
        while (!input.atEOS()) {
            if (input.peek()==='~~~') {
                const block = this.parseCodeBlock();
                if (lastLine !== '[//]: # (shell)') {
                    textBlock.push('~~~');
                    for (const line of block) {
                        textBlock.push(line);
                    }
                    textBlock.push('~~~');
                    lastLine = '';
                } else {
                    this.codeBlocks.push(block);
                    break;
                }
            } else {
                lastLine = input.get();
                textBlock.push(lastLine);
            }
        }
        this.textBlocks.push(textBlock);
    }

    parseCodeBlock(): string[] {
        const lines: string[] = [];

        const input = this.input!;
        input.skip('~~~');
        while (!input.atEOS() && input.peek()!=='~~~') {
            lines.push(input.get());
        }

        if (!input.skip('~~~')) {
            const message = 'Expected closing ~~~.';
            throw new TypeError(message);
        }

        return lines;
    }
}

async function updateMarkdown(text: string) {
    // Split markdown into alternating text block and code sections.
    const parser = new Parser(text);
    const { textBlocks, codeBlocks } = parser.parse(text);

    // Make a script by extracting shell input from code blocks.
    const scriptLines = makeScript(codeBlocks);

    // Run the script to gather new output.
    const outputLines = await runScript(scriptLines);

    // Break the output into sections corresponding to code blocks.
    const outputSections = makeOutputSections(outputLines);

    // Finally, zip together the original text blocks and the new code blocks
    const finalLines = interleaveTextAndCodeBlocks(textBlocks, outputSections);
    const finalText = finalLines.join('\n');

    return finalText;
}

function makeScript(codeBlocks: string[][]) {
    const re = /einstein:[^%]*%\s+(.*)/;
    const codeLines: string[] = [];

    for (const block of codeBlocks) {
        for (const line of block) {
            const m = line.match(re);
            if (m) {
                codeLines.push(m[1]);
            }
        }
        // End block with a '#SECTION' comment to allow us to partition the
        // Shell output.
        codeLines.push('#SECTION');
    }
    return codeLines;
}

async function runScript(scriptLines: string[]): Promise<string[]> {
    // Put the script into an scriptStream to use as Shell input.
    const inputStream = scriptStream(scriptLines);

    // Run the shell with this script, while capturing output.
    const world = sampleWorld();
    const shell = new Shell(
        world,
        {input: inputStream, capture: true}
    );
    const finished = shell.finished();
    await finished;

    // Group the captured output into code block sections.
    const outputText = shell.getOutput();
    const outputLines = stripAnsi(outputText).split(/\r?\n/g);

    return outputLines;
}

function makeOutputSections(lines: string[]) {
    let currentSection: string[] = [];
    const outputSections: string[][] = [currentSection];
    for (const line of lines) {
        if (line.includes('#SECTION')) {
            trimTrailingBlankLines(currentSection);
            currentSection = [];
            outputSections.push(currentSection);
        } else {
            currentSection.push(line);
        }
    
    }
    // NOTE: it's ok that we're dropping the last section because it is just
    // the Shell shutting down at the end of input.

    return outputSections;
}

function trimTrailingBlankLines(lines: string[]) {
    // Remove trailing blank lines.
    while (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
    }
}

function interleaveTextAndCodeBlocks(
    textBlocks: string[][],
    codeBlocks: string[][]
) {
    const finalLines: string[] = [];
    for (let i = 0; i < textBlocks.length; ++i) {
        for (const line of textBlocks[i]) {
            finalLines.push(line);
        }
        if (i < codeBlocks.length) {
            finalLines.push('~~~');
            for (const line of codeBlocks[i]) {
                finalLines.push(line);
            }
            finalLines.push('~~~');
        }
    }
    return finalLines;
}

function usage() {
    // TODO: implement
    console.log('TBD: show usage here');
}

async function main() {
    if (process.argv.length !== 3) {
        usage();
        return 1;
    }

    const originalFile = path.resolve(process.argv[2]);
    if (!fs.existsSync(originalFile)) {
        console.log(`Cannot find file ${originalFile}.`);
        return 1;
    }

    const outfile = path.join(
        path.dirname(originalFile),
        path.basename(originalFile, path.extname(originalFile)) + '.out.md');

    // // Backup original file.
    // const backupFile = originalFile + '.old';
    // console.log(`Copying ${originalFile} to ${backupFile}.`);
    // fs.copyFileSync(originalFile, backupFile);

    // console.log(`Updating from ${backupFile} to ${originalFile}.`);
    // const text = fs.readFileSync(backupFile, 'utf8');

    const text = fs.readFileSync(originalFile, 'utf8');
    const updatedText = await updateMarkdown(text);
    // fs.writeFileSync(originalFile, updatedText, 'utf8');

    console.log(`Writing to ${outfile}`);
    fs.writeFileSync(outfile, updatedText, 'utf8');

    console.log('=======================================');
    console.log(updatedText);

    return 0;
}

main();
