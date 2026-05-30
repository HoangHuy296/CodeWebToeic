# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS deps
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline

FROM deps AS build
WORKDIR /app
COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app
COPY --from=build /app/target/*.jar ./app.jar
EXPOSE 5000
CMD ["java", "-jar", "/app/app.jar"]

FROM deps AS development
WORKDIR /app
EXPOSE 5000
CMD ["mvn", "-T", "1C", "-B", "spring-boot:run"]