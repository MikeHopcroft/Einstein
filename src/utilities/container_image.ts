// Really naive Docker image name parsing
//   [[host:port/]registry/]component[:tag][@digest]
//
// See https://stackoverflow.com/questions/37861791/how-are-docker-image-names-parsed

export class ContainerImage {
    host = '';
    registry = '';
    component = '';
    tag = '';
    digest = '';

    constructor(image: string) {
        const parts = image.split('/');
        if (parts.length === 1) {
            this.host = '';
            this.registry = '';
            this.parseComponentTagDigest(parts[0]);
        } else if (parts.length === 2) {
            this.host = '';
            this.registry = parts[0];
            this.parseComponentTagDigest(parts[1]);
        } else if (parts.length === 3) {
            this.host = parts[0];
            this.registry = parts[1];
            this.parseComponentTagDigest(parts[2]);
        } else {
            const message = "Invalid image";
            throw TypeError(message);
        }
    }

    parseComponentTagDigest(input: string) {
        const parts = input.split(':');
        if (parts.length === 1) {
            this.component = parts[0];
        } else if (parts.length === 2) {
            this.component = parts[0];
            this.parseTagDigest(parts[1]);
        } else {
            const message = "Invalid image";
            throw TypeError(message);
        }
    }

    parseTagDigest(input: string) {
        const parts = input.split('@');
        if (parts.length === 1) {
            this.tag = parts[0];
        } else if (parts.length === 2) {
            this.tag = parts[0];
            this.digest = parts[1];
        } else {
            const message = "Invalid image";
            throw TypeError(message);
        }
    }
}
