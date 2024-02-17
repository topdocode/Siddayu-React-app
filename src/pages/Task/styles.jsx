import { StyleSheet } from "react-native";
import { colors } from "../../utils/color";
export const styles = StyleSheet.create({
    textTitle: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Blinker-SemiBold'
    },
    layoutColumn: {
        paddingHorizontal: 20,
        marginBottom: 5
    },
    layoutView: {
        backgroundColor: 'white',
        width: 284,
        display: 'flex',
        padding: 16,
        alignItems: "center",
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,

        elevation: 5,
        position: 'relative'
    },
    imageTask: {
        width: '100%',
        height: '100%',
        resizeMode: "cover",
        maxHeight: 200
    },
    activeTab: {
        borderBottomColor: colors.borderColorSecond,
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    tab: {
        // gaya untuk tab yang tidak aktif
    },
    activeTabText: {
        color: colors.textColorSecond,
        // fontWeight: 'bold',
        fontSize: 16
    },
    tabText: {
        fontSize: 16
        // gaya untuk teks pada tab yang tidak aktif
    },

    textItemDialog: {
        fontSize: 12
    },

    createTask: {
        backgroundColor: 'white',
        width: '80%',
        // maxHeight: '30%',
        borderRadius: 5,
        padding: 20
    },

    createTaskInput: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#e5e7eb', paddingHorizontal: 20,
        maxHeight: 100
    },

    textBadge: (color = 'rgb(25, 118, 210)') => ({
        fontSize: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 4,
        borderRadius: 30,
        color: color
    }),

    // table
    borderStyleTabel: { borderWidth: 1, borderColor: '#e5e7eb', },
    head: {},
    wrapper: { flexDirection: 'row', },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: { height: 28 },
    textTabel: {
        color: 'black',
        margin: 3,
        fontSize: 12,
    },
    tableMargin: {
        marginHorizontal: 3,
        marginVertical: 2
    },

    tableStyleItem: {
        marginHorizontal: 3,
        marginVertical: 2,
        fontSize: 12
    },

    tableCellCustome: (width, lenght, index) => ({
        width: width, borderColor: '#e5e7eb', paddingHorizontal: 2,
    }),

    textInputStyle: (fontSize = 12) => ({
        fontSize: fontSize, fontWeight: '400', borderWidth: 1, padding: 4, borderColor: '#dedede', borderRadius: 2, paddingHorizontal: 10, backgroundColor: 'white'
    })
})