import * as fs from 'fs';
import * as path from 'path';
import { Readable } from "stream";
import stripAnsi = require('strip-ansi');
import * as util from 'util';

import { Shell } from "../shell";
import { sleep } from "../utilities";

const text = `
# Title

This is some sameple content.
~~~
Welcome to the Einstein interactive command shell.
Type commands below.
A blank line exits.

Type "help" for information on commands.

einstein:/% cd a
einstein:/a% cd b
einstein:/a/b% pwd
/a/b
~~~

## Heading 1

Here is some more content.
~~~
einstein:/% services
no services running
einstein:/% einstein deploy lab
Deploying to lab.
einstein:/% services
no services running
einstein:/% # wait 1 seconds for service to start ...
einstein:/% services
no services running
~~~

The end.
`;

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

async function updateMarkdown(text: string) {
    // Split markdown into alternating text block and code sections.
    // TODO: BUGBUG: what if file starts with `~~~` on first line before `\n`?
    const sections = text.split(/\r?\n~~~\r?\n/g);
    const textBlocks: string[] = [];
    const scriptLines: string[] = [];
    const re = /einstein:[^%]*%\s+(.*)/;

    for (let i=0; i<sections.length; ++i) {
        if (i%2 === 0) {
            // This is a normal text block.
            textBlocks.push(sections[i]);
        } else {
            // This is a code block. Extract the shell input lines.
            const lines = sections[i].split(/\r?\n/g);
            for (const line of lines) {
                const m = line.match(re);
                if (m) {
                    scriptLines.push(m[1]);
                }
            }
            // Start with a '#SECTION' comment to allow us to partition the
            // Shell output.
            scriptLines.push('#SECTION');
        }
    }

    // Put the script into an scriptStream to use as Shell input.
    const script = scriptLines.join('\n');
    const input = scriptStream(scriptLines);

    // Run the shell with this script, while capturing output.
    const shell = new Shell({input, capture:true});
    const finished = shell.finished();
    await finished;

    // Group the captured output into code block sections.
    const output = shell.getOutput();
    const outputLines = stripAnsi(output).split(/\r?\n/g);
    let currentSection: string[] = [];
    const outputSections: string[][] = [currentSection];
    for (const line of outputLines) {
        if (line.includes('#SECTION')) {
            currentSection = [];
            outputSections.push(currentSection);
        } else {
            currentSection.push(line);
        }
    }

    // Finally, zip together the original text blocks and the new code blocks
    const finalLines: string[] = [];
    for (let i=0; i<textBlocks.length; ++i) {
        finalLines.push(textBlocks[i]);
        if (i<outputSections.length - 1) {
            finalLines.push('~~~');
            for (const line of outputSections[i]) {
                finalLines.push(line);
            }
            finalLines.push('~~~');
        }
    }
    // finalLines.push('');
    const final = finalLines.join('\n');

    return final;
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

    // Backup original file.
    const backupFile = originalFile + '.old';
    console.log(`Copying ${originalFile} to ${backupFile}.`);
    fs.copyFileSync(originalFile, backupFile);

    console.log(`Updating from ${backupFile} to ${originalFile}.`);
    const text = fs.readFileSync(backupFile, 'utf8');
    const updatedText = await updateMarkdown(text);
    // fs.writeFileSync(originalFile, updatedText, 'utf8');

    console.log('=======================================');
    console.log(updatedText);

    return 0;
}

async function go() {
    const updated = await updateMarkdown(text);
    const updated2 = await updateMarkdown(updated);
    console.log('=======================================');
    console.log(updated);
    console.log('???????????????????????????????????????');
    console.log(updated2);

    console.log(updated === updated2);
}

// function go2() {
//     console.log(path.resolve('documents/foobar'));
// }

// go();
main();
