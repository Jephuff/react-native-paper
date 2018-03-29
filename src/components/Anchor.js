/* @flow */

import * as React from 'react';

import ReactNative, { Dimensions, UIManager, View } from 'react-native';

import Portal from './Portal/Portal';

export const VerticalAlignment = {
  CENTER: 0x1,
  TOP_TO_TOP: 0x2,
  TOP_TO_BOTTOM: 0x3,
  BOTTOM_TO_BOTTOM: 0x4,
  BOTTOM_TO_TOP: 0x5,
};

export const HorizontalAlignment = {
  CENTER: 0x11,
  LEFT_TO_LEFT: 0x12,
  LEFT_TO_RIGHT: 0x13,
  RIGHT_TO_RIGHT: 0x14,
  RIGHT_TO_LEFT: 0x15,
};

type VPosition = {| top: number |} | {| bottom: number |};
type HPosition = {| left: number |} | {| right: number |};

type Props = {
  anchorTo: React.Node,
  vAlign: $Values<typeof VerticalAlignment>,
  hAlign: $Values<typeof HorizontalAlignment>,
  children: React.Node,
};

type Measure = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type State = {
  anchorDimensions: ?Measure,
};

export default class Anchor extends React.Component<Props, State> {
  state = { anchorDimensions: null };

  componentDidMount() {
    this.updateAnchorDimensions(this.props.anchorTo);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.anchorTo !== nextProps.anchorTo) {
      this.updateAnchorDimensions(nextProps.anchorTo);
    }
  }

  updateAnchorDimensions(anchorElement: React.Node) {
    const node = ReactNative.findNodeHandle(anchorElement);
    UIManager.measureInWindow(node, (x, y, width, height) => {
      this.setState({ anchorDimensions: { x, y, width, height } });
    });
  }

  getVPosition(anchorDimensions: Measure): VPosition {
    const { y: anchorY, height: anchorHeight } = anchorDimensions;
    switch (this.props.vAlign) {
      case VerticalAlignment.TOP_TO_TOP:
        return { top: anchorY };
      case VerticalAlignment.TOP_TO_BOTTOM:
        return { top: anchorY + anchorHeight };
      case VerticalAlignment.BOTTOM_TO_TOP:
        return { bottom: Dimensions.get('window').height - anchorY };
      case VerticalAlignment.BOTTOM_TO_BOTTOM:
        return {
          bottom: Dimensions.get('window').height - (anchorY + anchorHeight),
        };
      default:
        return { top: 0 };
    }
  }

  getHPosition(anchorDimensions: Measure): HPosition {
    const { x: anchorX, width: anchorWidth } = anchorDimensions;
    switch (this.props.hAlign) {
      case HorizontalAlignment.LEFT_TO_LEFT:
        return { left: anchorX };
      case HorizontalAlignment.LEFT_TO_RIGHT:
        return { left: anchorX + anchorWidth };
      case HorizontalAlignment.RIGHT_TO_LEFT:
        return { right: Dimensions.get('window').width - anchorX };
      case HorizontalAlignment.RIGHT_TO_RIGHT:
        return {
          right: Dimensions.get('window').width - (anchorX + anchorWidth),
        };
      default:
        return { left: 0 };
    }
  }

  render() {
    const { children } = this.props;
    const { anchorDimensions } = this.state;

    if (anchorDimensions) {
      const vPosition = this.getVPosition(anchorDimensions);
      const hPosition = this.getHPosition(anchorDimensions);

      const style = {
        position: 'absolute',
        ...vPosition,
        ...hPosition,
      };

      return (
        <Portal>
          <View style={style}>{children}</View>
        </Portal>
      );
    }
    return null;
  }
}
