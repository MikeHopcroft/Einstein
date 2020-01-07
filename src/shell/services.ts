import { leftJustify } from '../utilities';

import { Shell } from './shell';

export async function servicesCommand(args: string[], shell: Shell): Promise<number> {
    const orchestrator = shell.getOrchestrator();
    const services = await orchestrator.listServices();

    const hostHeader = 'host';
    const tagHeader = 'image';
    if (services.length > 0) {
        let hostWidth = hostHeader.length;
        let tagWidth = tagHeader.length;
        for (const service of services) {
            hostWidth = Math.max(hostWidth, service.hostname.length);
            tagWidth = Math.max(tagWidth, service.tag.length);
        }

        const hostname = leftJustify(hostHeader, hostWidth);
        const tag = leftJustify(tagHeader, tagWidth);
        const port = 'port';
        console.log(`${tag}    ${hostname}    ${port}`);

        for (const service of services) {
            const hostname = leftJustify(service.hostname, hostWidth);
            const tag = leftJustify(service.tag, tagWidth);
            console.log(`${tag}    ${hostname}    ${service.port}`);
        }
    } else {
        console.log('no services running');
    }

    return 0;
}
