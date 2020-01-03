import * as crypto from 'crypto';
import * as yaml from 'js-yaml';

/******************************************************************************
 * This file contains functions to encrypt and decrypt secrets in configuration
 * files.
 * 
 * Suppose we need to secure the two passwords in the following YAML:
 * 
 *     version: 1.2.0
 *     services:
 *       - name: service1
 *         password: password1
 *       - name: service2
 *         password: password2
 *
 * We can manually edit the YAML to replace each secret value with an object of
 * the form {secret: value} as follows:
 * 
 *     version: 1.2.0
 *     services:
 *       - name: service1
 *         password:
 *           secret: password1
 *       - name: service2
 *         password:
 *           secret: password2
 * 
 * We can then use the encryptSecrets() function with a public key to generate
 * a new YAML files where each secret value is encrypted:
 * 
 *     version: 1.2.0
 *     services:
 *       - name: service1
 *         password:
 *           secret: >-
 *             Wvwf7yxc1/WwHpf2cNPf/t96WIMrjuV2xEBA8MDKoOOe3dTXM8O5W2iY3fn2NyS+ZL3p6lBTXsVxfQ5Cptkn4JHtgbLYPw8eYAQO5Mhk2NzAL7qe9hJuWLhOdnHqXV8tbWlB7yNyXChzJXecYLHV0l90SZTHe7Ku1eLQb0IX+ogkn7M40+LuWwxTKtbcuPqze5/JhyFQsTkEzkr2FwKYIT+h2O5Ydn8FL+qVQYJghWxHEijPHveZdmeneCR5jymDsvP2v+FnejP04uZpdHyPeVR6zdtuwdTwHWg+gGBUkHvgi0xL0NRLrkMRdJPMR/DcDPmN9L4pbQNcaD20qYfGUfJOp4UYmDx9jG2/pkU1rGDNTECLXFZ6ewsxQSFIemQG5qbjac4dHUT9fHRhFqhYrqEqmoX0AF9w5U3/VTvvtSGCYKBrrY2uGdELYM/Zn1M3omKJldVCA/C7ssUxJI/t4kTocCARoaQKBZpzwVjCnGpdxAiWXR5SNBlqHuvkjVL7m4kXgadSDlYDBjfTli9UYlStWjjoPxJ/A2t/GBEGSA4tb0rbe2qaskGrNgCBjzRFjji0IRPprioSPJ5qmAfmb+0EeH5h8Y6u4kfGHKgEtmtUEccnSwIuHkxOgTB0vAkxElY0TH4A+nx3zalnxDKFfdRJ6bAxrDeSlTVT54fLPqY=:MKVnENuFLqD4HOxSdTOuQw==:6Jo6AWYnhJKLdysgmLRPeg==
 *       - name: service2
 *         password:
 *           secret: >-
 *             Qe7ZGEPItjZw4prCgFtDiDFr5ZrtbYbgxMGEhEzDLBYyZVw9wiuj4q8ms+DfhEj6GSXTnoSc7XZ6+VkM6xd7YimT/8iV9qLF3cBqef+XgsgNIfyYuFIjUMC9PjzuIU9S29L00ACkfyGgMnZuBB6CGHaY8X2AI1ASa6zVk30M2KjdTC2ktlzEFzUzNbTXb8rtV8P0ER+61C5fWBLzx7fbcWpjvVMWs6YC8UEi9+a+PN9siVT1n5YHq4fvNsQsW/AnjCI84cvNjPePMSKXx1CcQc0a6qmgWeoSfAxjiIWF4dD98C/Py/54zNELgM8Mf30ZInHrWSfF2XXE8T/1EzxNbEEOb2evlc2/3lYS4+zNvc8bscZT93SufYMe/zP1ZijeqljIIsDIgifV/AEH5p31jjWWifqpnFWCqC9qptmlrIraoQJz7MTY+596aYKXKg/kg01Ed/25AkEuS8kK4y+1qXiGbXkozhnQsRPbfHCzg7Ue2JN4R7yurDtQgq8iry1/cqo5KPFlleUcCnSEjCdA9mPb6Si6E8x53Q+Z7z0XHC1bepPzfXN5bOW922ajhJr+w/UVUnaxRya8Nh9erSlbuZrhvC68uG3Ag8DY2cXEtrjEYiIzL4L7bG8UJo9QSnopaws0Ii1EsSE0qMzQcTuGU2gbw+4JHcTKjgeNCNAFdnM=:F6vi8zngc6lJNtzpFCD7aw==:he1+yxYCJ1nll7g9m8U4Gw==
 *
 * We can use the decryptSecrets() function with a private key to recover the
 * original YAML:
 * 
 *     version: 1.2.0
 *     services:
 *       - name: service1
 *         password: password1
 *       - name: service2
 *         password: password2
 *
 * Use the generateKeys() function to generate a public/private key pair.
 * 
 * Background reading:
 *     https://stackoverflow.com/questions/8750780/encrypting-data-with-public-key-in-node-js
 *     https://security.stackexchange.com/questions/33434/rsa-maximum-bytes-to-encrypt-comparison-to-aes-in-terms-of-security
 *     https://stackoverflow.com/questions/32066464/how-do-i-actually-encrypt-something-with-the-diffie-hellman-apis-in-nodejs
 *     https://www.w3schools.com/nodejs/ref_crypto.asp
 */

