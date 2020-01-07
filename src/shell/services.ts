import { formatTable } from '../utilities';

import { Shell } from './shell';

export async function servicesCommand(args: string[], shell: Shell): Promise<number> {
    const orchestrator = shell.getOrchestrator();
    const services = await orchestrator.listServices();

    const alignments = ['left', 'left', 'left'];
    const headers = ['image', 'host', 'port'];
    const rows = [headers];
    if (services.length > 0) {
        for (const service of services) {
            rows.push([service.tag, service.hostname, service.port.toString()]);
        }
        for (const line of formatTable(alignments, rows)) {
            console.log(line);
        }
    } else {
        console.log('no services running');
    }

    return 0;
}
