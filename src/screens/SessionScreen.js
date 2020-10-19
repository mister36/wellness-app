import React, {Suspense} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  StatusBar,
  FlatList,
  InteractionManager,
  // ScrollView,
} from 'react-native';

// Permission
import {requestStoragePermission} from '../utils/permissions';

// Motion
import Animated, {
  Easing,
  Clock,
  Value,
  set,
  cond,
  startClock,
  // clockRunning,
  timing,
  // debug,
  stopClock,
  block,
  // not,
  // spring,
  // divide,
  // diff,
  // greaterThan,
  useCode,
  // sub,
  // add,
  // eq,
  // call,
  interpolate,
} from 'react-native-reanimated';

// Components
import SessionAnimation from '../components/SessionAnimation';
import WaveForm from '../components/Waveform';
import StopSessionButton from '../components/StopSessionButton';
import SessionSlider from '../components/SessionSlider';
import SessionWheelPicker from '../components/SessionWheelPicker';
import TimeLeftCircle from '../components/TimeLeftCircle';
import SessionNav from '../components/SessionNav';
import PeriLogo from '../components/PeriLogo';

// Store
import shallow from 'zustand/shallow';
import {useSessionStore} from '../zustand/store';

// Checking storage
import AsyncStorage from '@react-native-community/async-storage';
import date from 'date-and-time';

// Caching animations
import {useMemoOne} from 'use-memo-one';

// Redash
import {loop, delay, timing as timingDash, useValue} from 'react-native-redash';

// Icons
import Foundation from 'react-native-vector-icons/Foundation';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// import {Picker, PickerIOS} from '@react-native-community/picker';

// console.log('picker; ', PickerIOS);

// Circle list
import CircleList from 'react-native-circle-list';

// Styling
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

// Lottie animations
import LottieView from 'lottie-react-native';

// Sound
import Video from 'react-native-video';

// Utils
import {decToMin} from '../utils/getStats';
import SongTypeButton from '../components/SongTypeButton';
// import SongContainer from '../components/SongContainer';

// Dancing flame animation
const dancingFlame = require('../assets/animations/dancing_flame.json');

const whooshSound = require('../assets/sound/whoosh.mp3');

// used for any simple animations
const animConstructorFunc = (node, endVal, duration, easing = Easing.linear) =>
  timing(node, {
    duration,
    toValue: endVal,
    easing,
  });

// Rendering SongContainer lazily
const SongContainer = React.lazy(() => import('../components/SongContainer'));

