import * as yaml from 'js-yaml';

// RSA for key, AES for data
// https://stackoverflow.com/questions/8750780/encrypting-data-with-public-key-in-node-js
// https://security.stackexchange.com/questions/33434/rsa-maximum-bytes-to-encrypt-comparison-to-aes-in-terms-of-security
// https://stackoverflow.com/questions/32066464/how-do-i-actually-encrypt-something-with-the-diffie-hellman-apis-in-nodejs
// https://www.w3schools.com/nodejs/ref_crypto.asp

// tslint:disable-next-line:no-any
function decrypt(data: any, publicKey: string) {
    walker(data, (text: string) => `DECRYPT(${text})`);
}

// tslint:disable-next-line:no-any
function encrypt(data: any, publicKey: string) {
    walker(data, (text: string) => ({ secret: `ENCRYPT(${text})` }));
}

const sample = {
    a: {
        x: 1,
        y: 2,
        z: 3
    },
    b: {
        secret: 'hello'
    },
    c: {
        p: {
            q: {
                secret: 'hello again'
            }
        },
        y: 3
    }
}

let indent = 0;

// tslint:disable-next-line:no-any
function walker<T>(data: any, transform: (text: string) => T) {
    for (const field in data) {
        if (!data.hasOwnProperty(field)) {
            continue;
        }
        // console.log(`${' '.repeat(indent)}field: ${field}`);
        const secret = data[field]['secret'];
        if (secret !== undefined) {
            data[field] = transform(secret); //`DECRYPT(${secret})`;
        } else {
            indent += 2;
            walker(data[field], transform);
            indent -= 2;
        }
    }
}

function go() {
    console.log(yaml.safeDump(sample));

    console.log('----------');

    // walker(yaml);
    encrypt(sample, '123');

    console.log(yaml.safeDump(sample));
}

go();
