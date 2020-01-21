import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';

import { AnyDescription } from './interfaces';

// Schema generated with typescript-json-schema:
//   typescript-json-schema tsconfig.json AnyDescription --required
const anyDescriptionSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "anyOf": [
        {
            "$ref": "#/definitions/BenchmarkDescription"
        },
        {
            "$ref": "#/definitions/CandidateDescription"
        },
        {
            "$ref": "#/definitions/SuiteDescription"
        },
        {
            "$ref": "#/definitions/RunDescription"
        }
    ],
    "definitions": {
        "BenchmarkDescription": {
            "properties": {
                "apiVersion": {
                    "type": "string"
                },
                "created": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "image": {
                    "type": "string"
                },
                "kind": {
                    "enum": [
                        "Benchmark"
                    ],
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                }
            },
            "required": [
                "apiVersion",
                "created",
                "description",
                "image",
                "kind",
                "name",
                "owner"
            ],
            "type": "object"
        },
        "CandidateDescription": {
            "properties": {
                "apiVersion": {
                    "type": "string"
                },
                "benchmarkId": {
                    "type": "string"
                },
                "created": {
                    "type": "string"
                },
                "data": {
                    "additionalProperties": true,
                    "properties": {
                    },
                    "type": "object"
                },
                "description": {
                    "type": "string"
                },
                "image": {
                    "type": "string"
                },
                "kind": {
                    "enum": [
                        "Candidate"
                    ],
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "whitelist": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                }
            },
            "required": [
                "apiVersion",
                "benchmarkId",
                "created",
                "data",
                "description",
                "image",
                "kind",
                "name",
                "owner",
                "whitelist"
            ],
            "type": "object"
        },
        "RunDescription": {
            "properties": {
                "apiVersion": {
                    "type": "string"
                },
                "benchmarkId": {
                    "type": "string"
                },
                "candidateId": {
                    "type": "string"
                },
                "created": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "kind": {
                    "enum": [
                        "Run"
                    ],
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "results": {
                },
                "runId": {
                    "type": "string"
                },
                "suiteId": {
                    "type": "string"
                }
            },
            "required": [
                "apiVersion",
                "benchmarkId",
                "candidateId",
                "created",
                "description",
                "kind",
                "name",
                "owner",
                "results",
                "runId",
                "suiteId"
            ],
            "type": "object"
        },
        "SuiteDescription": {
            "properties": {
                "apiVersion": {
                    "type": "string"
                },
                "benchmarkId": {
                    "type": "string"
                },
                "created": {
                    "type": "string"
                },
                "data": {
                    "additionalProperties": true,
                    "properties": {
                    },
                    "type": "object"
                },
                "description": {
                    "type": "string"
                },
                "kind": {
                    "enum": [
                        "Suite"
                    ],
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                }
            },
            "required": [
                "apiVersion",
                "benchmarkId",
                "created",
                "data",
                "description",
                "kind",
                "name",
                "owner"
            ],
            "type": "object"
        }
    }
};

export class YAMLValidationError extends TypeError {
    constructor(message: string, ajvErrors: betterAjvErrors.IOutputError[]) {
        super(message);
        this.name = 'YAML Validation Error';
    }
}

const ajv = new AJV();
const anyDescriptionValidator = ajv.compile(anyDescriptionSchema);

// tslint:disable-next-line:no-any
export function validateAsAnyDescription(yamlRoot: any): AnyDescription {
    if (!anyDescriptionValidator(yamlRoot)) {
        const message =
            'anyDescriptionValidator: yaml data does not conform to schema.';
        // debug(message);
        // debug(catalogValidator.errors);
        const output = betterAjvErrors(
            anyDescriptionSchema,
            yamlRoot,
            anyDescriptionValidator.errors,
            { format: 'cli', indent: 1 }
        );
        throw new YAMLValidationError(message, output || []);
    }

    return yamlRoot as AnyDescription;
}
