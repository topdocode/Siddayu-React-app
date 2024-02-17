import TaskServices from "../services/Task";
import { default as moment, default as momentTimeZone } from 'moment-timezone';
export const handleStop = async (authToken, idActive, navigation) => {
    try {
        const res = await TaskServices.stopTime(authToken, { time_out: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ") }, idActive, navigation);

        return {
            status: true,
            message: "time is has been stop",
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}