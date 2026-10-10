import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumIgnoreCertificateErrors(true);

// Di Linux container / Railway, WAJIB aktifkan multi-process agar Chrome tab tidak crash (Page crashed!)
if (process.platform === 'linux') {
  Config.setChromiumMultiProcessOnLinux(true);
  // Jika headless-shell tidak ditemukan namun /usr/bin/chromium ada di sistem, gunakan browser sistem
  if (fs.existsSync('/usr/bin/chromium')) {
    const localShell = '/app/node_modules/.remotion/chrome-headless-shell';
    if (!fs.existsSync(localShell)) {
      Config.setBrowserExecutable('/usr/bin/chromium');
    }
  }
}



