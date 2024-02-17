import BackgroundJob from 'react-native-background-actions';
import { store } from '../../redux/store/store';
import TaskServices from '../../services/Task';
import UserService from '../../services/User';
import { removeRequest } from '../../redux/features/offline/offlineSlice';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const chooseObject = (stringObj) => {
    switch (stringObj) {
        case 'TaskServices':
            return TaskServices;
        case 'UserServices':
            return UserService;
        default:
            return null;
    }
}


function executeRequests(requestAll, authToken, thunkAPI) {
    const delayBetweenRequests = 5000; // 1000ms atau 1 detik

    function processNextRequest(index) {
        if (index >= requestAll.length) {
            return; // Semua permintaan telah diproses, keluar dari fungsi
        }

        const request = requestAll[index];
        try {
            const obj = chooseObject(request.obj);
            if (typeof obj === 'object' && typeof obj[request.method] === 'function') {
                obj[request.method](authToken, request.data.data, request.data.id)
                    .then(() => {
                        store.dispatch(removeRequest(request));
                    })
                    .catch((err) => {
                        store.dispatch(removeRequest(request));
                    })
                    .finally(() => {
                        // Setelah permintaan diproses, lanjutkan ke permintaan berikutnya setelah jeda waktu
                        setTimeout(() => {
                            processNextRequest(index + 1);
                        }, delayBetweenRequests);
                    });
            } else {
                throw new Error("Objek atau metode tidak ditemukan.");
            }
        } catch (error) {
            // Jika permintaan gagal, lanjutkan ke permintaan berikutnya setelah jeda waktu
            setTimeout(() => {
                processNextRequest(index + 1);
            }, delayBetweenRequests);
        }
    }

    processNextRequest(0);


}

const sendRequest = async () => {

    for (let i = 0; BackgroundJob.isRunning(); i++) {
        await BackgroundJob.updateNotification({ taskDesc: 'Runned -> ' + i });
        await sleep(1000);
    }
}


const options = {
    taskName: 'Example',
    taskTitle: 'ExampleTask title',
    taskDesc: 'ExampleTask description',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
        delay: 1000,
    },
};

const start = async () => {
    // await BackgroundAction.start(sendRequest, options)
    await BackgroundJob.start(sendRequest, options)
}

const stop = async () => {
    await BackgroundJob.stop()
}

const BackgroundService = {
    start,
    stop
}

export default BackgroundService;


