FROM openjdk:17-jdk
WORKDIR /app
COPY jenkins.war .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "jenkins.war"]
