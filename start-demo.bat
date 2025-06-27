@echo off
echo Starting AI-Enhanced Cypress Testing Framework Demo
echo.
echo 1. Starting the e-commerce demo site...
echo 2. Make sure your e-commerce site is running on http://127.0.0.1:5500
echo 3. If it's not running, please start it from VS Code Live Server
echo.
echo Once the site is running, press any key to open Cypress...
pause

echo.
echo Opening Cypress Test Runner...
npx cypress open