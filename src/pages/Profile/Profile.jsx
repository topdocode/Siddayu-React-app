import { View, Image, TextInput, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Layout from '../../component/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Text, Switch, CheckBox } from '@rneui/themed';
import Gap from '../../component/Gap/Gap';
import Row from '../../component/Row/Row';
import UserService from '../../services/User';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import { saveAuth, saveUserOld, saveUserUpdate } from '../../redux/features/auth/authSlice';
import Notif from '../../component/Notif';
import { setNotif } from '../../redux/features/notifAlert/notifSlice';
import * as ImagePicker from 'react-native-image-picker';
import { androidCameraPermission } from '../../helper/permission';
import { colors } from '../../utils/color';
const Profile = ({ children, navigation }) => {
  const { user, authToken } = useSelector((state) => state.auth);
  const { online } = useSelector((state) => state.offlineRedux);
  // const [status, setStatus] = useState(user.is_active);
  const [loading, setLoading] = useState(true)
  // const [group, setGroup] = useState([])
  const [groupByUser, setGroupByUser] = useState([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const dispatch = useDispatch();
  const [mediaPicker, setMediaPicker] = useState(null);
  var passwordChange = false;

  const getUser = async () => {
    await UserService.getUser(authToken, user.id, navigation).then((res) => {
      dispatch(saveAuth({ user: res, stillKey: true, passwordChange: passwordChange }));
      setGroupByUser(res.groups)
      getClient(res.client)
    }).catch((e) => {
    }).finally(() => setLoading(false))
  }

  const getClient = async (clientId) => {
    await UserService.getClient(authToken, clientId, navigation).then((res) => {
      if (res?.subscriptions.length > 0) {
        let subscrip = '';
        res.subscriptions.map(item => {
          subscrip += `subscription=${item.id}&`;
        })

        // getGroup(subscrip)

      }
    }).catch((e) => { })
  }


  const getGroup = async (subscrip) => {
    // await UserService.getGroup(authToken, subscrip, navigation).then((res) => {
    //   setGroup(res.results)
    // }).catch((e) => console.log(e))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await getUser();
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }


    fetchData();
  }, [])

  const handleUpdateProfile = () => {

    const formData = new FormData();
    const formDataForOffline = {};
    Object.entries(user).forEach(([key, value]) => {
      if (key !== 'password' && key !== 'avatar' && key !== 'last_login' && key !== 'date_joined' && key !== 'is_staff' && key !== 'username') {

        if (key === 'name') {
          formData.append(key, name)
          formDataForOffline['name'] = name;
        }
        else if (key === 'email') {
          formData.append(key, email)
          formDataForOffline['email'] = email;
        }
        else if (key === 'groups') {
          let groups = [];
          if (groupByUser.length > 0) {
            groupByUser.forEach(element => {
              groups.push(element.id)
            });
            formDataForOffline['groups'] = groups;
            formData.append(key, groups);
          }
        } else {
          formData.append(key, value);
          formDataForOffline[key] = value;
        }
      }
    });

    // delete data.password;

    if (password != '' || confirmPassword != '') {
      if (password == confirmPassword) {
        formData.append('password', password)
        formData.append('confirm_password', confirmPassword)
        formDataForOffline['password'] = password;
        formDataForOffline['confirm_password'] = confirmPassword;
        passwordChange = true;
      } else {
        dispatch(setNotif({
          message: "Please confirm password",
          status: "error",
          show: true,
        }));
        return false
      }
    }

    if (mediaPicker?.assets && mediaPicker?.assets.length > 0) {
      const image = mediaPicker.assets[0];
      formData.append('avatar', {
        uri: image.uri,
        type: image.type,
        name: image.fileName
      })
      formDataForOffline['avatar'] = {
        uri: image.uri,
        type: image.type,
        name: image.fileName
      }
    }

    if (online) {
      UserService.updateProfile(authToken, formData, user.id, navigation).then((res) => {
        console.log(res);
        if (passwordChange) {
          res.password = password
        }
        dispatch(saveAuth({ user: res, stillKey: true, passwordChange: passwordChange }));
        dispatch(setNotif({
          message: "Profile updated",
          status: "success",
          show: true,
        }));

      }).catch((err) => {
        console.log(err);
        if (err?.response?.data?.password && err.response.data.password[0]) {
          let message = err.response.data.password[0];
          dispatch(setNotif({
            message: message,
            status: "error",
            show: true,
          }));
          setPassword('');
          setConfirmPassword('');
        } else if (err?.response?.data?.email && err.response.data.email[0]) {
          let message = err.response.data.email[0];
          dispatch(setNotif({
            message: message,
            status: "error",
            show: true,
          }));
          setPassword('');
          setConfirmPassword('');
        } else if (err?.response?.data?.data?.confirm_password && err.response.data.data.confirm_password[0]) {
          let message = err.response.data.data.confirm_password[0];
          dispatch(setNotif({
            message: message,
            status: "error",
            show: true,
          }));
          setPassword('');
          setConfirmPassword('');
        }
      })
    } else {
      const dataArray = {};

      for (const [key, value] of formData._parts) {
        if (key != 'avatar') {
          dataArray[key] = value
        }
      }
      if (passwordChange) {
        dataArray['password'] = password
      }
      dispatch(saveUserOld(user))
      dispatch(saveUserUpdate(formDataForOffline))
      dispatch(saveAuth({ user: { ...user, ...dataArray }, stillKey: true, passwordChange: passwordChange }))
    }
  }





  // handle media


  const onButtonMedia = useCallback(async (type, options) => {
    const permissionStatus = await androidCameraPermission();
    if (options == null) {
      options = {
        selectionLimit: 0,
        mediaType: 'mixed',
        // includeBase64: true,
        includeExtra: true,
      }
    }
    if (type === 'capture') {
      ImagePicker.launchCamera(options, setMediaPicker);
    } else {
      ImagePicker.launchImageLibrary(options, setMediaPicker);
    }
  }, []);

  const selectTypeTakeImage = () => {
    return Alert.alert(
      'Select Image',
      "Choose type for take image !",
      [
        {
          text: "Gallery",
          onPress: () => { onButtonMedia() }
        },
        {
          text: "Camera",
          onPress: () => { onButtonMedia('capture'); }
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    )
  }


  if (loading == false) {
    return (
      <Layout color='white' >
        <ScrollView style={{ flex: 1 }} >
          <View style={{ alignItems: 'center', paddingHorizontal: 10 }} >
            <Notif />
            <Image
              alt='profile'
              source={mediaPicker?.assets && mediaPicker?.assets.length > 0 ? { uri: mediaPicker?.assets[0]?.uri } : (user.avatar != null ? { uri: `${user.avatar}` } : require('../../assets/profile.png'))}
              style={{ width: 100, height: 100, resizeMode: 'contain', borderRadius: 100 }}
            />
            <Gap height={8} />
            <Button
              onPress={selectTypeTakeImage}
              size='sm'
              titleStyle={{ color: 'black', fontWeight: '400', fontSize: 12 }}
              buttonStyle={{ borderRadius: 10, backgroundColor: '#ebebeb' }}
            >
              Choose your ava
            </Button>
            <View style={{ alignItems: 'flex-start', width: '100%' }}>
              <Gap height={0} />
              <Input value={name} title='Name' placeholder='Your Name' onChangeText={(value) => setName(value)} style={{ fontWeight: 'bold' }} />
              <Gap height={10} />
              <Input value={email} title='Email' placeholder='Your Email' onChangeText={(value) => setEmail(value)} />
              <Gap height={20} />

              {/* gorup hide you can use for update other user */}
              {/* {group.length > 0 && group.map((item, index) => (
                <>
                  <SwithInput key={index} title={item.name} value={findObjectById(item.id)} onValueChange={(value) => handleSwitchGroup(value, item)} />
                  <Gap height={8} />
                </>
              ))} */}


              {/* status can use for update other user */}
              {/* <Gap height={15} />
              <Text>Status</Text>
              <Row styles={{ alignItems: 'center', padding: 0 }} >

                <CheckBox
                  disabled
                  checked={status == true}
                  onPress={() => setStatus(true)}
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o"
                  containerStyle={{ padding: 5, margin: 0, }}
                />
                <Text>Active</Text>

                <CheckBox
                  disabled
                  checked={status === false}
                  onPress={() => setStatus(false)}
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o"
                  containerStyle={{ padding: 5, margin: 0, }}
                />
                <Text>Inactive</Text>
              <Gap height={20} />
              </Row> */}

              {/* pasword */}

              {showUpdatePassword && (
                <>
                  <Gap height={10} />
                  <InputPassword value={password} onChangeText={(value) => setPassword(value)} placeholder='Password' />
                  <Gap height={10} />
                  <InputPassword value={confirmPassword} onChangeText={(value) => setConfirmPassword(value)} placeholder='Confirm Password' />
                  <Gap height={10} />
                </>
              )}


              <Gap height={8} />
              <View style={{ alignItems: 'center', width: '100%', flexDirection: 'row', columnGap: 4, justifyContent: 'flex-end' }} >
                <Button type='outline' size='md' buttonStyle={{ borderColor: colors.borderColorSecond, backgroundColor: 'rgba(255,255,255,255)' }} titleStyle={{ fontSize: 12, color: colors.textColorSecond }} onPress={() => setShowUpdatePassword(!showUpdatePassword)} >UPDATE PASSWORD</Button>
                <Button
                  loading={loading}
                  // type='outline'
                  size='md'
                  buttonStyle={{ backgroundColor: colors.buttonColorSecond }}
                  titleStyle={{ fontSize: 12 }}
                  onPress={handleUpdateProfile} >
                  UPDATE USER
                </Button>
              </View>
            </View>

          </View>

          <Gap height={20} />
        </ScrollView>
      </Layout >
    )
  }
}

export default Profile

const Input = (props) => {
  const { value, placeholder, title, onChangeText, style } = props;
  return (
    <View style={{ width: '100%' }} >
      <Text style={{ fontWeight: 'bold' }} >{title}</Text>
      <Gap height={4} />
      <TextInput
        style={[{
          borderWidth: 0.4, width: '100%', borderRadius: 10, height: 40, paddingHorizontal: 10, backgroundColor: 'white'
        }]}
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />
    </View>
  )
}

const SwithInput = (props) => {
  const { value, onValueChange, title } = props;
  return (
    <Row styles={{ justifyContent: 'flex-start', columnGap: 20, alignItems: 'center', borderBottomWidth: 0.5, paddingBottom: 5, width: '100%' }} >
      <Text style={{ fontWeight: '700', width: 100 }} >{title}</Text>
      <Text style={{ fontWeight: '600' }} >Inactive</Text>
      <Switch
        value={value}
        onValueChange={value => onValueChange(value)}
      />
      <Text style={{ fontWeight: '600' }} >Active</Text>
    </Row>
  )
}

const InputPassword = (props) => {
  const { value, onChangeText, placeholder } = props;
  const [show, setShow] = useState(true);
  return (
    <View style={{
      borderWidth: 0.4,
      width: '100%',
      borderRadius: 10,
      height: 40,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white'
    }}>
      <TextInput
        placeholder={placeholder}
        value={value}
        secureTextEntry={show}
        onChangeText={onChangeText}
        style={{ paddingHorizontal: 10, width: '90%', backgroundColor: 'white' }}
      />

      <Button containerStyle={{ width: '10%' }} type="clear" size="sm" onPress={() => setShow(!show)} ><Icon name={show ? 'eye' : 'eye-off'} size={20} /></Button>
    </View>
  )
}