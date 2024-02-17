import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const prefix = 'cacheGetTodos';
const expiryInMinutes = 5;

const store = async (value) => {
    const item = {
        value,
        timeStamp: Date.now(),
    };
    try {
        await AsyncStorage.setItem(prefix, JSON.stringify(item));
    } catch (err) {
    }
};

const isExpired = item => {
    const now = moment(Date.now());
    const storedTime = moment(item.timeStamp);
    return now.diff(storedTime, 'minutes') > expiryInMinutes;
};

const get = async () => {
    try {
        const value = await AsyncStorage.getItem(prefix);
        const item = JSON.parse(value);

        if (!item) return null;

        // if (isExpired(item)) {
        //     await AsyncStorage.removeItem(prefix + key);
        //     return null;
        // }

        return item.value;
    } catch (err) {
    }
};

const cacheGetTodos = {
    store, get
}

export default cacheGetTodos;
// export default { store, get };
