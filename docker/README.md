# Shiv Furniture - Docker Setup

## Quick Start

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### 2. Access Services

| Service   | URL                    | Credentials                           |
|-----------|------------------------|---------------------------------------|
| PostgreSQL| localhost:5432         | User: `shiv_admin` / Pass: `shiv_secure_pwd_2024` |
| pgAdmin   | http://localhost:5050  | Email: `admin@shivfurniture.com` / Pass: `admin123` |

### 3. Connect to Database

**Connection String:**
```
postgresql://shiv_admin:shiv_secure_pwd_2024@localhost:5432/shiv_furniture_db
```

**Using psql:**
```bash
docker exec -it shiv_furniture_db psql -U shiv_admin -d shiv_furniture_db
```

### 4. Run Migrations

```bash
cd backend
npm run prisma:migrate
```

### 5. Seed Database

```bash
npm run prisma:seed
```

## Commands

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Restart
docker-compose restart

# View database logs
docker-compose logs -f postgres
```

## pgAdmin Setup

1. Open http://localhost:5050
2. Login with `admin@shivfurniture.com` / `admin123`
3. Add new server:
   - Name: `Shiv Furniture DB`
   - Host: `postgres` (Docker network name)
   - Port: `5432`
   - Username: `shiv_admin`
   - Password: `shiv_secure_pwd_2024`

## Troubleshooting

**Port 5432 already in use:**
```bash
# Find what's using the port
lsof -i :5432

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 externally
```

**Permission issues:**
```bash
# Reset volumes
docker-compose down -v
docker-compose up -d
```
