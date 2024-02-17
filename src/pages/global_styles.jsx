// styles.js
import { Dimensions, StyleSheet } from "react-native";
import { colors } from "../utils/color";

export const global_styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  column: {
    display: 'flex',
    // alignItems: 'center'
  },

  text: {
    fontWeight: 'normal',
    fontFamily: 'Blinker-SemiBold',
    verticalAlign: 'middle'
  },

  text2: {
    fontWeight: 'normal',
    verticalAlign: 'middle'
    // fontFamily: 'Blinker-Light'
  },

  input: {
    // backgroundColor: 'red',
  },

  button: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    borderRadius: 5
  },

  cardGrid: (numColumns) => ({
    width: '100%',
    backgroundColor: 'transparent ',
    alignItems: 'center',
    // justifyContent: 'flex-start',
    flex: 1,
    margin: 5,
    // height: (Dimensions.get('window').width / numColumns) - 20,
  }),

  hiddenGrid: {
    borderWidth: 0,
    shadowColor: 'transparent'
  },

  timeStamp: {
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 100,
    padding: 4,
    borderRadius: 10,
    bottom: 10,
    right: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  loading: {
    width: 50, height: 50,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },



  // sidebar style
  containerSideBar: (slideAnimation) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 98,
    backgroundColor: 'transparent',
    transform: [{ translateX: slideAnimation }]
  }),

  sideBarAnimation: (slideAnimation) => ({
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 98,
    backgroundColor: colors.bgSideBar,
    width: '60%',
    height: '100%',
    // transform: [{ translateX: slideAnimation }]
  }),

  textBadge: (color = 'rgb(25, 118, 210)') => ({
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 4,
    borderRadius: 30,
    color: color
  }),
});
