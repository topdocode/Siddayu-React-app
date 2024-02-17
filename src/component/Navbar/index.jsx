import React from 'react'
import { useSelector } from 'react-redux'
import { View, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Text } from '@rneui/themed';
import Icon from 'react-native-vector-icons/dist/Entypo';
function Navbar({ handleSideBar, openSideBar, toggleSideBar }) {
  const { user } = useSelector((state) => state.auth)
  const route = useRoute();
  const navigation = useNavigation();
  return (

    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingRight: 20, paddingTop: 25, paddingBottom: 20, paddingLeft: 20 }} >
      <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: '100%' }} >
        <TouchableOpacity style={{}} onPress={toggleSideBar} >
          {/* <Text style={{ color: 'black', fontSize: 36 }} >...</Text> */}
          <Icon
            size={30}
            color='black'
            name='menu' />
        </TouchableOpacity>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10, }} >
          {route.name != 'homeDashboard' &&
            <TouchableOpacity onPress={() => navigation.goBack()} >
              <Icon
                name="chevron-thin-left"
                size={20}
              />
            </TouchableOpacity>
          }
          <View>
            {/* <Text style={{ color: 'black', fontSize: 14 }} >Hello,</Text> */}
            <Text style={{ color: 'black', fontSize: 20 }} >{user.name}</Text>
          </View>
        </View>

      </View>
    </View>
  )
}

export default Navbar
