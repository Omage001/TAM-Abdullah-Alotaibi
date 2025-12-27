# Secure Scala Chat - Docker Setup

## Quick Start with Docker Compose

### Prerequisites
- Docker Desktop installed
- Docker Hub account (username: abdullah0100)

### Running the Application

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (reset database):**
   ```bash
   docker-compose down -v
   ```

### Building and Pushing to Docker Hub

1. **Build the image:**
   ```bash
   docker build -t abdullah0100/secure-scala-chat:latest .
   ```

2. **Test locally:**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/secure_scala_chat \
     abdullah0100/secure-scala-chat:latest
   ```

3. **Push to Docker Hub:**
   ```bash
   docker push abdullah0100/secure-scala-chat:latest
   ```

4. **Tag a version:**
   ```bash
   docker tag abdullah0100/secure-scala-chat:latest abdullah0100/secure-scala-chat:v1.0.0
   docker push abdullah0100/secure-scala-chat:v1.0.0
   ```

### Environment Variables

The application uses the following environment variables:

- `NODE_ENV` - Set to `production` in Docker
- `PORT` - Application port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string

### Database Setup

The database is automatically initialized when you run `docker-compose up`. The schema is created, and a demo user is seeded:

- **Username:** demo
- **Password:** demo1234

### Accessing the Application

Once started, access the application at:
- **Local:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/user

### Troubleshooting

**Database connection issues:**
```bash
docker-compose logs postgres
docker-compose restart app
```

**Rebuild after code changes:**
```bash
docker-compose up --build
```

**Clear everything and start fresh:**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Production Deployment

For production, update the `docker-compose.yml`:

1. Change PostgreSQL password
2. Use environment file for secrets
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure backup strategy for postgres_data volume

### Docker Hub Repository

Image: `abdullah0100/secure-scala-chat`
- Latest stable: `latest`
- Versioned: `v1.0.0`, `v1.0.1`, etc.
