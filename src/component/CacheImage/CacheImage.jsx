import React from 'react';
import { Image, View } from 'react-native';
import shorthash from 'shorthash';
import RNFS from 'react-native-fs';

export default class CacheImage extends React.Component {
    state = {
        source: null,
    };

    componentDidMount = async () => {
        const { uri } = this.props;
        const name = shorthash.unique(uri);
        const path = `${RNFS.CachesDirectoryPath}/${name}`;
        const imageExists = await RNFS.exists(path);
        if (imageExists) {
            this.setState({
                source: {
                    uri: 'file://' + path,
                },
            });
            return;
        }
        const newImagePath = `${RNFS.CachesDirectoryPath}/${name}_new`;
        const downloadOptions = {
            fromUrl: uri,
            toFile: newImagePath,
        };
        try {
            await RNFS.downloadFile(downloadOptions).promise;
            await RNFS.moveFile(newImagePath, path);
            this.setState({
                source: {
                    uri: 'file://' + path,
                },
            });
        } catch (_) {
        }
    };

    render() {
        const { source } = this.state;
        return source ? <Image style={this.props.style} source={source} /> : <View />;
    }
}
