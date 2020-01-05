import { Shell } from './shell';

export async function imagesCommand(args: string[], shell: Shell): Promise<number> {
    const orchestrator = shell.getOrchestrator();
    const images = await orchestrator.listImages();

    if (images.length > 0) {
        for (const image of images) {
            console.log(image);
        }
    } else {
        console.log('no images in registry');
    }

    return 0;
}
