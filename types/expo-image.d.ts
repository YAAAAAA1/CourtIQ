import { ComponentType } from 'react';
import { ImageProps as RNImageProps } from 'react-native';

declare module 'expo-image' {
  export interface ImageProps extends RNImageProps {
    // Add any specific expo-image props here
  }
  
  declare const Image: ComponentType<ImageProps>;
  export default Image;
}
