@echo off
echo Installing dependencies...
npm install

echo Starting Vite server...
start "" cmd /c "npm run server"

echo Starting Prisma Studio...
start "" cmd /c "npx prisma studio"

timeout /t 3 >nul

echo Opening browser...
start http://localhost:5173/

echo Starting Next.js dev server...
npm run dev
