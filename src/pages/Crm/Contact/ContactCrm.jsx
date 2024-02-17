import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View, Text } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { Row as RowTable, Table, TableWrapper, Cell } from 'react-native-table-component'
import { useSelector } from 'react-redux'
import Layout from '../../../component/layout/Layout'
import ProjectCrmService from '../../../services/CRM/Project'
import { colors } from '../../../utils/color'
import { Tab } from '@rneui/themed'
import LocationContact from './LocationContact'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import { useFocusEffect } from '@react-navigation/native'


const ActionButton = ({ id }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity style={{ paddingHorizontal: 10, justifyContent: 'center', flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('contactUpdate', { contactId: id })} >
            <Icon name='pencil' size={20} />
        </TouchableOpacity>
    )

}
const ContactCrm = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(true)
    const [contats, setContacts] = useState([])
    useFocusEffect(() => {
        Promise.all([ProjectCrmService.contactCrm(authToken, user?.client?.id, navigation, false)])
            .then(([contats]) => {
                const rowData = []
                contats?.results.forEach(contact => {
                    rowData.push([contact?.name, contact?.member?.name, contact?.position, contact?.phone, contact?.email, contact?.contact_title?.name, contact?.id])
                });
                setContacts(rowData)
            }).catch(err => console.log(err)).finally(() => {
                setLoading(false)
            })

    })

    const tableHead = ['Name', 'Company', 'Position', 'Phone', 'Email', 'Contact Title', 'action']
    const widthArr = [150, 150, 150, 150, 150, 150, 80]
    const [selectTab, setSelectTab] = useState(0);


    return (
        <Layout>
            <View style={{ paddingHorizontal: 20 }} >
                <Text style={{ fontSize: 24, fontWeight: 'bold', }} >Contact</Text>
                <Tab value={selectTab} onChange={setSelectTab} dense indicatorStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ color: colors.textColor }}>
                    <Tab.Item
                    >Contact</Tab.Item>
                    <Tab.Item>Location</Tab.Item>
                </Tab>

                {selectTab == 0 && loading == false && (
                    <ScrollView horizontal={true}>
                        <View style={{ flex: 1, height: '85%' }} >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                                <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                            </Table>
                            <ScrollView style={styles.dataWrapper}>
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>

                                    {
                                        contats.map((rowData, index) => (

                                            <TableWrapper style={{ flexDirection: 'row' }}>
                                                {
                                                    rowData.map((cellData, cellIndex) => (
                                                        <Cell key={cellIndex}
                                                            data={(rowData.length - 1) == cellIndex ? <ActionButton id={cellData} />
                                                                :
                                                                cellData} style={styles.tableCellCustome(widthArr[cellIndex], contats.length, index)} textStyle={{ fontWeight: 'bold' }} />
                                                    ))
                                                }
                                            </TableWrapper>
                                        ))
                                    }
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                )}

            </View>
            {selectTab == 1 && (
                <LocationContact />
            )}
        </Layout >
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: 'transparent', },
    header: { height: 50, backgroundColor: '#ffffff', },
    text: { textAlign: 'center', fontWeight: '700' },
    dataWrapper: { marginTop: -1, height: '100%' },
    row: { backgroundColor: '#fff' },
    tableCellCustome: (width, lenght, index) => ({
        width: width, paddingHorizontal: 2, backgroundColor: index % 2 == 0 ? '#F7F6E7' : '#fff',
    }),
});
export default ContactCrm