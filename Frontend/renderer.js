// renderer.js - 界面逻辑
document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen')
    let currentScreen = 'loginScreen'
  
    // 界面切换函数
    function showScreen(screenId) {
      screens.forEach(screen => {
        screen.classList.remove('active')
        if (screen.id === screenId) screen.classList.add('active')
      })
      currentScreen = screenId
    }
  
    // 服务器响应处理
    window.api.onServerResponse((_, response) => {
      const messageDiv = document.getElementById('message')
      messageDiv.textContent = response
  
      if (response.startsWith('500')) {
        showScreen('pinScreen')
      } else if (response.startsWith('AMNT')) {
        messageDiv.textContent = `Balance: ${response.split(':')[1]} cents`
      } else if (response === 'BYE') {
        showScreen('loginScreen')
      }
    })
  
    // 事件绑定
    document.getElementById('loginBtn').addEventListener('click', async () => {
      const cardNumber = document.getElementById('cardNumber').value
      await window.api.sendCommand('HELO', cardNumber)
    })
  
    document.getElementById('submitPin').addEventListener('click', async () => {
      const pin = document.getElementById('pin').value
      const result = await window.api.sendCommand('PASS', pin)
      if (result.status === 'success') showScreen('mainScreen')
    })
  
    document.getElementById('balanceBtn').addEventListener('click', async () => {
      await window.api.sendCommand('BALA')
    })
  
    document.getElementById('withdrawBtn').addEventListener('click', async () => {
      const amount = document.getElementById('amount').value
      await window.api.sendCommand('WDRA', amount)
    })
  
    document.getElementById('exitBtn').addEventListener('click', async () => {
      await window.api.sendCommand('BYE')
    })

    // 添加日志记录函数
    function logToFile(action, status, message = '') {
      const logEntry = `
        <log>
          <timestamp>${new Date().toISOString()}</timestamp>
          <action>${action}</action>
          <status>${status}</status>
          <message>${message}</message>
        </log>
      `;
      
      // 通过IPC发送日志到主进程
      window.api.logAction({action, status, message});
    }

    // 添加配置按钮事件
    document.getElementById('configBtn').addEventListener('click', () => {
      showScreen('configScreen');
    });

    // 添加保存配置事件
    document.getElementById('saveConfig').addEventListener('click', async () => {
      const address = document.getElementById('serverAddress').value;
      const port = document.getElementById('serverPort').value;
      
      try {
        await window.api.updateServerConfig({address, port});
        logToFile('UPDATE_CONFIG', 'SUCCESS', `Server: ${address}:${port}`);
        document.getElementById('configMessage').textContent = 'Configuration saved successfully';
      } catch (error) {
        logToFile('UPDATE_CONFIG', 'FAILED', error.message);
        document.getElementById('configMessage').textContent = `Error: ${error.message}`;
      }
    });

    // 添加返回按钮事件
    document.getElementById('backBtn').addEventListener('click', () => {
      showScreen('loginScreen');
    });


    // 添加连接状态显示
    window.api.onConnectionError((_, error) => {
      logToFile('CONNECTION', 'FAILED', error);
      document.getElementById('message').textContent = `Connection Error: ${error}`;
      document.getElementById('connectionStatus').textContent = '连接失败';
      document.getElementById('connectionStatus').style.color = 'red';
    });

    // 添加成功连接处理
    window.api.onServerResponse(() => {
      document.getElementById('connectionStatus').textContent = '已连接';
      document.getElementById('connectionStatus').style.color = 'green';
    });

    // 添加测试连接按钮事件
    document.getElementById('testConnectionBtn').addEventListener('click', async () => {
      try {
        const testCard = '123456'; // 测试用卡号
        const response = await window.api.sendCommand('HELO', testCard);
        if (response.status === 'success') {
          document.getElementById('message').textContent = '服务器连接正常';
          logToFile('TEST_CONNECTION', 'SUCCESS', 'Server connection test passed');
        } else {
          document.getElementById('message').textContent = '服务器连接失败';
          logToFile('TEST_CONNECTION', 'FAILED', 'Server connection test failed');
        }
      } catch (error) {
        document.getElementById('message').textContent = `测试失败: ${error.message}`;
        logToFile('TEST_CONNECTION', 'ERROR', error.message);
        // 添加重连逻辑
        setTimeout(() => {
          document.getElementById('testConnectionBtn').click();
        }, 3000); // 3秒后自动重试
      }
    });

    window.api.updateServerConfig((_, config) => {
      document.getElementById('currentHost').textContent = `${config.address}:${config.port}`;
      // 添加日志记录
      logToFile('UPDATE_HOST', 'SUCCESS', `Updated to ${config.address}:${config.port}`);
    });
    
    // 修改保存配置事件
    document.getElementById('saveConfig').addEventListener('click', async () => {
      const address = document.getElementById('serverAddress').value;
      const port = document.getElementById('serverPort').value;
      
      try {
        const result = await window.api.updateServerConfig({address, port});
        if (result.status === 'success') {
          // 立即更新界面显示
          document.getElementById('currentHost').textContent = `${address}:${port}`;
          document.getElementById('configMessage').textContent = 'Configuration saved successfully';
          logToFile('UPDATE_CONFIG', 'SUCCESS', `Server: ${address}:${port}`);
        }
      } catch (error) {
        logToFile('UPDATE_CONFIG', 'FAILED', error.message);
        document.getElementById('configMessage').textContent = `Error: ${error.message}`;
      }
    });
  })