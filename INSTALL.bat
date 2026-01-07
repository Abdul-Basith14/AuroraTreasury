@echo off
echo =========================================
echo  AuroraTreasury Installation Script
echo =========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Setting up environment files...
cd ..\server
if not exist .env (
    copy .env.example .env
    echo Backend .env file created. Please edit it with your settings.
) else (
    echo Backend .env already exists.
)

cd ..\client
if not exist .env (
    copy .env.example .env
    echo Frontend .env file created.
) else (
    echo Frontend .env already exists.
)

cd ..
echo.

echo =========================================
echo  Installation Complete!
echo =========================================
echo.
echo NEXT STEPS:
echo 1. Start MongoDB (if using local MongoDB)
echo 2. Edit server/.env with your MongoDB URI and JWT secret
echo 3. Run: cd server ^&^& node utils/seedClubSettings.js
echo 4. Start backend: cd server ^&^& npm run dev
echo 5. Start frontend (new terminal): cd client ^&^& npm run dev
echo.
echo For detailed setup instructions, see SETUP_GUIDE.md
echo.
pause
