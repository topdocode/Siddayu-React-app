import { useNavigation } from '@react-navigation/native'
import debounce from 'lodash/debounce'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import { useSelector } from 'react-redux'
import Gap from '../../../../component/Gap/Gap'
import Row from '../../../../component/Row/Row'
import { getPage } from '../../../../helper/getPage'
import ProjectCrmService from '../../../../services/CRM/Project'
import { global_styles } from '../../../global_styles'

const TextColumn = ({ text = '', width = '26%', header = false, style }) => {
    return <Text style={{ width: width, fontWeight: header ? '700' : '400', marginHorizontal: '1%', ...style }} numberOfLines={2} >{text}</Text>
}

const Header = () => (
    <View style={{ flexDirection: 'row', padding: 10, justifyContent: 'space-between', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: 'grey' }} >
        <Row styles={{ alignItems: 'center' }} >
            <TextColumn text='Name' header={true} />
            <TextColumn text='Location' header={true} />
            <TextColumn text='Prospect Priority' header={true} />
        </Row>
        {/* <TextColumn text='Action' style={{ textAlign: 'right' }} header={true} /> */}
    </View>
)

const Data = ({ data, clientId, handleDelete }) => {
    const navigation = useNavigation()
    return (
        <View style={[{ flexDirection: 'row', backgroundColor: 'white', padding: 10, justifyContent: 'space-between', marginBottom: 5, }, global_styles.shadow]} >
            <Row>
                <TextColumn text={data?.name?.split(' ').slice(0, 4).join(' ')} />
                <TextColumn text={data?.location?.name} />
                <TextColumn text={data?.attributes?.prospect_priority} />
            </Row>
            <Row styles={{}} >
                <TouchableOpacity onPress={() => navigation.navigate('projectDetailCrm', { id: data.id, clientId: clientId })} style={{ alignItems: 'center', justifyContent: 'center' }} >
                    <Icon name='pencil' size={25} />
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => handleDelete(data.id)} >
                    <Icon name='delete' size={25} />
                </TouchableOpacity>
            </Row>
            {/* <TextColumn text='Name' /> */}
        </View>)
}

const Project = () => {
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation()
    const [crmProject, setCrmProject] = useState([])
    const [totalPages, setTotalpages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        next: '',
        previous: ''
    })
    const itemsPerPage = 5;
    const [selectClient, setSelectClient] = useState({})
    useEffect(() => {
        // if (user?.is_superuser) {
        //     ProjectCrmService.clients(authToken, navigation).then((res) => {
        //         setClients(res?.results)
        //     })
        // } else {
        getData()
    }, [])

    const getData = () => {
        ProjectCrmService.crmProject(authToken, user?.client?.id, navigation).then((res) => {
            setCurrentPage(1)
            setCrmProject(res.results)
            setTotalpages(Math.ceil(res.count / itemsPerPage));
            setPagination(
                { ...pagination, next: res.next ?? '', previous: res.previous ?? '' }
            )
        }).catch((e) => console.log(e))
        // }
        return () => {
            setCurrentPage(1)
        }
    }


    const handleGetProjectCrm = (clientId) => {
        ProjectCrmService.crmProject(authToken, user?.is_superuser ? clientId : user?.client?.id, navigation).then((res) => {
            setCurrentPage(1)
            setCrmProject(res.results)
            setTotalpages(Math.ceil(res.count / itemsPerPage));
            setPagination(
                { ...pagination, next: res.next, previous: res.previous }
            )
        }).catch((e) => console.log(e))
    }

    const handleSelectClient = (item) => {
        setSelectClient(item)
        handleGetProjectCrm(item?.id)
    }

    const handleDelete = (projectId) => {
        Alert.alert(
            'Delete project',
            'Are you sure you want to delete this project ?',
            [
                { text: 'NO', onPress: () => console.log('no') },
                { text: 'YES', onPress: () => { deleteProject(projectId) }, style: 'cancel' },
            ]
        );
    }

    const deleteProject = (projectId) => {
        ProjectCrmService.deleteProject(authToken, projectId, navigation).then((res) => {
            getData()
            ToastAndroid.show('Deleted Success', ToastAndroid.LONG)

        }).catch(err => ToastAndroid.show(err.message, ToastAndroid.LONG))
    }

    const nextOrPrevious = (type = '') => {
        if (type == 'next' && pagination.next != '') {
            const nextFun = () => {
                ProjectCrmService.crmProject(authToken, selectClient?.id, navigation, getPage(pagination.next)).then((res) => {
                    setCrmProject(res.results)
                    setTotalpages(Math.ceil(res.count / itemsPerPage));
                    setPagination(
                        { ...pagination, next: res.next, previous: res.previous }
                    )
                })
            }

            const debouncedNextFun = debounce(nextFun, 100);
            debouncedNextFun();
        }
        if (type == 'previous' && pagination.previous != '') {
            // setRefreshing(true)

            const previousFun = () => {
                ProjectCrmService.crmProject(authToken, selectClient?.id, navigation, getPage(pagination.previous)).then((res) => {
                    setCrmProject(res.results)
                    setTotalpages(Math.ceil(res.count / itemsPerPage));
                    setPagination(
                        { ...pagination, next: res.next, previous: res.previous }
                    )
                })
            }

            const debouncedPreviousFun = debounce(previousFun, 100);
            debouncedPreviousFun();


        }
    }



    return (
        <>
            <Gap height={10} />
            <View style={{ paddingHorizontal: 20 }} >
                <Row styles={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }} >
                    <Text style={{ fontWeight: '700' }} >Choose Project</Text>
                    {/* <Button onPress={() => navigation.navigate('projectAddCrm')} buttonStyle={{ backgroundColor: colors.buttonColorGreen }}  >+ Add Project</Button> */}
                </Row>
                {/* {user.is_superuser && (
                    <>
                        {clients.length > 0 && (

                            <ModalDropdownCustom dataOptions={clients} styleDropdown={{ backgroundColor: 'white' }} valueSelected={selectClient} setValueSelected={handleSelectClient} />
                        )}
                    </>
                )} */}
                <Row styles={{ alignItems: 'center', justifyContent: 'flex-end', backgroundColor: 'white' }} >
                    <TouchableOpacity onPress={
                        () => {
                            if (currentPage > 1 && pagination.previous != '') {
                                setCurrentPage(currentPage - 1);
                                nextOrPrevious('previous')
                            }
                        }}>
                        <Icon name='chevron-left' size={25} />
                    </TouchableOpacity>

                    <Text>Page : {currentPage}</Text>
                    <TouchableOpacity onPress={
                        () => {
                            if (currentPage < totalPages && pagination.next != '') {
                                setCurrentPage(currentPage + 1)
                                nextOrPrevious('next')
                            }
                        }}>
                        <Icon name='chevron-right' size={25} />
                    </TouchableOpacity>
                </Row>
                <Header />
            </View>
            <View style={{ paddingHorizontal: 20, flex: 1 }} >
                {crmProject.length > 0 && (
                    <FlatList
                        data={crmProject}
                        renderItem={(data) => <Data data={data.item} clientId={selectClient?.id} handleDelete={handleDelete} />}
                        keyExtractor={item => item.id}
                        windowSize={10}
                    />
                )}

                {crmProject.length < 0 && (
                    <Text>Loading ...</Text>
                )}
                <Gap height={10} />
            </View>
        </>
    )
}

export default Project