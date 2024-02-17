import RNFS from 'react-native-fs';


export async function getBase64(assets) {
    const base64Array = [];
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const { type, uri } = asset;

        try {
            let fileData;

            if (type.startsWith('image')) {
                fileData = await RNFS.readFile(uri, 'base64');
            } else if (type.startsWith('video')) {
                const videoData = await RNFS.readFile(uri, 'base64');
                fileData = `data:video/mp4;base64,${videoData}`;
            }

            base64Array.push(fileData);
        } catch (error) {
            base64Array.push(null);
        }
    }

    return base64Array;
}