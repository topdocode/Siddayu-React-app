import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Cell, Row as RowTable, Table, TableWrapper } from 'react-native-table-component'
import { useSelector } from 'react-redux'
import ProjectCrmService from '../../../services/CRM/Project'
import Layout from '../../../component/layout/Layout'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'

const ActionButton = ({ id }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity style={{ paddingHorizontal: 10, justifyContent: 'center', flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('customerDetailCrm', { customerId: id })} >
            <Icon name='pencil' size={20} />
        </TouchableOpacity>
    )

}

const ActivitieCrm = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true)
    const [histories, setHistories] = useState([])
    useEffect(() => {
        Promise.all([ProjectCrmService.getHistories(authToken, user?.client?.id, navigation)])
            .then(([historiesData]) => {
                const rowData = []
                console.log({ historiesData });
                historiesData?.results.forEach(history => {
                    rowData.push([moment(history?.timestamp).format('YYYY-MM-DD HH:mm'), history?.member?.name, history?.action, history?.description, history?.user, history?.member?.id])
                });
                setHistories(rowData)
            }).catch(err => console.log(err)).finally(() => setLoading(false))
    }, [])

    const { width, height } = Dimensions.get('window');
    const tableHead = ['Date', 'Customer', 'Action Type', 'Description', 'Updated by User', "ACITON"]
    const widthArr = [150, 150, 150, 150, 150, 80]


    if (loading == false) {

        return (
            <Layout>
                <View style={{ width, height, maxWidth: width }}>
                    <View style={{ paddingHorizontal: 20, height: "100%" }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', }} >Activities</Text>
                        <ScrollView horizontal={true}>
                            <View style={{ height: '80%' }} >
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9', }}>
                                    <RowTable data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
                                </Table>
                                <ScrollView style={styles.dataWrapper}>
                                    <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                        {
                                            histories.map((rowData, index) => (
                                                // <RowTable
                                                //     key={index}
                                                //     data={rowData}
                                                //     widthArr={widthArr}
                                                //     style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                                                //     textStyle={styles.text}
                                                // />
                                                <TableWrapper style={{ flexDirection: 'row' }}>
                                                    {
                                                        rowData.map((cellData, cellIndex) => (
                                                            <Cell key={cellIndex}
                                                                data={rowData.length - 1 == cellIndex ?
                                                                    <ActionButton id={cellData} />
                                                                    :
                                                                    cellData} style={styles.tableCellCustome(widthArr[cellIndex], histories.length, index)} textStyle={{ fontWeight: 'bold' }} />
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
            </Layout>
        )
    }
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
export default ActivitieCrm