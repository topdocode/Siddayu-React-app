import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Select } from '@mobile-reality/react-native-select-pro'

const DropdownPro = ({ selected, data, multiple = false, searchable = false, handleDropdown, placeholderText = 'select', page = '' }) => {
    const [newData, setNewData] = useState(data)
    const [loading, setLoading] = useState(true)
    useEffect(() => {

        const hasLabelKey = data.some(item => Object.keys(item).includes('label'));
        if (hasLabelKey) {
            setLoading(false)
        } else {
            const insertData = data.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                }
            })

            setNewData(insertData)
            setLoading(false)
        }
        return () => {

        }
    }, [])


    const handleSelected = (item) => {
        if (multiple) {
            const newData = selected;
            if (!newData.includes(item.value)) {
                newData.push(item.value)
                handleDropdown(newData);
            }
        } else {
            handleDropdown(item.value, item.label);
        }
    }

    const handleRemoveSelected = (item) => {

        if (multiple) {
            const newData = selected;
            const index = newData.indexOf(item.value);

            if (index !== -1) {
                newData.splice(index, 1)
            }

            handleDropdown(newData)
        } else {
            handleDropdown(null)
        }

    }
    if (loading == false) {

        return (

            <View style={{ minWidth: 200 }} >
                <Select
                    options={newData}
                    styles={page == '' ? stylesSelect : stylesSelectInSeeting}
                    searchable={searchable}
                    multiple={multiple}
                    onSelect={(item, index) => handleSelected(item)}
                    onRemove={(item, index) => handleRemoveSelected(item)}
                    defaultOption={selected}
                    placeholderText={placeholderText}
                    scrollToSelectedOption={false}
                />
            </View>
        )
    }
}


const stylesSelect = StyleSheet.create({
    select: {
        // container: {
        //     borderWidth: 1,
        //     borderColor: '#999',
        //     borderRadius: 5,
        //     padding: 0,
        //     height: 25,
        // },
        // text: {
        //     fontSize: 12,
        //     color: 'black',
        //     // backgroundColor: 'red',
        //     margin: 0,
        //     padding: 0
        // },
        // multiSelectedOption: {
        //     container: {
        //         backgroundColor: 'white',
        //         borderRadius: 5,
        //         padding: 5,
        //         marginRight: 5,
        //     },
        //     text: {
        //         color: 'black',
        //         margin: 0,
        //         padding: 0
        //         // fontWeight: 'bold',
        //     },
        //     pressed: {
        //         backgroundColor: 'white',
        //     },

        // },
        // optionsList: {
        //     backgroundColor: 'red'
        // },
        // options: {
        //     container: {
        //         backgroundColor: "red"
        //     }
        // },
        // select: {
        //     arrow: {
        //         icon: {
        //             backgroundColor: 'red'
        //         }
        //     }
        // }
    }
});

const stylesSelectInSeeting = StyleSheet.create({
    select: {
        container: {
            borderWidth: 1,
            borderColor: '#999',
            borderRadius: 5,
            padding: 0,
            height: 25,
            width: 130,
        },
        text: {
            fontSize: 12,
            color: 'black',
            // backgroundColor: 'red',
            margin: 0,
            padding: 0
        },
        multiSelectedOption: {
            container: {
                backgroundColor: 'white',
                borderRadius: 5,
                padding: 5,
                marginRight: 5,
            },
            text: {
                color: 'black',
                margin: 0,
                padding: 0
                // fontWeight: 'bold',
            },
            pressed: {
                backgroundColor: 'white',
            },
        },

    }
});

export default DropdownPro