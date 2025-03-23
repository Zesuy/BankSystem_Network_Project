// renderer.js - 界面逻辑
const net = require('net')
let socket = null
let currentState = 'INIT'

// 状态管理
const states = {
    INIT: 'INIT',
    NEED_PASSWORD: 'NEED_PASSWORD',
    AUTHED: 'AUTHED'
}
function showError(message) {
    const toast = document.getElementById('error-toast')
    toast.innerText = message
    toast.style.display = 'block'
    setTimeout(() => {
        toast.style.display = 'none'
    }, 3000)
}

// 连接服务器
document.getElementById('connect-btn').addEventListener('click', () => {
    console.log("connecting")
    const ip = document.getElementById('server-ip').value
    const port = document.getElementById('server-port').value
  
    socket = new net.Socket()
    
    socket.connect(port, ip, () => {
        console.log('TCP created')
        showLoginScreen()
    })
    
    
    // 处理错误事件
    socket.on('error', (err) => {
        console.log('连接错误:', err)
        showError('连接服务器失败：' + err.message)
        socket.destroy()
        currentState = states.TEST
        document.getElementById('init-screen').style.display = 'block'
        document.getElementById('login-screen').style.display = 'none'
    })
    
    socket.on('data', (data) => {
        handleServerResponse(data.toString())
    })
})

function handleServerResponse(response) {
    switch(currentState) {
      case states.INIT:
        if (response.startsWith('500')) {
            console.log("account exists wait for passwords")
          currentState = states.NEED_PASSWORD
          document.getElementById('password-field').style.display = 'block'
        }
        else{
            showError("账户错误或用户不存在")
            console.log("account doesnot exist")
        }
        break
  
      case states.NEED_PASSWORD:
        if (response.startsWith('525')) {
            console.log("login succeed")
          currentState = states.AUTHED
          showMainScreen()
        } else if (response.startsWith('401')) {
          showError('密码错误，请重试')
          document.getElementById('password').value = ''
        }
        break
  
      case states.AUTHED:
        if (response.startsWith('AMNT')) {
          const amount = response.split(':')[1]
          console.log('当前余额'+amount)
          document.getElementById('result').style.display = 'block'
          document.getElementById('result').innerText = `当前余额：${amount}`
        } else if (response.startsWith('525')) {
          document.getElementById('result').innerText = '操作成功'
          console.log("action suceed")
        } else if (response.startsWith('401')) {
          document.getElementById('result').innerText = '操作失败'
        } else if (response === 'BYE') {
            console.log("user loggout")
          currentState = states.INIT
          document.getElementById('main-screen').style.display = 'none'
          document.getElementById('init-screen').style.display = 'block'
        }
        break
    }
  }

// 显示登录界面
function showLoginScreen() {
  document.getElementById('init-screen').style.display = 'none'
  document.getElementById('login-screen').style.display = 'block'
}

// 显示主界面
function showMainScreen() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('main-screen').style.display = 'block'
}

// 登录操作
document.getElementById('login-btn').addEventListener('click', () => {
  const userId = document.getElementById('user-id').value
  const password = document.getElementById('password').value
  
  if (currentState === states.INIT) {
    socket.write(`HELO ${userId}\r\n`)
  } else if (currentState === states.NEED_PASSWORD) {
    socket.write(`PASS ${password}\r\n`)
  }
})

// 余额查询
document.getElementById('balance-btn').addEventListener('click', () => {
    console.log("bala")
  socket.write('BALA\r\n')
})

// 取款操作
document.getElementById('withdraw-btn').addEventListener('click', () => {
    const amount = document.getElementById('withdraw-amount').value
    if (amount) {
      socket.write(`WDRA ${amount}\r\n`)
      document.getElementById('withdraw-amount').value = '' // 清空输入框
    } else {
      showError('请输入有效金额')
    }
  })

// 退出登录
document.getElementById('logout-btn').addEventListener('click', () => {
  socket.write('BYE\r\n')
  currentState = states.INIT
  document.getElementById('main-screen').style.display = 'none'
  document.getElementById('init-screen').style.display = 'block'


})