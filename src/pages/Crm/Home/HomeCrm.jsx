import React, { useEffect, useState } from 'react'
import Layout from '../../../component/layout/Layout'
import ProjectCrmService from '../../../services/CRM/Project'
import { useSelector } from 'react-redux';
import { View, ScrollView, Text } from 'react-native';
import { global_styles } from '../../global_styles';

const HomeCrm = ({ navigation }) => {
    const { user, authToken } = useSelector((state) => state.auth);
    const [counts, setCounts] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        ProjectCrmService.getCountCrm(authToken, user?.client?.id, navigation).then(res => {
            setCounts(res)
        }).catch((err) => console.log(err)).finally(() => setLoading(false))
    }, [])

    return (
        <Layout>
            <View style={{ paddingHorizontal: 20, flex: 1, justifyContent: 'center' }} >
                <ScrollView>
                    <View style={[{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', },]}  >
                        {loading == false && (
                            <>
                                <View style={[{ width: "50%", padding: 4, height: 199, },]} >
                                    <View style={[{ backgroundColor: '#87C4FF', height: '100%', justifyContent: 'center', alignItems: 'center' }, global_styles.shadow]} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 40 }} >{counts?.members}</Text>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }} >Member</Text>
                                    </View>
                                </View>
                                <View style={[{ width: "50%", padding: 4, height: 199, },]} >
                                    <View style={[{ backgroundColor: '#A2C579', height: '100%', justifyContent: 'center', alignItems: 'center' }, global_styles.shadow]} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 40 }} >{counts?.member_locations}</Text>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }} >Member Location</Text>
                                    </View>
                                </View>
                                <View style={[{ width: "50%", padding: 4, height: 199, },]} >
                                    <View style={[{ backgroundColor: '#CE5A67', height: '100%', justifyContent: 'center', alignItems: 'center' }, global_styles.shadow]} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 40 }} >{counts?.projects}</Text>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }} >Project</Text>
                                    </View>
                                </View>
                                <View style={[{ width: "50%", padding: 4, height: 199, },]} >
                                    <View style={[{ backgroundColor: '#DE8F5F', height: '100%', justifyContent: 'center', alignItems: 'center' }, global_styles.shadow]} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 40 }} >{counts?.project_locations}</Text>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }} >Project Location</Text>
                                    </View>
                                </View>
                            </>

                        )}
                    </View>
                </ScrollView>
            </View>
        </Layout>
    )
}

export default HomeCrm