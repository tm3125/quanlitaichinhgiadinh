@echo off
chcp 65001 >nul
echo ===================================================
echo     DANG KHOI DONG SO THU CHI GIA DINH...
echo ===================================================
echo.
echo Ung dung dang khoi dong va se tu dong mo trinh duyet!
echo.
start http://localhost:5173
npm run dev
pause
