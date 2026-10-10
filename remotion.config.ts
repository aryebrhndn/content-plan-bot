import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumIgnoreCertificateErrors(true);

// Di Linux container / Railway, aktifkan multi-process agar Chrome tab tidak crash (Page crashed!)
if (process.platform === 'linux') {
  Config.setChromiumMultiProcessOnLinux(true);
}




