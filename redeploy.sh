#/bin/bash
git pull --rebase
docker build -t gianpietro/kpopway .
docker-compose up -d
