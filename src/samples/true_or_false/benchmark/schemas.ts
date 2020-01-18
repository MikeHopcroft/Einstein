import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';

import { YAMLValidationError } from '../../../laboratory';

import { TestSuite } from './interfaces';

// Schema generated with typescript-json-schema:
//   typescript-json-schema tsconfig.json TestSuite --required
const testSuiteSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "SymbolDefinition": {
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {
                    "type": "boolean"
                }
            },
            "required": [
                "name",
                "value"
            ],
            "type": "object"
        },
        "TestCase": {
            "properties": {
                "expected": {
                    "type": [
                        "string",
                        "boolean"
                    ]
                },
                "input": {
                    "type": "string"
                }
            },
            "required": [
                "expected",
                "input"
            ],
            "type": "object"
        }
    },
    "properties": {
        "domainData": {
            "items": {
                "$ref": "#/definitions/SymbolDefinition"
            },
            "type": "array"
        },
        "testCases": {
            "items": {
                "$ref": "#/definitions/TestCase"
            },
            "type": "array"
        }
    },
    "required": [
        "domainData",
        "testCases"
    ],
    "type": "object"
}

const ajv = new AJV();
const testSuiteValidator = ajv.compile(testSuiteSchema);

// tslint:disable-next-line:no-any
export function validateTestSuite(yamlRoot: object): TestSuite {
    if (!testSuiteValidator(yamlRoot)) {
        const message =
            'anyDescriptionValidator: yaml data does not conform to schema.';
        // debug(message);
        // debug(catalogValidator.errors);
        const output = betterAjvErrors(
            testSuiteSchema,
            yamlRoot,
            testSuiteValidator.errors,
            { format: 'cli', indent: 1 }
        );
        throw new YAMLValidationError(message, output || []);
    }

    return yamlRoot as TestSuite;
}
