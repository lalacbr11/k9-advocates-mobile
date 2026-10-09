import type { ImageSourcePropType } from 'react-native';

// Licensed stock photos represent fictional records, never actual clients.
// Source/credit registry for Andi; documentation files are maintained separately.
// Pexels permits use in apps and does not require attribution. Retain credits
// voluntarily; these photos must not imply photographer endorsement.
// Retrieved 2026-10-09 from images.pexels.com/photos/<photo-id>/
// pexels-photo-<photo-id>.jpeg?auto=compress&cs=tinysrgb&w=640.
// Bundled JPEGs preserve aspect ratio; circular cover framing happens in the UI.
const licenseUrl = 'https://www.pexels.com/license/';

export const demoDogPhotos = {
  atlas: {
    source: require('../../assets/dogs/atlas.jpg') as ImageSourcePropType,
    photographer: 'Nano Erdozain',
    sourceUrl: 'https://www.pexels.com/photo/close-up-of-a-german-shepherd-dog-18058222/',
    licenseUrl,
  },
  willow: {
    source: require('../../assets/dogs/willow.jpg') as ImageSourcePropType,
    photographer: 'Eduardo López',
    sourceUrl: 'https://www.pexels.com/photo/portrait-of-black-labrador-retriever-16618519/',
    licenseUrl,
  },
  finn: {
    source: require('../../assets/dogs/finn.jpg') as ImageSourcePropType,
    photographer: "Jay's Photography",
    sourceUrl: 'https://www.pexels.com/photo/border-collie-in-black-and-white-16471124/',
    licenseUrl,
  },
  hazel: {
    source: require('../../assets/dogs/hazel.jpg') as ImageSourcePropType,
    photographer: 'Zach Ward',
    sourceUrl: 'https://www.pexels.com/photo/portrait-of-golden-retriever-16876004/',
    licenseUrl,
  },
  otis: {
    source: require('../../assets/dogs/otis.jpg') as ImageSourcePropType,
    photographer: 'JacLou- DL',
    sourceUrl: 'https://www.pexels.com/photo/happy-brown-standard-poodle-in-green-field-34265054/',
    licenseUrl,
  },
} as const;
