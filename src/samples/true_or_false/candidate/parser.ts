import { PeekableSequence } from './peekable_sequence';

export type SymbolTable = Map<string, boolean>;
export type Evaluator = (symbols: SymbolTable) => boolean;

// Constructs an Evaluator function from a textual boolean expression over
// variable names. The expression can be made up of
//   TERM: a variable name - any sequence of non-space characters that
//         does not include the symbols '(', ')', '&', '|', and '!'
//   LOGICAL OR: '|'
//   LOGICAL AND: '&'
//   LOGICAL NEGATION: '!'
//   PARENTHESES: '(', ')'
//
// The Evaluator takes a single parameter that is a Map from TERMS to boolean
// values. It returns the truth value of the expression.
//
// For example, if the symbols parameter of the Evaluator maps 'a' and 'b' to
// to true and 'x' to false then the following expressions would evaluate to
// true:
//   'a'
//   'b'
//   'a & b'
// and the following expressions would evaluate to false:
//   'x'
//   '!a'
//
export function parse(text: string): Evaluator {
    // Tokenize the input string.
    // The result should be an array of suite names, and symbols '(', ')', '&',
    // '|', and '!'.
    const re = new RegExp('([\\s+|\\&\\|\\!\\(\\)])');
    const tokens = text
        .split(re)
        .map(x => x.trim())
        .filter(x => x.length > 0);

    // Create a stream of tokens.
    const input = new PeekableSequence<string>(tokens.values());

    // Parse the sequence of tokens.
    return parseDisjunction(input);
}

// CONJUNCTION [| DISJUNCTION]*
function parseDisjunction(input: PeekableSequence<string>): Evaluator {
    const children: Evaluator[] = [parseConjunction(input)];
    while (!input.atEOS()) {
        if (input.peek() === ')') {
            break;
        } else if (input.peek() === '|') {
            input.get();
            children.push(parseConjunction(input));
        } else {
            const message = "Expected '&' or '|' operator";
            throw TypeError(message);
        }
    }

    if (children.length === 1) {
        return children[0];
    } else {
        return (symbols: SymbolTable) => {
            for (const child of children) {
                if (child(symbols)) {
                    return true;
                }
            }
            return false;
        };
    }
}

// UNARY [& CONJUNCTION]*
function parseConjunction(input: PeekableSequence<string>): Evaluator {
    const children: Evaluator[] = [parseUnary(input)];
    while (!input.atEOS()) {
        if (input.peek() === ')') {
            break;
        } else if (input.peek() === '&') {
            input.get();
            children.push(parseConjunction(input));
        } else {
            break;
        }
    }

    if (children.length === 1) {
        return children[0];
    } else {
        return (symbols: SymbolTable) => {
            for (const child of children) {
                if (!child(symbols)) {
                    return false;
                }
            }
            return true;
        };
    }
}

// TERM | !TERM
function parseUnary(input: PeekableSequence<string>): Evaluator {
    if (input.nextIs('!')) {
        input.get();
        const unary = parseUnary(input);
        return (symbols: SymbolTable) => !unary(symbols);
    } else if (input.nextIs('(')) {
        input.get();
        const unary = parseDisjunction(input);
        if (!input.nextIs(')')) {
            const message = "Expected ')'";
            throw TypeError(message);
        }
        input.get();
        return unary;
    } else {
        return parseTerm(input);
    }
}

// TERM
function parseTerm(input: PeekableSequence<string>): Evaluator {
    if (!input.atEOS()) {
        const next = input.peek();
        if (['&', '|', '!', '(', ')'].includes(next)) {
            const message = `Unexpected operator "${next}"`;
            throw TypeError(message);
        }
        const variable = input.get();
        return (symbols: SymbolTable) => {
            const value = symbols.get(variable);
            if (value === undefined) {
                const message = `Undefined variable ${variable}`;
                throw TypeError(message);
            }
            return value;
        }
    } else {
        const message = 'Expected a variable';
        throw TypeError(message);
    }
}
