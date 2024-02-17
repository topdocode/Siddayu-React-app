import moment from 'moment'
import React, { useState } from 'react'
import DatePicker from 'react-native-date-picker'

const DateTime = ({ openCalendar, setOpenCalendar, date, setDate, handleDate, mode = 'date' }) => {

    return (
        <>
            <DatePicker
                modal
                mode={mode}
                open={openCalendar}
                date={date}
                onConfirm={(date) => {
                    setOpenCalendar(false)
                    // setDate(moment(date).subtract(1, 'day').toDate())
                    handleDate(date)

                }}
                onCancel={() => {
                    setOpenCalendar(false)
                }}
                timeZoneOffsetInMinutes={-new Date().getTimezoneOffset()}
            />
        </>
    )
}

export default DateTime;