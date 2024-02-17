import { View, Text } from 'react-native'
import React from 'react'
import { Box, CloseIcon, FavouriteIcon, Icon, MoonIcon, PlayIcon, ThreeDotsIcon } from 'native-base'
import { TouchableOpacity } from 'react-native-gesture-handler'

const BottomTab = ({handleLogout}) => {
  return (
    <Box h={75} bgColor='green.500' alignItems='center' justifyContent='center' flexDirection='row' borderTopRadius={50}>
        <Box flex={1} alignItems='center' justifyContent='center' >
            <PlayIcon color='white' size={5} />
        </Box>
        <Box flex={1} alignItems='center' justifyContent='center' >
            <FavouriteIcon color='white' size={5} />
        </Box>
        <Box flex={1} alignItems='center' justifyContent='center' >
            <MoonIcon color='white' size={5} />
        </Box>
        <Box flex={1} alignItems='center' justifyContent='center'>
            <TouchableOpacity onPress={handleLogout} >
                <CloseIcon color='white' size={5}  />
            </TouchableOpacity>
        </Box>
    </Box>
  )
}

export default BottomTab