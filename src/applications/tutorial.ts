import { Readable } from "stream";

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

function go2() {
    const re = /einstein:[^%]*%\s+(.*)/;
    const lines = [
        "einstein:/a/b% pwd",
        "no services running",
        "einstein:/% # sleep for a while",
        "einstein:/a/b% einstein deploy lab",
    ];

    for (const line of lines) {
        const m = line.match(re);
        console.log(m);
    }
}

function go3() {
    const re = /(\d+) second/;
    const lines = [
        "# wait 5 seconds for",
        "# wait 10 seconds for",
        "# pause for 23 seconds",
        "# wait for service to start",
        "# wait a few seconds for service to start",
    ];

    for (const line of lines) {
        const m = line.match(re);
        console.log(m);
    }
}

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
    const sections = text.split(/~~~/g);
    // console.log(sections);

    const textBlocks: string[] = [];
    const scriptLines: string[] = [];
    const re = /einstein:[^%]*%\s+(.*)/;

    for (let i=0; i<sections.length; ++i) {
        if (i%2 === 0) {
            // console.log(`Text:`);
            // console.log(sections[i]);
            textBlocks.push(sections[i]);
        } else {
            // console.log(`Code:`);
            // console.log(sections[i]);

            scriptLines.push('#SECTION');
            const lines = sections[i].split(/\n/g);
            for (const line of lines) {
                const m = line.match(re);
                if (m) {
                    scriptLines.push(m[1]);
                }
            }
        }
    }
    const script = scriptLines.join('\n');
    // console.log(script);

    // const input = new Readable();
    // input.push(script);
    // input.push(null);
    const input = scriptStream(scriptLines);

    const shell = new Shell({input, capture:true});
    const finished = shell.finished();

    await finished;
    console.log('???????????????????????????????????????');
    console.log(shell.getOutput());
}

// const m = line.match(this.nSecondsRE);
// if (m) {
//     const seconds = Number(m[1]);
//     await sleep(seconds * 1000);
// }


go();
