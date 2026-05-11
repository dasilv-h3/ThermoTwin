import { Image, type ImageContentFit, type ImageProps } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export type OptimizedImageProps = Omit<ImageProps, 'source' | 'contentFit'> & {
  source: ImageProps['source'];
  placeholder?: ImageProps['placeholder'];
  contentFit?: ImageContentFit;
  aspectRatio?: number;
  rounded?: number;
  wrapperStyle?: StyleProp<ViewStyle>;
};

const TINY_BLUR_HASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export default function OptimizedImage({
  source,
  placeholder,
  contentFit = 'cover',
  aspectRatio = 1,
  rounded,
  wrapperStyle,
  accessibilityLabel,
  ...rest
}: OptimizedImageProps) {
  return (
    <View
      style={[
        styles.wrapper,
        { aspectRatio, borderRadius: rounded ?? 0, overflow: 'hidden' },
        wrapperStyle,
      ]}
    >
      <Image
        source={source}
        placeholder={placeholder ?? TINY_BLUR_HASH}
        contentFit={contentFit}
        transition={180}
        cachePolicy="memory-disk"
        recyclingKey={
          typeof source === 'object' && source && 'uri' in source ? source.uri : undefined
        }
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        style={styles.image}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  image: { width: '100%', height: '100%' },
});
