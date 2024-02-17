const gridData = (data, numColumns) => {


    var newData = [...data];
    // Membuat salinan baru dari data
    const numberOfFullRows = Math.floor(data.length / numColumns);
    var numberOfElementLastRows = data.length - (numberOfFullRows * numColumns);

    while (numberOfElementLastRows !== numColumns && numberOfElementLastRows !== 0) {
        newData.push({ key: `blank-${numberOfElementLastRows}`, empty: true });
        numberOfElementLastRows = numberOfElementLastRows + 1;
    }


    return newData;
};

export default gridData;
