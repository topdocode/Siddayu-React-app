import { Button, Text } from '@rneui/themed';
import { default as moment, default as momentTimeZone } from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Row as RowTable, Rows, Table } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import Column from '../../../component/CustomText/CustomText';
import DateTime from '../../../component/Date';
import DropdownPro from '../../../component/Dropdown/DropdownPro';
import Gap from '../../../component/Gap/Gap';
import Row from '../../../component/Row/Row';
import { getUtcOffest } from '../../../helper/getUtcOffest';
import { startTime } from '../../../helper/startTime';
import { handleStop } from '../../../helper/stopTime';
import { saveStartStop } from '../../../redux/features/offline/startStop';
import { resetTask, setIdActive as setIdActiveRedux } from '../../../redux/features/taskFeature/taskFeature';
import { endCountTime, startCountTime } from '../../../redux/features/timestamp/timestamp';
import TaskServices from '../../../services/Task';
import { generateUniqueId } from '../../../utils/uuid/uuid';
import { global_styles } from '../../global_styles';
import { styles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../utils/color';
import { TimeIcon } from '../../../assets/icons';


const SettingTask = (props) => {
    const { authToken, user } = useSelector((state) => state.auth);
    const { task, setRefreshing } = props
    const tableHead = ['Username', 'From', 'To', 'Total Hours'];
    const [tableData, setTableData] = useState([])
    const widthArr = [90, 90, 90, 90]
    const { taskId: taskIdActive } = useSelector((state) => state.timestamp)
    const dispatch = useDispatch()
    const [idActive, setIdActive] = useState(null)
    const [date, setDate] = useState(new Date())
    const [selectPeriod, setSelectperiod] = useState({ label: 'Time', value: 'time' });
    const [selectMonth, setSelectMonth] = useState({ label: 0, value: 0 })
    const [selectDay, setSelectDay] = useState({ label: 0, value: 0 })
    const [loading, setLoading] = useState(false)
    const { online } = useSelector((state) => state.offlineRedux);
    const [openCalendar, setOpenCalendar] = useState(false)
    const { idActive: idActiveRedux } = useSelector((state) => state.taskRedux);
    const dataPeriod = [
        { label: 'Time', value: 'time' },
        { label: 'Day', value: 'day' },
        { label: 'Month', value: 'month' },
    ]

    const dataDay = Array.from({ length: 30 }, (_, index) => ({ label: index + 1, value: index + 1 }));
    const dataMonth = Array.from({ length: 12 }, (_, index) => ({ label: index + 1, value: index + 1 }));
    const navigation = useNavigation();

    useEffect(() => {
        setLoading(true)
        if (task && task?.assignee_logs?.length > 0) {
            const newArrayForEach = [];
            task.assignee_logs.forEach(obj => {
                newArrayForEach.push([
                    <Text style={styles.tableStyleItem}>{obj.assignee?.name}</Text>,
                    <Text style={styles.tableStyleItem}>{moment(obj.time_in).format('DD/MM/YYYY hh:mm')}</Text>,
                    <View>
                        <Text style={styles.tableStyleItem}>{`${moment(obj.time_out).format('DD/MM/YYYY hh:mm')}`}</Text>
                        <Text style={styles.tableStyleItem}>{obj?.timezone?.utc_offset}</Text>
                    </View>,
                    <Text style={styles.tableStyleItem} >{obj?.total_time?.split(".")[0]}</Text>,
                ])
            });
            setTableData(newArrayForEach)
        }
        convertDateTime(task?.estimation?.total?.estimation)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (taskIdActive !== null) {
            Promise.all([TaskServices.getActiveTask(authToken, navigation)]).then((res) => {
                setIdActive(res[0].active_topic?.assignee_log?.id)
            }).catch((err) => {
            })

        }
    }, [taskIdActive])


    const handleStartTime = async () => {
        setLoading(true)
        if (online) {
            const result = await startTime(task.id, authToken, navigation);

            if (result.status) {
                dispatch(startCountTime({ taskId: result.taskId }))
                setRefreshing(true)
            }
        } else {
            let dataTask = {
                topic: task.id,
                time_in: moment().toISOString(),
                timezone: {
                    name: momentTimeZone.tz.guess(),
                    utc_offset: getUtcOffest()
                }
            }
            const idOff = generateUniqueId();
            dataTask = { ...dataTask, idOff: idOff }
            dispatch(saveStartStop(dataTask))
            dispatch(startCountTime({ taskId: task.id }))
            const getActiveTask = {
                active_topic: {
                    id: dataTask.id,
                    assignee_log: {
                        time_in: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                    }
                }
            }
            dispatch(setIdActiveRedux({ idActive: idOff, getActiveTask: getActiveTask }))
            setRefreshing(true)
            setLoading(false)
        }
    }

    const handleStopTime = async () => {
        setLoading(true)

        if (online) {
            const result = await handleStop(authToken, idActive, navigation);

            if (result.status) {
                dispatch(endCountTime())
                setRefreshing(true)
                dispatch(resetTask());
            }
        } else {
            dispatch(saveStartStop({ "time_out": moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"), "idOff": idActiveRedux }))
            dispatch(endCountTime());
            dispatch(resetTask());
            setRefreshing(true)
            setLoading(false)
        }
    }

    const handleSelectPeriod = (data, label) => {
        setSelectperiod({ label: label, value: data })
    }

    const handleSelectMonth = (data) => {
        // setSelectMonth({ label: data, value: data })
        setSelectMonth({ 'label': data, 'value': data })
    }

    const handleSelectDay = (data) => {
        setSelectDay({ 'label': data, 'value': data })
    }

    const handleDate = (time) => {

        setDate(time);
    }

    const handleEstimatedTime = () => {
        setLoading(true)
        const formattedTime = moment(date, 'h:mm a').format('HH:mm:ss');

        let estimation = formattedTime;

        if (selectMonth.value > 0) {
            const sumDay = selectDay.value + (selectMonth.value * 30);
            estimation = `${sumDay} ${formattedTime}`;

        } else if (selectDay.value > 0) {
            estimation = `${selectDay.value} ${formattedTime}`;
        }

        TaskServices.updateTask(authToken, { 'estimation': estimation }, task.id, navigation).then((res) => {
            setRefreshing(true)
        }).catch((e) => { }).finally(() => setLoading(false))


    }

    const convertDateTime = (formattedDateTime) => {
        if (formattedDateTime != null) {
            formattedDateTime = formattedDateTime.split(" ");
            const days = formattedDateTime[0];
            const time = formattedDateTime[1];

            // set day
            parseInt(days)
            const month = Math.floor(days / 30);
            const day = days % 30;

            // set periode
            if (month > 0) {

                setSelectperiod({ label: 'Month', value: 'month' })
            } else if (day > 0) {
                setSelectperiod({ label: 'Day', value: 'day' })
            } else {
                setSelectperiod({ label: 'Time', value: 'time' })
            }

            setSelectDay({ label: day, value: day })
            setSelectMonth({ label: month, value: month })

            // set time
            var dateNow = new Date();
            if (time) {
                dateNow.setHours(parseInt(time?.split(":")[0]));
                dateNow.setMinutes(parseInt(time?.split(":")[1]));
                dateNow.setSeconds(parseInt(time?.split(":")[2]));
                setDate(dateNow)
            } else {
                dateNow.setHours(0, 0, 0)
                setDate(dateNow)
            }
            // Menggunakan tanggal saat ini
        }

    }

    if (loading == false) {
        return (
            // <SelectProvider >
            <ScrollView>
                <View style={{ flex: 1 }} >
                    {/* DUE DATE AND BUTTON START STOP */}
                    <View>
                        <Gap height={20} />

                        <Row styles={{ justifyContent: 'space-between', alignItems: 'center' }} >
                            <Row >
                                <Text style={styles.textItemDialog}>Due Date</Text>
                                <Gap width={80} />
                                <Text style={styles.textItemDialog}  >{task.due_at ? moment(task.due_at).format('MMM DD, YYYY') : '-'}</Text>
                            </Row>
                            <Row styles={{ columnGap: 10 }} >
                                <Button
                                    size='sm'
                                    titleStyle={{ fontSize: 12 }}
                                    containerStyle={[global_styles.shadow, { borderRadius: 3 }]}
                                    onPress={() => handleStartTime(task.id)}
                                    disabled={(taskIdActive && taskIdActive != null)}
                                    buttonStyle={{ backgroundColor: colors.buttonColorSecond }}
                                >START</Button>
                                <Button
                                    size='sm'
                                    titleStyle={{ fontSize: 12 }}
                                    buttonStyle={{ backgroundColor: colors.buttonColorSecond }}
                                    containerStyle={[global_styles.shadow, { borderRadius: 3 }]}
                                    disabled={!(taskIdActive && taskIdActive != null && taskIdActive == task.id)}
                                    onPress={() => handleStopTime()}
                                >STOP </Button>
                            </Row>
                        </Row>
                    </View>

                    <View>
                        <Gap height={10} />
                        <Row styles={{ alignItems: 'center' }} >
                            <Text  >{`Estimated Time\n${task.estimation?.self?.estimation ? task.estimation?.self?.estimation : '00:00:00'}`} </Text>
                            <Gap width={40} />
                            <Column styles={{ rowGap: 10, flex: 1 }}>
                                <Row styles={{ alignItems: 'center' }} >
                                    <Text style={[styles.textItemDialog, { width: 'auto' }]} >Period : </Text>
                                    <DropdownPro page='setting' width={130} data={dataPeriod} placeholderText='Period' handleDropdown={handleSelectPeriod} selected={selectPeriod} />
                                </Row>
                                <Row styles={{ flexWrap: 'wrap', rowGap: 5, }}>
                                    {selectPeriod.value == 'month' && (
                                        <Row styles={{ alignItems: 'center' }} >
                                            <Text style={[styles.textItemDialog, { width: 40 }]} >Month : </Text>
                                            <DropdownPro page='setting' width={130} data={dataMonth} placeholderText='Month' handleDropdown={handleSelectMonth} selected={selectMonth} />
                                        </Row>
                                    )}
                                    {(selectPeriod.value == 'day' || selectPeriod.value == 'month') && (
                                        <Row styles={{ alignItems: 'center' }} >
                                            <Text style={[styles.textItemDialog, { width: 40 }]} >Day : </Text>
                                            <DropdownPro page='setting' width={130} data={dataDay} placeholderText='Day' handleDropdown={handleSelectDay} selected={selectDay} />
                                        </Row>
                                    )}
                                </Row>
                                <Row styles={{ alignItems: 'center' }} >
                                    <Text style={[styles.textItemDialog, { width: 40 }]} >Time : </Text>
                                    <Button onPress={() => setOpenCalendar(true)} size='sm' type='outline' titleStyle={{ fontSize: 10, color: 'black' }} containerStyle={{ width: 130, padding: 0, alignItems: 'flex-start' }} buttonStyle={{ borderColor: '#999', borderWidth: 1 }} >
                                        {moment(date).format('hh:mm a')}
                                        <Gap width={5} />
                                        <Icon name='clockcircle' color='black' />
                                        {/* <TimeIcon width={14} height={14} /> */}
                                    </Button>
                                </Row>
                                <DateTime handleDate={handleDate} mode='time' date={date} openCalendar={openCalendar} setOpenCalendar={setOpenCalendar} setDate={setDate} />
                                {online &&
                                    <Button loading={loading} size='sm' buttonStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ fontSize: 12 }} containerStyle={[global_styles.shadow, { borderRadius: 3, width: 200 }]} onPress={handleEstimatedTime}>UPDATE ESTIMATED TIME</Button>
                                }
                            </Column>
                        </Row>
                    </View>

                    {/* estmasti */}
                    <View>
                        <Gap height={20} />

                        <Row styles={{ alignItems: 'center', width: '75%', justifyContent: 'space-between' }} >
                            <Text style={styles.textItemDialog}>Estimated Time</Text>
                            <Text style={[styles.textItemDialog]}  >{task.estimation?.self?.estimation ? `${task.estimation.self.estimation.split(" ")[0] == "00:00:00" ? '0 day' : (task.estimation.self.estimation.length > 9 ? task.estimation.self.estimation.split(" ")[0] + ' days' : '0 day')} ` : '0 day'} </Text>
                        </Row>
                        <Gap height={20} />

                        <Row styles={{ alignItems: 'center', width: '75%', justifyContent: 'space-between' }} >
                            <Text style={styles.textItemDialog}>Estimated Time Subtask</Text>
                            {/* <Gap width={35} /> */}
                            <Text style={styles.textItemDialog} >0 day  </Text>
                        </Row>
                        <Gap height={20} />


                        <Row styles={{ alignItems: 'center', width: '75%', justifyContent: 'space-between' }} >
                            <Text style={styles.textItemDialog}>Total Estimated Time</Text>
                            {/* <Gap width={50} /> */}
                            <Text style={styles.textItemDialog}  >{task.estimation?.total?.estimation ? `${task.estimation.total.estimation.split(" ")[0] == "00:00:00" ? '0 day' : (task.estimation.total.estimation > 9 ? task.estimation.total.estimation.split(" ")[0] + ' days' : '0 day')} ` : '0 day'} </Text>
                        </Row>
                    </View>

                    <>
                        <Gap height={20} />
                        {tableData && (
                            <ScrollView>

                                <View >
                                    <ScrollView horizontal={true}>
                                        <View>
                                            <Table borderStyle={styles.borderStyleTabel}>
                                                <RowTable data={tableHead} style={styles.head} widthArr={widthArr} flexArr={[1, 1, 1, 1]} />
                                            </Table>
                                            <Table borderStyle={styles.borderStyleTabel}>
                                                <Rows data={tableData} widthArr={widthArr} flexArr={[1, 1, 1, 1]} />
                                            </Table>
                                        </View>
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        )}
                    </>
                </View>
            </ScrollView>
            // </SelectProvider>
        )
    }
}

export default SettingTask;