export function getNameAndExtByUrl(url) {
    const extVideo = ['mp4', 'mkv', 'webv', '3gpp'];
    const extImg = ['jpg', 'png', 'jpeg', 'webp'];

    const extFile = ['pdf', 'docx', 'txt'];
    if (url != '' && url != null) {
        let status = null;
        const fileName = url.substring(url.lastIndexOf('/') + 1);

        // Mengambil format file
        const fileFormat = fileName.substring(fileName.lastIndexOf('.') + 1);


        if (extVideo.includes(fileFormat)) {
            status = 'video';
        }

        if (extImg.includes(fileFormat)) {
            status = 'image';
        }

        if (extFile.includes(fileFormat)) {
            status = 'file';
        }

        return { fileName, fileFormat, status, url: url }
    }

    return null
}


export function getNameAndExtMedia(fileData) {

    try {

        const extVideo = ['mp4', 'mkv', 'webv', '3gpp'];
        const extImg = ['jpg', 'png', 'jpeg', 'webp'];
        const extFile = ['pdf', 'docx', 'txt'];

        // Mengambil nama file dari data
        const fileName = fileData.name;

        // Mendapatkan ekstensi file dari nama file
        const fileFormat = fileName.split('.').pop().toLowerCase();

        let status = null;

        if (extVideo.includes(fileFormat)) {
            status = 'video';
        } else if (extImg.includes(fileFormat)) {
            status = 'image';
        } else if (extFile.includes(fileFormat)) {
            status = 'file';
        }

        return { fileName, fileFormat, status, url: fileData.uri };
    } catch (error) {
    }
}
