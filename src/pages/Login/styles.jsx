// styles.js
import { StyleSheet } from "react-native";
import { colors } from "../../utils/color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.bgColor
  },
  text: {
    fontSize: 16,
    color: "black",
  },

  h1_2: {
    fontWeight: '100',
    fontFamily: 'Blinker-Black'
  },

  input: {
    backgroundColor: 'red',
  }
});
