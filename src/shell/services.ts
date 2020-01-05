import { Shell } from './shell';

export async function servicesCommand(args: string[], shell: Shell): Promise<number> {
    const orchestrator = shell.getOrchestrator();
    const services = await orchestrator.listServices();

    if (services.length > 0) {
        for (const service of services) {
            console.log(service);
        }
    } else {
        console.log('no services running');
    }

    return 0;
}
