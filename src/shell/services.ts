import { World } from '../cloud';
import { formatTable } from '../utilities';


export async function servicesCommand(args: string[], world: World): Promise<number> {
    const services = await world.orchestrator.listServices();

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
