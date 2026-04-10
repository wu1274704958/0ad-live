@echo off
rem ** Create Visual Studio Workspaces on Windows **

rem Check if --amd64 is passed, and set HOSTTYPE environment variable
for %%A in (%*) do (
    if "%%A"=="--amd64" set HOSTTYPE=amd64
)

cd /D "%~dp0"
cd ..\bin
if not exist ..\workspaces\vs2022\SKIP_PREMAKE_HERE premake5.exe --file="../premake/premake5.lua" --outpath="../workspaces/vs2022" %* vs2022 || exit /b 1
cd ..\workspaces
