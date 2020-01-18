import * as readline from 'readline';

import { parse } from '../samples/true_or_false';

class Evaluator {
    private symbols = new Map<string, boolean>([
        ['true', true],
        ['false', false],
        ['a', true],
        ['b', true],
        ['c', true],
        ['x', false],
        ['y', false],
        ['z', false],
    ]);

    evaluate(expression: string): boolean {
        return parse(expression)(this.symbols);
    }
}

function repl() {
    console.log('Welcome to the interactive boolean expression evaluator.');
    console.log('Type expressions below. Expression are composed of');
    console.log('  constants: true, false');
    console.log('    symbols: a, b, c, x, y, z');
    console.log('  operators:');
    console.log('    &: logical and, e.g. "a & b"');
    console.log('    |: logical or, e.g. "a | b"');
    console.log('    !: logical negtation, e.q. "!a"');
    console.log('  parentheses, e.g. "a & (b | c)"');
    console.log();
    console.log('Type .samples for a list of sample expressions');
    console.log();
    console.log('A blank line exits.');
    console.log();

    const evaluator = new Evaluator();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '% '
    });

    rl.prompt();
    rl.on('line', (line: string) => {
        if (line.trim() === '') {
            rl.close();
        } else if (line.trim() === '.samples') {
            printSamples();
            rl.prompt();
        } else {
            const result = evaluator.evaluate(line);
            console.log(result);
            rl.prompt();
        }
    });
}

function printSamples() {
    console.log('true');
    console.log('false');
    console.log('a');
    console.log('b');
    console.log('c');
    console.log('x');
    console.log('y');
    console.log('z');
    console.log('!a');
    console.log('a & b & c');
    console.log('a & b & x');
    console.log('x | y | z | a');
    console.log('!(x & y)');
    console.log('!!!a');
    console.log('x & a | b');
    console.log('(x & a) | b');
    console.log('((a | x) & (b | y) & ((c | x) | (d | y)))');
}

repl();

