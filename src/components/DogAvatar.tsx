import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { theme } from '../theme';

// Accepts bundled assets today and { uri } sources when photos are added later.
export default function DogAvatar({ name, photo, size = 56 }: {
  name: string;
  photo?: ImageSourcePropType;
  size?: number;
}) {
  const [failedPhoto, setFailedPhoto] = useState<ImageSourcePropType>();
  const showPhoto = photo !== undefined && photo !== failedPhoto;
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.frame, dimensions]} accessible={false}>
      {showPhoto ? (
        <Image source={photo} resizeMode="cover" style={dimensions} accessible={false}
          onError={() => setFailedPhoto(photo)} />
      ) : (
        <Text accessible={false} style={[styles.initial, { fontSize: size * 0.4, lineHeight: size * 0.55 }]}>
          {name.trim().charAt(0).toLocaleUpperCase('en-US') || '?'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.charcoal, borderWidth: 1, borderColor: theme.colors.darkGold },
  initial: { fontFamily: theme.typography.fontFamilies.heading, color: theme.colors.warmCream },
});
