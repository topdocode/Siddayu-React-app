import { View, Text, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import Layout from '../../../../component/layout/Layout'
import Gap from '../../../../component/Gap/Gap'
import DropdownPro from '../../../../component/Dropdown/DropdownPro'
import { useSelector } from 'react-redux'
import ProjectCrmService from '../../../../services/CRM/Project'
import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import TextInputCustom from '../../../../component/TextInputCustom/TextInputCustom'

const ProjectAddCrm = ({ navigation }) => {
    const { authToken, user } = useSelector((state) => state.auth);
    const [country, setCountry] = useState([{}])
    const [name, setName] = useState('')
    const [selectCountry, setSelectCountry] = useState({})
    const [businessUnit, setBusinessUnit] = useState([{}])
    const [selectBusinessUnit, setSelectBusinessUnit] = useState({})
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({})
    useEffect(() => {

        Promise.all([
            ProjectCrmService.getCountry(authToken, navigation),
            ProjectCrmService.businessUnit(authToken, user?.client?.id, navigation),
            ProjectCrmService.projectProfile(authToken, user?.client?.id, navigation)
        ])
            .then(([country, businessUnit, projectProfile]) => {
                console.log({ projectProfile });
                const dataCountry = country?.results?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });
                setCountry(dataCountry);

                // busniess unit
                const dataBusinessUnit = businessUnit?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });
                setBusinessUnit(dataBusinessUnit)
                setLoading(false)
            })

        return () => {

        }
    }, [])


    const handleSelectCountry = (res) => {
        // setCountry(res)
        const valueCountry = country.find(item => item.value == res)
        setSelectCountry(valueCountry)
    }

    const handleBusinessUnit = (res) => {
        const valueBusinessUnit = businessUnit.find(item => item.value == res)
        setBusinessUnit(valueBusinessUnit)
    }

    const handleForm = (key, value) => {
        setForm({ ...form, [key]: value })
    }


    return (
        <Layout>
            <SelectProvider>
                {loading == false && (
                    <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 20 }} >
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 10 }} >
                            <TextInputCustom.TextInput title={'Name'} value={form?.name} onChangeText={value => handleForm('name', value)} />
                            <Gap height={8} />
                            <TextInputCustom.Title title={'Location'} />
                            <DropdownPro searchable={true} data={country} selected={selectCountry} handleDropdown={handleSelectCountry} />
                            <Gap height={8} />
                            <TextInputCustom.Title title={'Business Unit'} />
                            <DropdownPro searchable={true} data={businessUnit} selected={selectBusinessUnit} handleDropdown={handleBusinessUnit} />

                        </View>
                    </View>
                )}
            </SelectProvider>

        </Layout>
    )
}

export default ProjectAddCrm