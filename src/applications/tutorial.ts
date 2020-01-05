import { Readable } from "stream";
// import * as stripAnsi from "strip-ansi";
const stripAnsi = require('strip-ansi');

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
einstein:/a/b%

bye
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
einstein:/% # wait 10 seconds for service to start ...
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

async function go() {
    // Split markdown into alternating text block and code sections.
    // TODO: BUGBUG: what if file starts with `~~~` on first line before `\n`?
    const sections = text.split(/\n~~~\n/g);
    const textBlocks: string[] = [];
    const scriptLines: string[] = [];
    const re = /einstein:[^%]*%\s+(.*)/;

    for (let i=0; i<sections.length; ++i) {
        if (i%2 === 0) {
            // This is a normal text block.
            textBlocks.push(sections[i]);
        } else {
            // This is a code block. Extract the shell input lines.
            const lines = sections[i].split(/\n/g);
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
    const outputLines = stripAnsi(shell.getOutput()).split(/\n/g);
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
        if (i<outputSections.length) {
            finalLines.push('~~~');
            for (const line of outputSections[i]) {
                finalLines.push(line);
            }
            finalLines.push('~~~');
        }
    }
    finalLines.push('');
    const final = finalLines.join('\n');

    console.log('???????????????????????????????????????');
    console.log(final);
}


go();
