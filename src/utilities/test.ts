type Foo = (a: string, b: number) => IterableIterator<string>;

function *bar(): IterableIterator<string> {
    yield 'hello';
}

const baz: Foo = bar;
