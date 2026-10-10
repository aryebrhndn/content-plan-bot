import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumIgnoreCertificateErrors(true);

if (process.platform === 'linux') {
  // Gunakan 'swangle' (SwiftShader) di container headless tanpa GPU fisik (Railway/Docker)
  Config.setChromiumOpenGlRenderer('swangle');
  Config.setChromiumMultiProcessOnLinux(true);
  Config.setDisableSharedMemoryCapture(true);
} else {
  Config.setChromiumOpenGlRenderer('angle');
}




