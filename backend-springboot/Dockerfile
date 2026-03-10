# Stage 1: Build the Java App in the Cloud
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
# Copy your code into the cloud server
COPY . .
# Make the Maven wrapper executable and build the project
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the Java App
FROM eclipse-temurin:25-jre
WORKDIR /app
# Grab the compiled .jar file from Stage 1
COPY --from=build /app/target/backend-springboot-0.0.1-SNAPSHOT.jar app.jar
# Open the port Render needs to route web traffic
EXPOSE 8080
# Boot the server
ENTRYPOINT ["java", "-jar", "app.jar"]