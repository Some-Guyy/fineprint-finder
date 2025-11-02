#!/bin/bash

# Detect the operating system
OS="$(uname -s)"

case "${OS}" in
    Linux*)
        # Linux with gnome-terminal
        gnome-terminal -- bash -c "./server.sh" &
        gnome-terminal -- bash -c "./llm.sh" &
        ;;
    Darwin*)
        # macOS
        osascript -e 'tell app "Terminal" to do script "cd \"'"$PWD"'\" && ./server.sh"' &
        osascript -e 'tell app "Terminal" to do script "cd \"'"$PWD"'\" && ./llm.sh"' &
        ;;
    *)
        echo "Unsupported operating system: ${OS}"
        exit 1
        ;;
esac
