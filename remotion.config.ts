import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
// Di Windows gunakan 'angle', di Linux headless/Docker tanpa GPU gunakan 'swangle' (SwiftShader)
Config.setChromiumOpenGlRenderer(process.platform === 'win32' ? 'angle' : 'swangle');
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);


