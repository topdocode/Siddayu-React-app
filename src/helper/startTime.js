import { default as moment, default as momentTimeZone } from 'moment-timezone';
import TaskServices from '../services/Task';
import { getUtcOffest } from './getUtcOffest';
export const startTime = async (id, token, navigation) => {

    let dataTask = {
        topic: id,
        time_in: moment().toISOString(),
        timezone: {
            name: momentTimeZone.tz.guess(),
            utc_offset: getUtcOffest()
        }
    };

    try {
        const res = await TaskServices.assignee(token, dataTask, navigation);
        return { "taskId": id, "message": "success", "status": true };
    } catch (e) {
        return { "status": false, "message": e.message };
    }
};
