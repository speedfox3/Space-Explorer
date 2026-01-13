# Space-MMO Backend — Desarrollo y despliegue

Este README resume pasos mínimos para ejecutar el backend en desarrollo, aplicar migraciones Alembic y ejemplos de despliegue (Docker / docker-compose).

Requisitos
- Python 3.10+
- Postgres para producción (opcional SQLite para pruebas)

Instalación local (entorno virtual)

```bash
python -m venv .venv
source .venv/bin/activate      # bash/mac
.\\.venv\\Scripts\\Activate.ps1 # PowerShell on Windows
pip install -r requirements.txt
cp .env.example .env
# editar .env para apuntar a la BD
```

Ejecutar en desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# o con script
./run_dev.sh
# en Windows PowerShell
./run_dev.ps1
```

Aplicar migraciones Alembic

```bash
# asegúrate de que .env DATABASE_URL está configurado
alembic upgrade head
```

Ejecutar tests

```bash
pytest -q
```

Docker / docker-compose (ejemplo rápido)

docker-compose.yml (ejemplo):

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: space_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: space_mmo
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: .
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    environment:
      DATABASE_URL: postgresql://space_user:password@db/space_mmo
      SECRET_KEY: change-me
    ports:
      - '8000:8000'
    depends_on:
      - db

volumes:
  db_data:
```

Notas de seguridad
- Nunca comites `.env` con secretos.
- Cambia `SECRET_KEY` y credenciales para producción.

Siguientes pasos sugeridos
- Integrar Redis para sesiones y minijuegos.
- Añadir Celery/RabbitMQ para workers asíncronos.
- Configurar CI para tests y despliegues automáticos.
