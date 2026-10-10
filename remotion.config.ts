import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
// Di Windows gunakan 'angle', di Linux headless/Docker tanpa GPU gunakan 'swangle' (SwiftShader)
Config.setChromiumOpenGlRenderer(process.platform === 'win32' ? 'angle' : 'swangle');
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumIgnoreCertificateErrors(true);

// Di Linux container / Railway, gunakan single process untuk keandalan memori
if (process.platform === 'linux') {
  Config.setChromiumMultiProcessOnLinux(false);
  // Jika headless-shell tidak ditemukan namun /usr/bin/chromium ada di sistem, gunakan browser sistem
  if (fs.existsSync('/usr/bin/chromium')) {
    const localShell = '/app/node_modules/.remotion/chrome-headless-shell';
    if (!fs.existsSync(localShell)) {
      Config.setBrowserExecutable('/usr/bin/chromium');
    }
  }
}



