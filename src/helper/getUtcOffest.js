import moment from "moment-timezone";

export  function getUtcOffest(){
    const offsetMinutes = moment.tz(moment.tz.guess()).utcOffset();
    const offsetHours = Math.floor(offsetMinutes / 60);
    const offsetMinutesRemainder = Math.abs(offsetMinutes % 60);

    const formattedOffset = `${offsetHours >= 0 ? '+' : '-'}${Math.abs(offsetHours)
  .toString()
  .padStart(2, '0')}:${offsetMinutesRemainder.toString().padStart(2, '0')}`;


  return formattedOffset
} 