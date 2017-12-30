@ECHO OFF
CALL "%~dp0node_modules\.bin\%~n0%~x0" --project ./tsconfig.json --format verbose %*