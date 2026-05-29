# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS deps
WORKDIR /app

# Copy the Maven descriptor first so dependency resolution is cached.
COPY backend-spring/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline

FROM deps AS build
WORKDIR /app

# Copy the Spring Boot source after dependencies are available.
COPY backend-spring/src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app

# Copy the fat jar produced by Spring Boot.
COPY --from=build /app/target/backend-spring-0.1.0.jar ./app.jar

EXPOSE 5000
CMD ["java", "-jar", "/app/app.jar"]

FROM deps AS development
WORKDIR /app

# Development container uses Maven directly so source mounts can hot-restart the app.
COPY backend-spring/src ./src

EXPOSE 5000
CMD ["mvn", "-B", "spring-boot:run"]
