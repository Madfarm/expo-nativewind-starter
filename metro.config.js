const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts

const createConfig = () => {
    const config = getDefaultConfig(__dirname)

    const { resolver } = config;

    config.resolver = {
        ...resolver,
        assetExts: [
            ...defaultAssetExts,
            'bin', // whisper.rn: ggml model binary
            'mil', // whisper.rn: CoreML model asset
        ]
    };

    return config;
}

const config = createConfig();
module.exports = withNativeWind(config, { input: './global.css' })