import { Button, Text } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import Container from '../../component/Container/Container';
import FzTextInput from '../../component/FzTextInput/FzTextInput';
import Gap from '../../component/Gap/Gap';
import { handleAuth } from '../../redux/features/auth/authSlice';
import { colors } from '../../utils/color';
import APILogin from './service';
import { useToast } from "react-native-toast-notifications";
const Login = ({ navigation }) => {
  // const { email } = useSelector(state => state.auth);
  const dispatch = useDispatch()
  const toast = useToast();
  const [form, setform] = useState({ email: 'kasipem@siddayu.org', password: 'password', })
  const [loading, setLoading] = useState(false)
  const handleForm = ({ key, value }) => {

    setform({ ...form, [key]: value })
  }

  const handleLogin = () => {
    // setLoading(true)
    APILogin.login(form).then(res => {
      // setLoading(false)
      dispatch(handleAuth({ authToken: res.access_token, user: res.data }))
      toast.show('Login Success', { type: 'success', placement: 'top', duration: 3000 })
      navigation.navigate('Management', { screen: 'HomeManagement' })
    }).catch((err) => console.log(err))
  }

  useEffect(() => {


    return () => {
      setform({ email: '', password: '' })
    }
  }, [])


  return (
    <Container styles={{ justifyContent: 'center' }} >

      <Text h3 h3Style={{ color: colors.primary, marginBottom: 10, textAlign: 'center' }} >Siddayu</Text>
      <View  >
        <FzTextInput placeholder='Email' onChangeText={(value) => (handleForm({ key: 'email', value: value }))} />
        <Gap height={8} />
        <FzTextInput placeholder='Password' secureTextEntry={true} onChangeText={(value) => (handleForm({ key: 'password', value: value }))} />
        <Button size='sm' onPress={handleLogin} buttonStyle={{ backgroundColor: colors.primary, marginTop: 20 }} >Login</Button>
        {/* <TouchableOpacity onPress={() => handleLogin()} style={{ backgroundColor: colors.primary, marginTop: 8, padding: 8, borderRadius: 5 }} ><Text style={{ color: 'white', textAlign: 'center' }} >Login</Text></TouchableOpacity> */}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '100%',
    // margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: 'gray'
  },
});

export default Login;