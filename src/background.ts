'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { ipcMain } = require('electron');
const express = require('express');
const path = require('path');

const textToSpeech = new TextToSpeechV1({
  iam_apikey: 'iTfvMwKtpAys7Z35cXjTmYvfY8bsglh4-40p6-8qiCKG',
  url: 'https://gateway-syd.watsonplatform.net/text-to-speech/api'
});

var appExpress = express();

let win: BrowserWindow | null

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
  // if (!fs.existsSync('./audio')) {
  //   fs.mkdirSync('./audio');
  // }
  if (!fs.existsSync(path.join(__dirname, './audio'))) {
    fs.mkdirSync(path.join(__dirname, './audio'));
  }
  
  console.log('-------------------------');
  appExpress.use(express.static(path.join(__dirname, './audio')));
  appExpress.get('/', (req: any, res: any) => {
    // res.send('Hello World!')
    res.sendFile(path.join(__dirname, './audio/hw.mp3'));
  });
  appExpress.listen(8081, () => console.log(`Example app listening on port ${8081}!`));
  console.log('=========================');
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
  }
  createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


ipcMain.on('test', (event, arg) => {
  console.log('test..............');
  console.log(arg);

  function writeFile(path: any, contents: any, cb: any) {
    mkdirp(getDirName(path), function (err: any) {
      if (err) return cb(err);
      else {
        cb(fs.writeFile(path, contents));
      }
    });
  }

  const synthesizeParams = {
    text: 'Hello world',
    accept: 'audio/mp3',
    voice: 'en-US_AllisonVoice',
  };

  textToSpeech.synthesize(synthesizeParams)
    .then((audio: any) => {
      console.log('....................0');
      // const name = 'a_' + Math.floor(Math.random() * 1000000000);
      const name = 'hw';
      // const stream = fs.createWriteStream(`./audio/${name}.mp3`);
      const stream = fs.createWriteStream(path.join(__dirname, './audio/hw.mp3'));
      stream.on('close', (data: any) => {
        console.log('close..........');
        console.log(data);
      });
      audio.pipe(stream);
    })
    .catch((err: any) => {
      console.log('error:', err);
    });
})