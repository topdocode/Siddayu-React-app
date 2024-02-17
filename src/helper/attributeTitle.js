export default function attributeTitlte(myString = '') {
    if (myString !== null && myString !== "" && typeof myString === "string") {
        const words = myString.split('_'); // Memisahkan kata dengan tanda underscore

        const capitalizedWords = words.map(word => {
            // Mengubah huruf pertama setiap kata menjadi huruf besar
            return word.charAt(0).toUpperCase() + word.slice(1);
        });

        const resultString = capitalizedWords.join(' '); // Menggabungkan kata-kata menjadi satu string dengan spasi

        return resultString
    }

    return myString;
}
