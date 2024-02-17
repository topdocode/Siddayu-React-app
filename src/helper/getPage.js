
export function getPage(url) {

    if (url != '' && url != null) {
        const indexOfQuestionMark = url.indexOf('?');

        // Memeriksa apakah ada parameter "page"
        if (indexOfQuestionMark !== -1) {
            // Mengambil bagian query string setelah tanda tanya
            const queryString = url.slice(indexOfQuestionMark + 1);

            // Membagi query string menjadi array parameter
            const queryParams = queryString.split('&');

            // Mencari parameter "page" dalam array parameter
            for (let i = 0; i < queryParams.length; i++) {
                const param = queryParams[i].split('=');
                if (param[0] === 'page') {
                    const pageValue = param[1];
                    return pageValue// Output: "2"
                    break; // Keluar dari loop setelah menemukan parameter "page"
                }
            }
        }
    } else {
        return 0
    }
}

