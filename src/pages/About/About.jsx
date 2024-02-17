import { Text } from '@rneui/themed';
import React from 'react';
import { Image, View } from 'react-native';
import Gap from '../../component/Gap/Gap';
import Row from '../../component/Row/Row';
import Layout from '../../component/layout/Layout';
import { global_styles } from '../global_styles';
import { VERSION } from "@env";
const About = () => {
    return (
        <Layout color='white' backgroundImage={false}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }} >
                <Row >
                    <Text h3 h3Style={global_styles.text}>BZ</Text>
                    <Gap width={0} />
                    <Text h3 h3Style={global_styles.text2} >Publish</Text>
                </Row>
                <Text>{`Version ${VERSION}`}</Text>
                <Gap height={10} />
                <View style={[{ width: 80, height: 80, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }, global_styles.shadow]} >
                    <Image source={require('../../assets/bz.png')} style={[{ borderRadius: 100, width: 80, height: 80, },]} />
                </View>
                <Gap height={10} />
                <Text h3 h3Style={{ fontSize: 14 }}  >2023 BZ Publish Inc.</Text>
                <Gap height={10} />
                <Text h3 h3Style={{ fontSize: 14 }}>indonesia@baezeni.com</Text>
                <Gap height={10} />
                <View style={{ paddingHorizontal: 20, }} >
                    <Text  >
                        By using the "bz publish" app, you agree to follow these simple rules: Use it for legal purposes, protect your account info, respect privacy and security, keep your app updated, and don't misuse it. We may terminate access if you violate these rules and you agree to indemnify us for any issues. If you have questions, contact us at indonesia@baezeni.com. Thanks for using "bz publish"!
                    </Text>
                </View>
                <Gap height={100} />
            </View>
        </Layout >
    )
}

export default About