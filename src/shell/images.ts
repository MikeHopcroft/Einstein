import { World } from '../cloud';

export async function imagesCommand(args: string[], world: World): Promise<number> {
    const images = await world.orchestrator.listImages();

    if (images.length > 0) {
        for (const image of images) {
            console.log(image);
        }
    } else {
        console.log('no images in registry');
    }

    return 0;
}
