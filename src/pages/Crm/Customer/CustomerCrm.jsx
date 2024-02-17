import { useNavigation } from '@react-navigation/native'
import { Button, CheckBox } from '@rneui/themed'
import React, { useEffect, useState, useCallback } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Cell, Row as RowTable, Table, TableWrapper } from 'react-native-table-component'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import { useSelector } from 'react-redux'
import Gap from '../../../component/Gap/Gap'
import Row from '../../../component/Row/Row'
import Layout from '../../../component/layout/Layout'
import ProjectCrmService from '../../../services/CRM/Project'
import { colors } from '../../../utils/color'
const Card = ({ name, count, color = '' }) => {
    return (
        <View style={{ height: 70, width: 100, backgroundColor: color, borderRadius: 5, justifyContent: 'space-between', padding: 5, marginHorizontal: 5 }} >
            <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={2} >{name ?? ''}</Text>
            <Text style={{ color: 'white', fontWeight: "700", textAlign: 'center', fontSize: 20 }}>{count ?? ''}</Text>
        </View>
    )
}


const IdTable = ({ checked, toggleCheckbox, id, idMembers }) => {
    const [check, setCheck] = useState(false);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <CheckBox
                containerStyle={{ backgroundColor: 'transparent', padding: 0, width: 25 }}
                checked={check}
                onPress={() => {
                    setCheck(!check)
                    toggleCheckbox(idMembers)
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

const CompaniesTable = ({ checked, toggleCheckbox, loading, members, idMembers }) => {
    const navigation = useNavigation();

    const tableHead = ['Id', 'Name', 'Phone', 'PIC', 'Email', 'Action']
    const widthArr = [80, 150, 150, 150, 150, 80]

    const ActionButton = ({ id }) => {
        return (
            <TouchableOpacity style={{ paddingHorizontal: 10, justifyContent: 'center', flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('customerDetailCrm', { customerId: id })} >
                <Icon name='pencil' size={20} />
            </TouchableOpacity>
        )

    }



    if (loading == false) {

        return (
            <View style={{ paddingHorizontal: 20, flex: 1 }} >
                <ScrollView horizontal={true}>
                    <View style={{ flex: 1, height: '90%' }} >
                        <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                            <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                        </Table>
                        <ScrollView style={styles.dataWrapper}  >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                {
                                    members.map((rowData, index) => (

                                        <TableWrapper style={{ flexDirection: 'row' }}>
                                            {
                                                rowData.map((cellData, cellIndex) => (
                                                    <Cell key={cellIndex}
                                                        data={cellIndex == 0 || (rowData.length - 1) == cellIndex ?
                                                            (cellIndex == 0 ? <IdTable idMembers={idMembers[index]} id={cellData} toggleCheckbox={toggleCheckbox} checked={checked} /> : <ActionButton id={cellData} />)
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
        )
    }
}

const CustomerCrm = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true)
    const navigation = useNavigation();
    const [counts, setCounts] = useState([])
    const [members, setMembers] = useState([])
    const [idMembers, setIdMembers] = useState([])
    useEffect(() => {
        Promise.all([
            ProjectCrmService.getCount(authToken, user?.client?.id, navigation),
            ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation, true)

        ]).then(([counts, memberData]) => {
            setCounts(counts['counts']);
            const rowData = []
            const idMembers = []
            memberData?.results.forEach(member => {
                idMembers.push(member.id)
                rowData.push([member?.member_id, member?.name, member?.phone, member?.member_attributes?.PIC, member?.email, member.id])
            });
            setIdMembers(idMembers)
            setMembers(rowData)
        }).catch((err) => console.log({ err })).finally(() => setLoading(false))
    }, [])



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

    const getData = () => {
        ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation, true).then((memberData) => {
            const rowData = []
            memberData?.results.forEach(member => {
                rowData.push([member?.member_id, member?.name, member?.phone, member?.member_attributes?.PIC, member?.email, member.id])
            });
            setMembers(rowData)
        })
    }

    const handleDeleteCustomer = () => {
        const form = new FormData()

        form.append('ids', checked)
        setLoading(true)
        ProjectCrmService.deleteCustomerCrm(authToken, { ids: checked }, navigation).then((res) => {
            // getData()
            console.log(res);
        }).catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }
    return (
        <Layout>
            {loading == false && (
                <View style={{ flex: 1 }} >

                    <View style={{ paddingHorizontal: 20 }}>
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
                            <Button onPress={() => handleDeleteCustomer()} buttonStyle={{ backgroundColor: colors.buttonColorSecond }} >+ Delete</Button>
                            <Button onPress={() => navigation.navigate('customerLocation')} buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >Location</Button>
                        </Row>
                    </View>
                    <Gap height={20} />
                    <CompaniesTable idMembers={idMembers} loading={loading} members={members} checked={checked} setChecked={setChecked} toggleCheckbox={toggleCheckbox} />
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