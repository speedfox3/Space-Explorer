.PHONY: up down backend frontend clean

up:
	@echo "🚀 Starting backend..."
	cd mmo_backend/server && docker compose up -d --build
	@echo "⚛️ Starting frontend..."
	cd mmo_frontend && npm install && npm run dev

backend:
	cd mmo_backend/server && docker compose up --build

frontend:
	cd mmo_frontend && npm install && npm run dev

down:
	cd mmo_backend/server && docker compose down

clean:
	cd mmo_backend/server && docker compose down -v
