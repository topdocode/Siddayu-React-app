import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Overlay, Switch, Text } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, View, } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Gap from '../../component/Gap/Gap';
import Loading from '../../component/Loading/Loading';
import Row from '../../component/Row/Row';
import Layout from '../../component/layout/Layout';
import gridData from '../../helper/gridData';
import { chooseIdProject, saveProject, saveTaskByProjects } from '../../redux/features/taskFeature/taskFeature';
import ProjectService from '../../services/Project';
import { global_styles } from '../global_styles';
import { styles } from './styles';
const Project = ({ navigation }) => {

  const [loading, setLoading] = useState(true)
  const { authToken } = useSelector((state) => state.auth);
  const { projects: projectRedux, idProjectsOffline, refreshTaskAfterUpdate } = useSelector((state) => state.taskRedux);
  const numColumns = 3;
  const [projects, setProjects] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  // const data = [
  //   { name: 'all', },
  //   { name: 'wifi', },
  //   { name: 'cellular', },
  // ];

  // const handleStatus = (data) => {
  //   setSelected(data)
  //   dispatch(saveChooseConnection({ chooseConnection: data.name }))
  // }

  const { online, type, chooseConnection } = useSelector((state) => state.offlineRedux);
  // const [selected, setSelected] = useState({ name: chooseConnection });
  const dispatch = useDispatch();

  const fetchData = async () => {
    if (online) {
      setLoading(true)
      const length = idProjectsOffline.length - 1;
      let params = '';

      if (idProjectsOffline.length > 0) {
        if (chooseConnection != 'all') {
          if (chooseConnection == type) {
            idProjectsOffline.map((item, index) => {
              if (length == index) {
                params += `ids=${item}`
              } else {
                params += `ids=${item}&`;
              }
            })

          }
        } else {
          idProjectsOffline.map((item, index) => {
            if (length == index) {
              params += `ids=${item}`
            } else {
              params += `ids=${item}&`;
            }
          })
        }
      }
      ProjectService.getProjectAndtask(authToken, params, navigation).then((res) => {
        const data = res.results.map((item) => {
          const checkSaveOrNot = idProjectsOffline.indexOf(item.id);
          if (checkSaveOrNot !== -1) {
            if ((chooseConnection == type || chooseConnection == 'all') && params != '') {
              dispatch(saveTaskByProjects({ projectId: item.id, task: item.sections }))
            }
          }

          return {
            id: item.id,
            icon: item.icon,
            name: item.name,
          }
        })

        setProjects(res.results)
        dispatch(saveProject(data))
        setLoading(false)
      }).catch((e) => {
        setLoading(false)
      })
    } else {

      const newDataFound = [];
      const newDataNotFound = [];

      // Loop pertama untuk data yang ditemukan
      projectRedux.forEach((item) => {
        if (idProjectsOffline.indexOf(item.id) >= 0) {
          newDataFound.push(item);
        } else {
          newDataNotFound.push(item);
        }
      });

      const newDataMerged = newDataFound.concat(newDataNotFound)
      setProjects(newDataMerged)
      setLoading(false)
    }
  }



  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
    return () => {

    }
  }, [online, isFocused])

  const onRefresh = () => {
    fetchData()
  };



  if (loading) {
    return <Loading />
  } else {
    return (
      <Layout color="white" >
        <FlatList
          data={[1]}
          renderItem={(item, index) => (
            <View style={global_styles.container} >

              {/* Filter and Name */}
              {/* <Row styles={{ justifyContent: 'space-between' }} >
                <Row styles={{ alignItems: 'flex-end', }} >
                  <Text style={{ fontSize: 24, }} >Project</Text>
                  <Gap width={10} />
                  <ModalDropdownCustom dataOptions={data} setValueSelected={handleStatus} valueSelected={selected} />
                </Row>

              </Row> */}

              <Gap height={20} />
              {/* List Of Project  */}
              <FlatList
                data={gridData(projects, numColumns)}
                horizontal={false}
                numColumns={numColumns}
                key={numColumns}
                renderItem={(data) => (
                  <ProjectItem numColumns={numColumns} item={data.item} fetchData={fetchData} />
                )}
              />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </Layout>
    )
  }
}


const ProjectItem = (props) => {
  const { item, numColumns, fetchData } = props
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const { online } = useSelector((state) => state.offlineRedux);
  const { authToken } = useSelector((state) => state.auth);
  const { idProjectsOffline, taskByProjects } = useSelector((state) => state.taskRedux);
  const indexIdProjectOffline = idProjectsOffline.indexOf(item.id);
  const indexTaskByProject = taskByProjects.findIndex(value => value.id === item.id);
  const [checked, setChecked] = useState(idProjectsOffline.indexOf(item.id) >= 0 ? true : false);

  const chooseSaveProject = (id, type = null, save) => {

    if (type != 'remove') {

      // fetchData()
      setLoading(true)
      ProjectService.getProjectAndtask(authToken, `ids=${id}`, navigation).then(({ results }) => {
        if (results?.length > 0) {
          const index = results.findIndex(item => item.id == id);
          if (index != -1) {
            dispatch(saveTaskByProjects({ projectId: results[index].id, task: results[index].sections }))
            dispatch(chooseIdProject({ id, type }))
          }
        }
      }).catch((err) => {
      })

        .finally((_) => setLoading(false))
    } else {
      dispatch(chooseIdProject({ id, type }))
    }
  }

  const handlerSave = (save) => {
    if (save) {
      chooseSaveProject(item.id, null)
    } else {
      chooseSaveProject(item.id, 'remove')
    }

    setChecked(save)
    setVisible(false)
  }

  if (!item.empty) {
    return (
      <>
        <View style={[global_styles.cardGrid(numColumns),]}>
          <View
            style={[styles.card]}
          >
            <View style={{ color: 'gray', position: 'absolute', top: 1, right: 5 }} >
              {online && <TouchableOpacity onPress={toggleOverlay} >
                <Icon name="ellipsis-horizontal-sharp" size={24} style={{ color: 'gray', }} />
              </TouchableOpacity>}
            </View>
            {(indexIdProjectOffline >= 0 && taskByProjects[indexTaskByProject]?.task?.length > 0) && (
              <View style={{ color: 'gray', position: 'absolute', top: 4, left: 5 }} >
                <Icon name='save' size={15} color='green' />
              </View>
            )}
            <Gap height={20} />
            <TouchableOpacity onPress={(online && loading == false) || (indexIdProjectOffline >= 0 && taskByProjects[indexTaskByProject]?.task?.length > 0) ? () => navigation.navigate('task', { projectId: item.id }) : null}  >
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', }} >
                <Image
                  source={item.icon != null ? { uri: `${item.icon}` } : require('../../assets/projectbg.png')}
                  style={{
                    aspectRatio: 1,
                    width: 48,
                    height: 48,
                    opacity: (online && loading == false) || ((indexIdProjectOffline >= 0 && taskByProjects[indexTaskByProject]?.task?.length > 0)) ? 1 : 0.5
                  }}
                />
              </View>
            </TouchableOpacity>
            <Gap height={10} />
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }} numberOfLines={2} ellipsizeMode="tail" >{item.name}</Text>
          </View>
          <View>
            <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
              {online && (
                <Row styles={{ alignItems: 'center' }} >
                  {/* <Text style={{ fontSize: 16 }}> <Icon name='save' size={20} /> {idProjectsOffline.indexOf(item.id) >= 0 ? 'Remove' : 'Save'}  </Text> */}
                  <Icon name={idProjectsOffline.indexOf(item.id) >= 0 ? 'trash' : 'save'} size={20} />
                  <Switch
                    value={checked}
                    onValueChange={(value) => handlerSave(value)}
                  />
                </Row>
              )}
            </Overlay>
          </View>
        </View>
      </>

    )
  } else {
    return <View style={[global_styles.cardGrid(numColumns), global_styles.hiddenGrid]} ></View>
  }

}

export default Project