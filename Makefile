.PHONY: up down backend frontend clean

up:
	@echo "🚀 Starting backend..."
	 docker compose up -d --build
	@echo "⚛️ Starting frontend..."
	cd mmo_frontend && npm install && npm run dev

backend:
	 docker compose up --build

frontend:
	cd mmo_frontend && npm install && npm run dev

down:
	 docker compose down

clean:
	 docker compose down -v
