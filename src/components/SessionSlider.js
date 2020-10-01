import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  block,
  debug,
  stopClock,
  call,
  Clock,
  Value,
  timing,
  cond,
  set,
  useCode,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import {useMemoOne} from 'use-memo-one';

import SongTypeButton from './SongTypeButton';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

// Carousel
import Carousel, {getInputRangeFromIndexes} from 'react-native-snap-carousel';

// Fade in/out functions (must stay outside component or "animation has already ran before")
const labelFadeOut = animatedValue =>
  Animated.timing(animatedValue, {
    duration: 120,
    toValue: 0,
    easing: Easing.linear,
  });
const labelFadeIn = animatedValue =>
  Animated.timing(animatedValue, {
    duration: 120,
    toValue: 1,
    easing: Easing.linear,
  });

const SessionSlider = ({animateDown = false, style, setOptionsShown}) => {
  // state
  const [buttonLabelIndex, setButtonLabelIndex] = React.useState('1');

  // animated values and functions
  const {buttonLabelOpacityVal, yPositionVal} = useMemoOne(
    () => ({
      buttonLabelOpacityVal: new Animated.Value(1),
      yPositionVal: new Animated.Value(hp(100)),
    }),
    [],
  );

  // slide up when mounted effect
  React.useEffect(() => {
    timing(yPositionVal, {
      duration: 400,
      toValue: hp(70),
      easing: Easing.sin,
    }).start();
  }, []);

  // slide down when animateDown === true
  React.useEffect(() => {
    if (animateDown) {
      timing(yPositionVal, {
        duration: 400,
        toValue: hp(100),
        easing: Easing.sin,
      }).start();
    }
  }, [animateDown]);

  return (
    <Animated.View
      style={
        ([
          {
            // position: 'absolute',
            // top: yPositionVal,
            width: wp(100),
            height: hp(16),
            // borderWidth: 2,
          },
        ],
        style)
      }>
      <Carousel
        containerCustomStyle={{zIndex: 10}}
        data={[{type: 'hero'}, {type: 'rise'}]}
        inactiveSlideScale={0.7}
        renderItem={({item, index}) => {
          return <SongTypeButton type={item.type} />;
        }}
        itemWidth={wp(28)}
        sliderWidth={wp(100)}
        onSnapToItem={slideIndex => {
          setOptionsShown(slideIndex === 0 ? 'hero' : 'rise');
          labelFadeOut(buttonLabelOpacityVal).start(({finished}) => {
            if (finished) {
              setButtonLabelIndex(`${slideIndex + 1}`);
              labelFadeIn(buttonLabelOpacityVal).start();
            }
          });
        }}
      />

      {/* <Animated.Text
        style={{
          opacity: buttonLabelOpacityVal,
          alignSelf: 'center',
          fontFamily: 'Lato-Bold',
          fontSize: wp(5.2),
          color: '#25919E',
        }}> */}
      {/* {sessionType} {buttonLabelIndex} */}
      {/* {buttonLabel} */}
      {/* </Animated.Text> */}

      <LottieView
        style={{
          width: wp(62),
          position: 'absolute',
          zIndex: 7,
          left: wp(9),
          top: hp(-4),
        }}
        autoPlay
        loop
        source={require('../assets/animations/ring_fire.json')}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({});

export default SessionSlider;