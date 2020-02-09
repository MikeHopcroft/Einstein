// https://medium.com/@gajus/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
export class StdoutCapture {
    output = '';
    write = process.stdout.write.bind(process.stdout);

    start() {
        const context = this;

        function hook(
            chunk: string | Buffer,
            // tslint:disable-next-line:no-any
            encoding: any,
            callback: Function
        ) {
            if (typeof chunk === 'string') {
                context.output += chunk;
            }
            // tslint:disable-next-line:no-any
            return context.write(chunk as string, encoding, callback as any);
        }

        // tslint:disable-next-line:no-any
        process.stdout.write = hook as any;
    }

    stop() {
        process.stdout.write = this.write;
    }
}
