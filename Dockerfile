FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /workspace
COPY backend/pom.xml backend/mvnw ./
COPY backend/.mvn ./.mvn
COPY backend/src ./src
RUN chmod +x ./mvnw
COPY --from=frontend-build /frontend/dist ./src/main/resources/static
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /workspace/target/auth-api-0.0.1-SNAPSHOT.jar ./app.jar
COPY start.sh ./start.sh
RUN chmod +x /app/start.sh
EXPOSE 8080
ENTRYPOINT ["/app/start.sh"]