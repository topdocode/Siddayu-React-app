import { useNavigation } from '@react-navigation/native'
import { Button, CheckBox } from '@rneui/themed'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { Cell, Row as RowTable, Table, TableWrapper } from 'react-native-table-component'
import { useSelector } from 'react-redux'
import Row from '../../../component/Row/Row'
import Layout from '../../../component/layout/Layout'
import ProjectCrmService from '../../../services/CRM/Project'
import { colors } from '../../../utils/color'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'
const Card = ({ name, count, color = '' }) => {
    return (
        <View style={{ height: 70, width: 100, backgroundColor: color, borderRadius: 5, justifyContent: 'space-between', padding: 5, marginHorizontal: 5 }} >
            <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={2} >{name ?? ''}</Text>
            <Text style={{ color: 'white', fontWeight: "700", textAlign: 'center', fontSize: 20 }}>{count ?? ''}</Text>
        </View>
    )
}

const PersonTable = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [contats, setContacts] = useState([])
    useEffect(() => {
        Promise.all([ProjectCrmService.contactCrm(authToken, user?.client?.id, navigation, false)])
            .then(([contats]) => {
                const rowData = []
                contats?.results.forEach(contact => {
                    rowData.push([contact?.name, contact?.member?.name, contact?.position, contact?.phone, contact?.email, contact?.contact_title?.name])
                });
                setContacts(rowData)
            }).catch(err => console.log(err)).finally(() => setLoading(false))
    }, [])

    const { width, height } = Dimensions.get('window');
    const tableHead = ['Name', 'Company', 'Position', 'Phone', 'Email']
    const widthArr = [80, 80, 80, 80, 80]


    if (loading == false) {

        return (
            <View style={{ width, height, maxWidth: width }}>

                <View style={styles.container}>
                    <ScrollView horizontal={true}>
                        <View style={{ height: 500 }} >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                                <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                            </Table>
                            <ScrollView style={styles.dataWrapper}>
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                    {
                                        contats.map((rowData, index) => (
                                            <RowTable
                                                key={index}
                                                data={rowData}
                                                widthArr={widthArr}
                                                style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                                                textStyle={styles.text}
                                            />
                                        ))
                                    }
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const IdTable = ({ checked, toggleCheckbox, id }) => {
    const [check, setCheck] = useState(false);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <CheckBox
                containerStyle={{ backgroundColor: 'transparent', padding: 0, width: 25 }}
                checked={check}
                onPress={() => {
                    setCheck(!check)
                    toggleCheckbox(id)
                }}
                // Use ThemeProvider to make change for all checkbox
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor="red"
            />
            <Text>{id}</Text>
        </View>
    )
}

const CompaniesTable = ({ checked, toggleCheckbox, setChecked }) => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [members, setMembers] = useState([])


    useEffect(() => {
        Promise.all([ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation, true)])
            .then(([memberData]) => {
                const rowData = []
                memberData?.results.forEach(member => {
                    rowData.push([member?.member_id, member?.name, member?.phone, member?.member_attributes?.PIC, member?.email, member.id])
                });
                setMembers(rowData)
            }).catch(err => console.log(err)).finally(() => setLoading(false))
    }, [])

    const { width, height } = Dimensions.get('window');
    const tableHead = ['Id', 'Name', 'Phone', 'PIC', 'Email', 'Action']
    const widthArr = [80, 60, 80, 100, 120, 80]

    const ActionButton = ({ id }) => {
        return (
            <TouchableOpacity style={{ paddingHorizontal: 10, justifyContent: 'center', flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('customerDetailCrm', { customerId: id })} >
                <Icon name='pencil' size={20} />
            </TouchableOpacity>
        )

    }

    if (loading == false) {

        return (
            <View style={{ width, height, maxWidth: width }}>

                <View style={styles.container}>
                    <ScrollView horizontal={true}>
                        <View style={{ height: 500 }} >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                                <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                            </Table>
                            <ScrollView style={styles.dataWrapper}>
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                    {
                                        members.map((rowData, index) => (

                                            <TableWrapper style={{ flexDirection: 'row' }}>
                                                {
                                                    rowData.map((cellData, cellIndex) => (
                                                        <Cell key={cellIndex}
                                                            data={cellIndex == 0 || (rowData.length - 1) == cellIndex ?
                                                                (cellIndex == 0 ? <IdTable id={cellData} toggleCheckbox={toggleCheckbox} checked={checked} /> : <ActionButton id={cellData} />)
                                                                :
                                                                cellData} style={styles.tableCellCustome(widthArr[cellIndex], members.length, index)} textStyle={{ fontWeight: 'bold' }} />
                                                    ))
                                                }
                                            </TableWrapper>
                                        ))
                                    }
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const ActivitiesTable = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [histories, setHistories] = useState([])
    useEffect(() => {
        Promise.all([ProjectCrmService.getHistories(authToken, user?.client?.id, navigation)])
            .then(([historiesData]) => {
                const rowData = []
                historiesData?.results.forEach(history => {
                    rowData.push([moment(history?.timestamp).format('YYYY-MM-DD HH:mm'), history?.member?.name, history?.action, history?.description, history?.user])
                });
                setHistories(rowData)
            }).catch(err => console.log(err)).finally(() => setLoading(false))
    }, [])

    const { width, height } = Dimensions.get('window');
    const tableHead = ['Date', 'Customer', 'Action Type', 'Description', 'Updated by User']
    const widthArr = [80, 80, 80, 100, 120]


    if (loading == false) {

        return (
            <View style={{ width, height, maxWidth: width }}>

                <View style={styles.container}>
                    <ScrollView horizontal={true}>
                        <View style={{ height: 500 }} >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                                <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                            </Table>
                            <ScrollView style={styles.dataWrapper}>
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                    {
                                        histories.map((rowData, index) => (
                                            <RowTable
                                                key={index}
                                                data={rowData}
                                                widthArr={widthArr}
                                                style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                                                textStyle={styles.text}
                                            />
                                        ))
                                    }
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const CustomerCrm = () => {
    const scrollViewRef = useRef();
    const { width, height } = Dimensions.get('window');
    const scrollRef = useRef()
    const { authToken, user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true)
    const [indexActive, setIndexActive] = useState(0)
    const navigation = useNavigation();
    const [counts, setCounts] = useState([])
    const initialConfig = {
        waitForInteraction: true,
        // At least one of the viewAreaCoveragePercentThreshold or itemVisiblePercentThreshold is required.
        // viewAreaCoveragePercentThreshold: 95,
        itemVisiblePercentThreshold: 50
    };

    useEffect(() => {
        Promise.all([ProjectCrmService.getCount(authToken, user?.client?.id, navigation)]).then(([counts,]) => {
            setCounts(counts['counts']);
        }).catch((err) => console.log({ err })).finally(() => setLoading(false))
    }, [])


    const scrollToIndex = (index) => {
        scrollRef?.current?.scrollToIndex({ index: index, animated: true });
        setIndexActive(index)
    };


    const [checked, setChecked] = useState([]);
    const toggleCheckbox = (id) => {
        const data = checked;
        if (!data.includes(id)) {
            data.push(id)
        } else {
            const index = data.findIndex(item => item.id == id);
            data.splice(index, 1)
        }
        setChecked(data)
    }

    return (
        <Layout>
            {loading == false && (
                <View style={{ flex: 1, }} >

                    <View style={{ paddingHorizontal: 20, }}>
                        <ScrollView horizontal={true} style={{ width: '100%', }} snapToInterval={110} >
                            {counts.map((count, index) => (
                                <>
                                    <Card name={count.name} count={count.count} color={index % 2 != 0 ? colors.buttonColorSecond : colors.buttonColorGreen} />
                                </>
                            ))}
                        </ScrollView>

                        <Row styles={{ marginTop: 5, columnGap: 4 }} >
                            <Button
                                onPress={() => navigation.navigate('contactAdd')}
                                buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >+ Add Contact</Button>
                            {/* <Button
                                onPress={() => navigation.navigate('companyAdd')}
                                buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >+ Add Company</Button> */}
                            <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} >+ Delete</Button>
                        </Row>
                        <Row styles={{ marginTop: 10 }} >
                            <TouchableOpacity style={{ borderBottomWidth: indexActive == 0 ? 2 : 0, borderBottomColor: colors.buttonColorGreen, marginRight: 5 }} >
                                <Text style={{ color: indexActive == 0 ? colors.buttonColorGreen : 'black', fontWeight: 'bold' }} onPress={() => scrollToIndex(0)}> COMPANIES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ borderBottomWidth: indexActive == 1 ? 2 : 0, borderBottomColor: colors.buttonColorGreen, marginRight: 5 }} >
                                <Text style={{ color: indexActive == 1 ? colors.buttonColorGreen : 'black', fontWeight: 'bold' }} onPress={() => scrollToIndex(1)}> PERSON</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ borderBottomWidth: indexActive == 2 ? 2 : 0, borderBottomColor: colors.buttonColorGreen, marginRight: 5 }} >
                                <Text style={{ color: indexActive == 2 ? colors.buttonColorGreen : 'black', fontWeight: 'bold' }} onPress={() => scrollToIndex(2)}> ACTIVITIES</Text>
                            </TouchableOpacity>
                        </Row>
                    </View>

                    <FlatList
                        style={{ height: '100%' }}
                        horizontal={true}
                        scrollEventThrottle={16}
                        snapToInterval={width}
                        decelerationRate={'fast'}
                        ref={scrollRef}
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            // console.log(Math.round(nativeEvent.contentOffset.x / width));
                            setIndexActive(Math.round(nativeEvent.contentOffset.x / width))
                        }}
                        // viewabilityConfig={initialConfig}
                        // onViewableItemsChanged={onViewableItemsChanged}
                        data={[<CompaniesTable checked={checked} setChecked={setChecked} toggleCheckbox={toggleCheckbox} />, <PersonTable />, <ActivitiesTable />]}
                        renderItem={({ item, index }) => (
                            <View key={index}>
                                {item}
                            </View>
                        )}
                    />
                </View>
            )}
        </Layout >
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: 'transparent', },
    header: { height: 50, backgroundColor: '#ffffff', },
    text: { textAlign: 'center', fontWeight: '700' },
    dataWrapper: { marginTop: -1, height: 100 },
    row: { backgroundColor: '#fff' },
    tableCellCustome: (width, lenght, index) => ({
        width: width, paddingHorizontal: 2, backgroundColor: index % 2 == 0 ? '#F7F6E7' : '#fff',
    }),
});
export default CustomerCrm