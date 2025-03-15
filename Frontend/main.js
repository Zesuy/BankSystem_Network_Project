// main.js - Electron主进程
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const net = require('net')

let mainWindow
let socket
let currentState = 'INIT'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile('index.html')
}

// 协议消息生成器
function buildMessage(command, param = '') {
  return `${command}${param ? ' ' + param : ''}\r\n` // RFC规定的CRLF结束
}

// 状态管理机
const stateMachine = {
  INIT: {
    validCommands: ['HELO'],
    nextState: 'AUTH_REQUIRED'
  },
  AUTH_REQUIRED: {
    validCommands: ['PASS'],
    nextState: 'AUTHENTICATED'
  },
  AUTHENTICATED: {
    validCommands: ['BALA', 'WDRA', 'BYE'],
    nextState: 'READY'
  }
}

// TCP客户端连接
function connectToServer() {
  const defaultHost = '127.0.0.1';
  socket = net.createConnection({ host: defaultHost,port: 2525 }, () => {
    console.log('Connected to server')
  })

  socket.on('data', (data) => {
    const response = data.toString().trim()
    mainWindow.webContents.send('server-response', response)
    
    // 状态转换逻辑
    if (response.startsWith('500')) {
      currentState = 'AUTH_REQUIRED'
    } else if (response.startsWith('525')) {
      currentState = stateMachine[currentState].nextState || 'INIT'  // 添加默认状态
    }
  })

  socket.on('error', (err) => {
    mainWindow.webContents.send('connection-error', err.message)
  })
}

ipcMain.handle('send-command', (event, {command, param}) => {
  if (!stateMachine[currentState].validCommands.includes(command)) {
    return { status: 'error', message: 'Invalid command sequence' }
  }

  socket.write(buildMessage(command, param))
  return { status: 'success' }
})

app.whenReady().then(() => {
  connectToServer()
  createWindow()
})


// 添加日志处理
const fs = require('fs');
const logFilePath = path.join(__dirname, 'logfile.xml');

// 初始化日志文件
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '<logs>\n</logs>');
}

// 添加日志处理函数
function appendLogEntry(entry) {
  const logContent = fs.readFileSync(logFilePath, 'utf8');
  const newContent = logContent.replace('</logs>', `${entry}\n</logs>`);
  fs.writeFileSync(logFilePath, newContent);
}

// 添加配置文件路径
const configFilePath = path.join(__dirname, 'server-config.json');

// 读取配置文件
function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    }
    return { servers: [], current: null };
  } catch (error) {
    return { servers: [], current: null };
  }
}

// 保存配置文件
function saveConfig(config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

// 添加获取配置的IPC处理
ipcMain.handle('get-config', () => {
  return readConfig();
});

// 添加保存配置的IPC处理
ipcMain.handle('save-config', (event, config) => {
  saveConfig(config);
  return { status: 'success' };
});

// 添加配置更新处理
ipcMain.handle('update-server-config', async (event, {address, port}) => {
  try {
    // 测试新配置
    const testSocket = net.createConnection({host: address, port});
    testSocket.on('error', () => {
      throw new Error('Connection failed with new configuration');
    });
    testSocket.destroy();
    return {status: 'success'};
  } catch (error) {
    return {status: 'error', message: error.message};
  }
});

// 添加日志记录处理
ipcMain.handle('log-action', (event, {action, status, message}) => {
  appendLogEntry(`
    <log>
      <timestamp>${new Date().toISOString()}</timestamp>
      <action>${action}</action>
      <status>${status}</status>
      <message>${message}</message>
    </log>
  `);
});