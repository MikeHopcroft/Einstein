import * as crypto from 'crypto';
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


function e(text: string, publicKey: string) {
    const buffer = Buffer.from(text, 'utf8')
    const encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString('base64')
}

function d(text: string, privateKey: string) {
    const buffer = Buffer.from(text, 'base64')
    // const decrypted = crypto.privateDecrypt(
    //     {
    //         key: privateKey,
    //         passphrase: '',
    //     },
    //     buffer,
    // );
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
}

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function e2(text: string) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('base64'), encryptedData: encrypted.toString('base64') };
}

function d2(x: {iv: string, encryptedData: string}) {
    const iv = Buffer.from(x.iv, 'base64');
    const encryptedText = Buffer.from(x.encryptedData, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function e3(text: string, publicKey: string) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const encryptedKey64 =
        crypto.publicEncrypt(publicKey, key).toString('base64');

    const iv64 = iv.toString('base64');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const eUpdate = cipher.update(text);
    const eFinal = cipher.final();
    const encryptedData64 =
        Buffer.concat([eUpdate, eFinal]).toString('base64');

    return `${encryptedKey64}:${iv64}:${encryptedData64}`;
}

function d3(text: string, privateKey: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) {
        const message = 'Invalid format for decryption.';
        throw TypeError(message);
    }
    const encryptedKey = Buffer.from(parts[0], 'base64');
    const iv = Buffer.from(parts[1], 'base64');
    const encryptedText = Buffer.from(parts[2], 'base64');

    const key = crypto.privateDecrypt(privateKey, encryptedKey);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    const dUpdate = decipher.update(encryptedText);
    const dFinal = decipher.final();
    const decrypted = Buffer.concat([dUpdate, dFinal]).toString('utf8');
    return decrypted;
}

function go2() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync(
        'rsa',
        {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: '',
            },
        }
    );

    console.log(privateKey);
    console.log();
    console.log(publicKey);

    const text = 'hello';
    // const cypherText = e(text, publicKey);
    // console.log();
    // console.log('cyphertext:');
    // console.log(cypherText);

    // const decryptedText = d(cypherText, privateKey);
    // console.log();
    // console.log('decrypted text:');
    // console.log(decryptedText);

    // const cypherText = e2(text);
    // console.log();
    // console.log('cyphertext:');
    // console.log(cypherText);

    // const decryptedText = d2(cypherText);
    // console.log();
    // console.log('decrypted text:');
    // console.log(decryptedText);

    const cypherText = e3(text, publicKey);
    console.log();
    console.log('cyphertext:');
    console.log(cypherText);

    const decryptedText = d3(cypherText, privateKey);
    console.log();
    console.log('decrypted text:');
    console.log(decryptedText);
}

go2();
