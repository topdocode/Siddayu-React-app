import { Tab } from '@rneui/themed';
import React, { useState } from 'react';
import Layout from '../../../component/layout/Layout';
import { colors } from '../../../utils/color';
import Project from './Project';
import { Text, Touchable, TouchableOpacity, View } from 'react-native';
import Location from './Project/Location';



const ProjectCrm = () => {
    const PROJECT = 'project';
    const LOCATION = 'location';
    const [selectTab, setSelectTab] = useState('project');


    return (
        <Layout>
            {/* <Tab value={index} onChange={setIndex} dense indicatorStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ color: colors.textColor }}>
                <Tab.Item>Projects</Tab.Item>
                <Tab.Item>Locations</Tab.Item>
            </Tab> */}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: 5 }} >
                <TouchableOpacity onPress={() => setSelectTab(PROJECT)} style={{ borderBottomWidth: 1, flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomColor: selectTab == PROJECT ? colors.buttonColorSecond : 'black', paddingVertical: 2 }} >
                    <Text style={{ fontSize: 20, fontWeight: selectTab == PROJECT ? "bold" : '400', color: selectTab == PROJECT ? colors.textColorSecond : 'black' }} >
                        Project
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectTab(LOCATION)} style={{ borderBottomWidth: 1, flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomColor: selectTab == LOCATION ? colors.buttonColorSecond : 'black', paddingVertical: 2 }} >
                    <Text style={{ fontSize: 20, fontWeight: selectTab == LOCATION ? "bold" : '400', color: selectTab == LOCATION ? colors.textColorSecond : 'black' }} >
                        Location
                    </Text>
                </TouchableOpacity>
            </View>
            {selectTab == 'project' && (
                <Project />
            )}

            {selectTab == 'location' && (
                <Location />
            )}

        </Layout>
    )
}



export default ProjectCrm