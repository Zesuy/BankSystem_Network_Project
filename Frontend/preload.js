// preload.js - 暴露API给渲染进程
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  sendCommand: (command, param) => ipcRenderer.invoke('send-command', {command, param}),
  onServerResponse: (callback) => ipcRenderer.on('server-response', callback),
  onConnectionError: (callback) => ipcRenderer.on('connection-error', callback),
  updateServerConfig: (config) => ipcRenderer.invoke('update-server-config', config),
  logAction: (logData) => ipcRenderer.invoke('log-action', logData)
})