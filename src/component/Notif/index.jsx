import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { resetNotif } from "../../redux/features/notifAlert/notifSlice";
import Gap from "../Gap/Gap";

const Notif = ({ message, status, handleNotif, style, onlyText = false }) => {
  const notif = useSelector((state) => state.notif);
  const dispatch = useDispatch();
  var color = 'black'
  switch (notif.status) {
    case 'error':
      color = '#FFB1A9'
      break;
    case 'success':
      color = '#96F3C6'
      break;
    case 'warning':
      color = '#FCE38E'
      break;
    default:
      break;
  }

  useEffect(() => {
    setTimeout(() => {
      if (notif.show) {
        dispatch(resetNotif());
      }
    }, 1000);
  }, [notif])

  if (notif.show) {

    if (onlyText == false) {
      return (
        <>
          <View style={[{ backgroundColor: color, width: '100%', opacity: 0.7, borderRadius: 1, display: 'flex', justifyContent: 'center', padding: 10 }, style]} >
            <Text style={{ fontSize: 12, color: 'black', fontWeight: 'bold' }}  >{notif.message}</Text>
          </View>
          <Gap height={10} />
        </>
      );
    }
    if (onlyText) {
      return (
        <>
          <View style={[{ backgroundColor: 'transparent', width: 'auto', borderRadius: 0, display: 'flex', justifyContent: 'flex-start', padding: 0 }, style]} >
            <Text style={{ fontSize: 12, color: color, fontWeight: 'bold' }}  >{notif.message}</Text>
          </View>
          <Gap height={10} />
        </>
      );
    }
  } else {
    return;
  }
};

export default Notif;
