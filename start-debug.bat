@echo off
echo ========================================
echo 智研平台 - 前端调试启动脚本
echo ========================================
echo.

echo 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 检查npm环境...
npm --version
if %errorlevel% neq 0 (
    echo 错误: 未找到npm，请先安装npm
    pause
    exit /b 1
)

echo.
echo 安装依赖包...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 启动前端开发服务器...
echo 前端地址: http://localhost:8000
echo 调试页面: http://localhost:8000/debug-network-connection.html
echo 测试页面: http://localhost:8000/test-email-verification.html
echo.
echo 请确保后端服务在 http://localhost:8091 运行
echo 按 Ctrl+C 停止服务器
echo.

npm run serve
