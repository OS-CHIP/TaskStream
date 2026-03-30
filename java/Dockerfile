# 使用官方 OpenJDK 17
FROM openjdk:17

# 设置工作目录
WORKDIR /app

# 将本地的 tb.jar 复制到容器中的 /app 目录下
COPY target/tb.jar app.jar

# 暴露应用使用的端口（请根据你的应用实际端口修改，例如 8080）
EXPOSE 10086

# 启动 Java 应用
ENTRYPOINT ["java", "-jar", "app.jar"]

# docker build -t tb-app:latest .
# docker save -o tb.tar tb-app:latest
# docker run -d -p 10086:10086 --name tb-container tb-app:latest