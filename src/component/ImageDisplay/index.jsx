import React from 'react';
import { Platform } from 'react-native';
import { Image, Modal, Pressable, SafeAreaView, View } from 'react-native';
import Icon from 'react-native-vector-icons/dist/AntDesign';
const ImageDisplay = ({ source, showImage, setShowImage }) => {

    if (source) {

        return (

            <SafeAreaView>
            <Modal visible={showImage} animationType='slide'>
                <View style={{ flex: 1, position:'relative', backgroundColor:'white' }}>
                    <Pressable
                        style={{ position: 'absolute', top: Platform.OS ==='ios' ? 50 :10, right: 10, zIndex: 10 }}
                        onPress={() => setShowImage(false)}
                    >
                        <Icon name="closecircle" size={30} />
                    </Pressable>

                    {source != null && (
                        <Image
                            source={source}
                            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
        )
    }
}

export default ImageDisplay