export interface KeyPair {
    privateKey: string;
    publicKey: string;
}

export function generateKeys(): KeyPair {
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

    return { privateKey, publicKey };
}

// tslint:disable-next-line:no-any
export function encryptSecrets(data: any, publicKey: string) {
    walker(data, (text: string) => ({ secret: e3(text, publicKey) }));
}

// tslint:disable-next-line:no-any
export function decryptSecrets(data: any, privateKey: string) {
    walker(data, (text: string) => d3(text, privateKey));
}

// Note on implementation of isObject().
// https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
// tslint:disable-next-line:no-any
function isObject(value: any) {
    if (value === null) {
        return false;
    }
    return ( (typeof value === 'function') || (typeof value === 'object') );
}

// Walks over data, replacing and field called 'secret' with the result of
// applying transform to the field's value.
// tslint:disable-next-line:no-any
function walker<T>(data: any, transform: (text: string) => T) {
    if (isObject(data)) {
        for (const field of Object.keys(data)) {
            const secret = data[field]['secret'];
            if (secret !== undefined) {
                data[field] = transform(secret);
            } else {
                walker(data[field], transform);
            }
        }
    }
}

// Encrypts text. The result is a string of the form
//   encryptedKey:iv:encryptedData
// where
//   encryptedKey is a Base64 RSA-encrypted AES key.
//   iv is a Base64 plain text AES initialization vector.
//   encryptedData is a Base64 block of AES encrypted text.
//
// DESIGN NOTES:
//   Using ':' as a field seperator because this character never appears in the
//   Base64 encoding.
//
//   See the following discussion for the rational behind the use of RSA in
//   conjunction with AES:
//     https://security.stackexchange.com/questions/33434/rsa-maximum-bytes-to-encrypt-comparison-to-aes-in-terms-of-security
function e3(text: string, publicKey: string): string {
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

// Decrypts text in the form encryptedKey:iv:encryptedData that was generated
// by an earlier call to e3().
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

const sample = {
    version: '1.2.0',
    services: [
        {
            name: 'service1',
            password: {secret: 'password1'}
        },
        {
            name: 'service2',
            password: {secret: 'password2'}
        }
    ]
};

function go() {
    const keys = generateKeys();

    console.log(yaml.safeDump(sample));

    console.log('----------');

    encryptSecrets(sample, keys.publicKey);

    console.log('----------');
    console.log(yaml.safeDump(sample));

    decryptSecrets(sample, keys.privateKey);

    console.log('----------');
    console.log(yaml.safeDump(sample));
}

go();
