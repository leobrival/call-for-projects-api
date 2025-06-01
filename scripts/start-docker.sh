#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "[ info ] checking docker status..."

# Fonction pour vérifier si Docker est en cours d'exécution
check_docker() {
    docker info > /dev/null 2>&1
    return $?
}

# Fonction pour démarrer Docker sur macOS
start_docker_macos() {
    echo -e "${YELLOW}[ warn ] docker not running, attempting to start...${NC}"
    
    # Vérifier si Docker Desktop est installé
    if [ -d "/Applications/Docker.app" ]; then
        echo "[ info ] starting docker desktop..."
        open -a Docker
        
        # Attendre que Docker démarre (max 60 secondes)
        echo "[ info ] waiting for docker to start..."
        timeout=60
        while [ $timeout -gt 0 ]; do
            if check_docker; then
                echo -e "${GREEN}[ info ] docker started successfully${NC}"
                return 0
            fi
            echo -n "."
            sleep 2
            timeout=$((timeout - 2))
        done
        
        echo -e "\n${RED}[ error ] timeout: docker failed to start${NC}"
        return 1
    else
        echo -e "${RED}[ error ] docker desktop not found${NC}"
        echo -e "${YELLOW}[ info ] please install docker desktop${NC}"
        return 1
    fi
}

# Fonction pour démarrer Docker sur Linux
start_docker_linux() {
    echo -e "${YELLOW}[ warn ] docker not running, attempting to start...${NC}"
    
    # Vérifier si systemctl est disponible
    if command -v systemctl > /dev/null 2>&1; then
        echo "[ info ] starting docker service..."
        sudo systemctl start docker
        
        # Vérifier que Docker a bien démarré
        if check_docker; then
            echo -e "${GREEN}[ info ] docker started successfully${NC}"
            return 0
        else
            echo -e "${RED}[ error ] failed to start docker${NC}"
            return 1
        fi
    else
        echo -e "${RED}[ error ] systemctl not available${NC}"
        return 1
    fi
}

# Vérifier si Docker est déjà en cours d'exécution
if check_docker; then
    echo -e "${GREEN}[ info ] docker is running${NC}"
else
    # Détecter l'OS et essayer de démarrer Docker
    case "$(uname -s)" in
        Darwin*)
            start_docker_macos
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ error ] failed to start docker automatically${NC}"
                exit 1
            fi
            ;;
        Linux*)
            start_docker_linux
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ error ] failed to start docker automatically${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}[ error ] unsupported os${NC}"
            exit 1
            ;;
    esac
fi

# Vérifier que docker-compose.yml existe
if [ ! -f "docker-compose.yml" ] && [ ! -f "compose.yml" ]; then
    echo -e "${RED}[ error ] docker-compose.yml not found${NC}"
    exit 1
fi

# Lancer docker compose
echo "[ info ] starting docker services..."
docker compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[ info ] docker services started${NC}"
else
    echo -e "${RED}[ error ] failed to start docker services${NC}"
    exit 1
fi 