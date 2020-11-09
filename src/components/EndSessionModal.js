import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import Modal from 'react-native-modal';

import {useSessionStore} from '../zustand/store';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import LottieView from 'lottie-react-native';

const EndSessionModal = ({shouldShowNow}) => {
  // if shouldShowNow, then will show modal
  //   useState(() => {
  //     if (shouldShowNow && !setModalVisible) {
  //       setModalVisible(true);
  //     }
  //   }, [shouldShowNow]);

  // store
  const [resetSessionUI, resetForNewSession] = useSessionStore(state => [
    state.resetSessionUI,
    state.resetForNewSession,
  ]);
  // state
  const [modalVisible, setModalVisible] = useState(true);
  return (
    <Modal
      style={{zIndex: 11}}
      isVisible={modalVisible}
      backdropOpacity={0.2}
      deviceHeight={hp(100)}
      onBackButtonPress={() => setModalVisible(false)}
      onBackdropPress={() => setModalVisible(false)}
      useNativeDriver
      onSwipeComplete={() => {
        // resetSessionUI();
        resetForNewSession();
        setModalVisible(false);
      }}
      swipeDirection="down"
      deviceWidth={wp(100)}>
      <LottieView
        source={require('../assets/animations/fireworks.json')}
        style={{
          width: wp(100),
          //   height: hp(50),
          position: 'absolute',
          zIndex: 10,
        }}
        loop
        autoPlay
      />
      <View style={styles.modalBox}>
        <Text style={styles.modalBoxHeader}>
          Congrats on completing a session!
        </Text>

        <Image
          source={require('../assets/images/splash_icon.png')}
          style={{
            width: wp(20),
            height: wp(23.4),
            alignSelf: 'center',
            marginTop: hp(5),
          }} // w:h = 100:117
        />
        <Text style={styles.modalBoxSubtext}>
          The feeling you just had? Keep that all day.
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBox: {
    height: hp(40),
    width: wp(80),
    backgroundColor: '#Ffffff',
    alignSelf: 'center',
    paddingLeft: wp(4),
    paddingRight: wp(4),
  },
  modalBoxHeader: {
    marginTop: hp(1),
    fontFamily: 'Lato-Black',
    fontSize: wp(6),
    textAlign: 'center',
  },
  modalBoxSubtext: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: wp(4),
    marginTop: hp(2),
  },
});

export default EndSessionModal;