import { Button } from '@rneui/themed';
import React from 'react';
import Icon from 'react-native-vector-icons/dist/AntDesign';
const ButtonMedia = ({
    onPress
}) => {
    return (
        <Button size='sm' type='outline' titleStyle={{ fontSize: 12 }} onPress={onPress} >
            <Icon name='addfile' size={18} />
        </Button>
    )
}

export default ButtonMedia