const SessionScreen = ({navigation}) => {
  // console.log('SESSION SCREEN RENDERED');
  // store
  const [
    sessionPlaying,
    sessionPaused,
    shouldSessionRun,
    shouldSessionPause,
    // getReadyForSessionUI,
  ] = useSessionStore(
    state => [
      state.sessionPlaying,
      state.sessionPaused,
      state.shouldSessionRun,
      state.shouldSessionPause,
      // state.getReadyForSessionUI,
    ],
    shallow,
  );

  // State
  const [completed, setCompleted] = React.useState(-1);
  const [userTapped, setUserTapped] = React.useState(false);
  const [buttonVisible, setButtonVisible] = React.useState(true);
  const [
    animateSliderAndPickerAway,
    setAnimateSliderAndPickerAway,
  ] = React.useState(false);
  const [animateSongContainerUp, setAnimateSongContainerUp] = React.useState(
    false,
  );

  const [sessionSliderShowing, setSessionSliderShowing] = React.useState(false);

  // Refs
  const shineRef = React.useRef('shineRef'); // shine animation

  // Timer function
  const callAfterXMs = (callback, timeout) => {
    setTimeout(() => {
      callback();
    }, timeout);
  };

  // Ask for access to storage if user is new
  React.useEffect(() => {
    const checkIfNewUser = async () => {
      try {
        const externalStoragePermission = await AsyncStorage.getItem(
          'external_storage_permission',
        );

        if (!externalStoragePermission) {
          await requestStoragePermission();
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkIfNewUser();
  }, []);

  // Checks to see whether the screen should remove all pre-session objects
  // REMEMBER: BUTTON STILL BEING SHOWN, FIX THIS
  React.useEffect(
    () =>
      useSessionStore.subscribe(
        getReadyForSessionUI => {
          if (getReadyForSessionUI) {
            setAnimateSongContainerUp(true);
            animConstructorFunc(buttonTranslateXVal, 1, 400).start(() => {
              setSessionSliderShowing(false);
              setButtonVisible(false);
              shouldSessionRun(true);
            });
          }
        },
        state => state.getReadyForSessionUI,
      ),
    [],
  );

  // Animated background
  const animatedBackground = require('../assets/animations/session_background.json');

  // pulse for button pulse, headerSlideVal for sliding header, linearSlideVal for disappearing linear gradient, periLogoScaleVal for the scale increase of logo during session
  const {
    pulse,
    headerSlideVal,
    buttonTranslateYVal,
    buttonTranslateXVal,
    buttonShrinkVal,
    buttonScaleVal,
    buttonOpacityVal,
    periLogoScaleVal,
    periLogoOpacityVal,
    periLogoBounceVal,
    animatedBackgroundOpacity,
  } = useMemoOne(
    () => ({
      pulse: new Value(0),
      headerSlideVal: new Value(0),
      buttonTranslateYVal: new Value(0),
      buttonTranslateXVal: new Value(0),
      buttonShrinkVal: new Value(1),
      buttonScaleVal: new Value(1),
      buttonOpacityVal: new Value(1),
      periLogoScaleVal: new Value(1),
      periLogoOpacityVal: new Value(0.5),
      periLogoBounceVal: new Value(0),
      animatedBackgroundOpacity: new Value(0),
    }),
    [],
  );

  // !Code needed for button pulse effect
  useCode(
    () =>
      set(
        pulse,
        loop({
          clock: new Clock(),
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          boomerang: true,
          autoStart: true,
        }),
      ),
    [pulse],
  );

  // Header slide animation
  const headerSlideAnim = timing(headerSlideVal, {
    duration: 200,
    toValue: new Value(1),
    easing: Easing.linear,
  });

  // Main button shrink animation
  const buttonShrinkAnim = timing(buttonShrinkVal, {
    duration: 300,
    toValue: new Value(0.6),
    easing: Easing.linear,
  });

  // Main button fade out animation
  const buttonFadeOutAnim = timing(buttonOpacityVal, {
    duration: 400,
    toValue: 0,
    easing: Easing.linear,
  });

  // Peri logo bounce effect
  useCode(
    () =>
      set(
        periLogoBounceVal,
        loop({
          clock: new Clock(),
          duration: 700,
          easing: Easing.linear,
          boomerang: true,
        }),
      ),
    [periLogoBounceVal],
  );

  // Animated background fade in
  const runAnimatedBackgroundFade = () => {
    const clock = new Clock();

    const state = {
      finished: new Value(0),
      position: animatedBackgroundOpacity,
      time: new Value(0),
      frameTime: new Value(0),
    };

    const config = {
      duration: new Value(800),
      toValue: new Value(1),
      easing: Easing.inOut(Easing.linear),
    };

    return block([
      startClock(clock),
      timing(clock, state, config),
      state.position,
    ]);
  };

  // Bottom header flip animation
  const runHeaderAnim = () => {
    const clock = new Clock();

    const state = {
      finished: new Value(0),
      position: new Value(0),
      time: new Value(0),
      frameTime: new Value(0),
    };

    const config = {
      duration: new Value(8000),
      toValue: new Value(1),
      easing: Easing.inOut(Easing.linear),
    };

    return block([
      startClock(clock),

      timing(clock, state, config),

      cond(state.finished, [
        stopClock(clock),

        set(state.finished, 0),

        set(state.position, 0),

        set(state.time, 0),
        set(state.frameTime, 0),

        startClock(clock),
      ]),
      state.position,
    ]);
  };
  const headerPosition = runHeaderAnim();

  // PeriLogo scale increase animation
  const periLogoScaleAnim = timing(periLogoScaleVal, {
    duration: 300,
    toValue: new Value(1.2),
    easing: Easing.linear,
  });

  return (
    <Animated.View style={[styles.mainContainer]}>
      <StatusBar backgroundColor="black" />
      {/* //!Animated background when session is playing */}
      {/* {sessionPlaying ? (
        <Animated.View
          style={[
            styles.animatedBackground,
            {opacity: runAnimatedBackgroundFade()},
          ]}>
          <LottieView
            source={animatedBackground}
            autoPlay
            speed={2.5}
            style={{height: hp(100)}}
          />
        </Animated.View>
      ) : null} */}

      {/* //! Linear Gradient background when session isn't playing */}
      <LinearGradient
        colors={['#E26452', '#F59C75']}
        end={{x: 0.5, y: 1}}
        style={[styles.preSessionGradientContainer]}>
        <SessionNav navigation={navigation} />
        {/* //!Dancing flame */}
        {/* {userTapped ? (
          <LottieView
            source={dancingFlame}
            autoPlay
            loop={false}
            duration={1000}
            style={styles.dancingFlame}
            onAnimationFinish={() => {
              setUserTapped(false);
              buttonShrinkAnim.start(data => {
                if (data.finished) {
                  shouldSessionRun();
                  periLogoScaleAnim.start();
                }
              });
            }}
          />
        ) : null} */}
        {/* //!Dancing flame sound */}
        {/* {userTapped ? (
          <Video source={whooshSound} audioOnly rate={1.5} />
        ) : null} */}

        {sessionSliderShowing ? (
          <>
            <Suspense fallback={<Text style={{fontSize: 30}} />}>
              <SongContainer animateUp={animateSongContainerUp} />

              {/* <SessionSlider
              style={{position: 'absolute', bottom: hp(15)}}
              animateDown={animateSliderAndPickerAway}
            /> */}
            </Suspense>
          </>
        ) : null}

        {/* Image that shows during session */}
        {sessionPlaying ? (
          <PeriLogo style={{position: 'absolute', top: hp(28)}} />
        ) : null}

        {/* //! View that contains button and image hiding underneath */}
        <Animated.View
          style={[
            styles.centerContentContainer,
            {
              transform: [
                {
                  translateY: buttonTranslateYVal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, hp(28)],
                  }),
                  translateX: buttonTranslateXVal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -wp(100)],
                  }),
                },
              ],
            },
          ]}>
          {/* shine animation when button is clicked every odd time */}
          <LottieView
            source={require('../assets/animations/shine.json')}
            loop={false}
            ref={shineRef}
            style={{
              zIndex: 10,
              elevation: 10,
              width: wp(65),
              position: 'absolute',
            }}
          />
          {buttonVisible ? (
            // !Big Button
            <Animated.View
              style={[
                styles.bigButtonContainer,
                {
                  // backgroundColor: 'green',
                  opacity: buttonOpacityVal,
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}>
              <Pressable
                onPress={() => {
                  if (!sessionSliderShowing) {
                    shineRef.current.play();
                    animConstructorFunc(buttonTranslateYVal, 1, 300).start();
                    setAnimateSongContainerUp(false);
                    setSessionSliderShowing(true);
                  } else if (sessionSliderShowing) {
                    animConstructorFunc(buttonTranslateYVal, 0, 300).start();
                    setAnimateSongContainerUp(true);

                    callAfterXMs(() => {
                      setSessionSliderShowing(false);
                    }, 600);
                  }
                }}
                style={[styles.bigButton]}>
                <Image
                  source={require('../assets/images/white-logo.png')}
                  style={styles.logo}
                />
              </Pressable>
            </Animated.View>
          ) : null}

          {sessionPlaying ? (
            <TimeLeftCircle
              style={{position: 'absolute', alignSelf: 'center', top: hp(-2)}}
            />
          ) : null}
        </Animated.View>

        {/* {sessionPlaying ? (
          <>
            <WaveForm style={{position: 'absolute', top: hp(20), zIndex: 7}} />
          </>
        ) : null} */}

        {sessionPlaying && !sessionPaused ? <SessionAnimation /> : null}
        {/* <SessionAnimation /> */}

        {/* //! Pause and play button */}
        {sessionPlaying && !sessionPaused ? (
          <Foundation
            name="pause"
            style={styles.playPauseIcon}
            onPress={() => {
              shouldSessionPause(true);
            }}
          />
        ) : null}

        {sessionPlaying && sessionPaused ? (
          <Foundation
            name="play"
            style={styles.playPauseIcon}
            onPress={() => {
              shouldSessionPause(false);
            }}
          />
        ) : null}

        {/* //! Stop session button */}
        {sessionPlaying ? (
          <StopSessionButton style={styles.stopSessionButton} />
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: wp(100),
  },
  preSessionGradientContainer: {
    height: hp(100),
  },
  logo: {
    height: wp(44.545), // w:h = 6:7
    width: wp(38.182),
    alignSelf: 'center',
  },
  headerContainer: {
    position: 'absolute',
    bottom: hp(20),
    alignItems: 'center',
    alignSelf: 'center',
    height: hp(5),
    overflow: 'hidden',
    zIndex: 8.5,
  },
  header: {
    fontSize: wp(7),
    fontFamily: 'NunitoSans-Bold',
    color: 'white',
  },
  centerContentContainer: {
    // borderWidth: 2,
    position: 'absolute',
    top: hp(30),
    zIndex: 7.1,
    alignSelf: 'center',
    height: wp(65),
    width: wp(65),
    justifyContent: 'center',
    // backgroundColor: 'green',
  },
  bigButtonContainer: {
    // backgroundColor: '#DE5642',
    position: 'absolute',
    zIndex: 12,
    // height: wp(65),
    // width: wp(65),
    borderRadius: wp(32.5),
    elevation: 9,
    alignSelf: 'center',
    justifyContent: 'center',
    // zIndex: 10,
  },
  bigButton: {
    borderRadius: wp(30),
    justifyContent: 'center',
    // zIndex: 12,
    // elevation: 9,
    height: wp(60),
    width: wp(60),
    backgroundColor: '#DE5642',
    // borderWidth: 2,
    // elevation: 9,
  },
  selectorContainer: {
    height: hp(10),
    width: wp(80),
    // borderWidth: 1,
    position: 'absolute',
    bottom: hp(25),
    alignSelf: 'center',
  },
  selectionBox: {
    borderColor: '#FFFFFF',
    borderRadius: 5,
    // borderWidth: 2,
    width: wp(80),
    backgroundColor: 'rgba(255, 255, 255, .1)',
  },
  sessionOptions: {
    position: 'absolute',
    top: hp(70),
  },
  askToSelectText: {
    fontFamily: 'Lato-Black',
    fontSize: wp(6.5),
    marginTop: hp(1),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  wheelPickerContainer: {
    alignSelf: 'center',
    position: 'absolute',
    top: hp(10),
  },
  downIcon: {
    fontSize: wp(9),
    alignSelf: 'center',
    marginTop: hp(1),
    color: '#FFFFFF',
  },
  dancingFlame: {
    zIndex: 13,
    height: hp(50),
    position: 'absolute',
    top: hp(10),
    alignSelf: 'center',
  },
  playPauseIcon: {
    position: 'absolute',
    bottom: hp(15),
    fontSize: wp(25),
    alignSelf: 'center',
    color: '#FFFFFF',
    zIndex: 12,
  },
  stopSessionButton: {
    position: 'absolute',
    top: hp(18),
    alignSelf: 'flex-end',
    right: wp(5),
    zIndex: 13,
  },
  animatedBackground: {position: 'absolute', zIndex: 7, height: hp(100)},
});

export default SessionScreen;
