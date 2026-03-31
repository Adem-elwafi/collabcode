# CollabCode API - Infrastructure and JPA Repair Report

Date: 2026-03-26
Project: collabcode-api

## 1. Incident Summary

The application failed at startup with:

- `UnsatisfiedDependencyException` on `jwtAuthenticationFilter` -> `applicationConfig` -> `userRepository`
- `Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory'`
- `Failed to initialize JPA EntityManagerFactory`
- `Access denied for user 'root'@'localhost' (using password: YES)`

This indicated that Spring Data JPA repositories were discovered correctly, but the JPA infrastructure bean (`entityManagerFactory`) could not be created because datasource setup was incomplete/incorrect.

## 2. Root Cause Analysis

### Root Cause A: Missing Datasource and JPA Core Properties

Initial `application.yml` contained only JWT settings and did not include:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.jpa.hibernate.ddl-auto`

Without datasource and JPA properties, Hibernate could not establish DB metadata, causing `entityManagerFactory` initialization failure.

### Root Cause B: Credential Mismatch for Local MySQL

After adding datasource configuration, startup moved forward and failed with:

- `Access denied for user 'root'@'localhost' (using password: YES)`

The config default password was set to `root`, while the environment had no database password configured for local development.

## 3. Scope of Audit and Validation

The following areas were audited:

- Application configuration files (`application.yml`, `application.properties`)
- Main Spring Boot class package and annotations
- Entity package, annotations, and identifier
- Repository package and type hierarchy
- Maven dependencies for JPA and MySQL driver

## 4. What Was Confirmed as Correct

### 4.1 Main Application Class and Package Scanning

File: `src/main/java/com/collabcode_api/CollabcodeApiApplication.java`

Confirmed:

- `@SpringBootApplication` present
- Package is `com.collabcode_api`
- Class is at root package, so all sub-packages are scanned

### 4.2 Repository and Entity Package Alignment

Files:

- `src/main/java/com/collabcode_api/features/auth/User.java`
- `src/main/java/com/collabcode_api/features/auth/UserRepository.java`

Confirmed:

- Both are in sub-package `com.collabcode_api.features.auth`
- Correctly discoverable by component/entity/repository scanning from root package

### 4.3 Entity and Repository Annotations

`User` entity confirmed with:

- `@Entity`
- `@Id`
- `@GeneratedValue`

`UserRepository` confirmed with:

- `extends JpaRepository<User, Integer>`

### 4.4 Maven Dependency Check

File: `pom.xml`

Confirmed dependency already present:

- `com.mysql:mysql-connector-j` (runtime)

Also confirmed:

- `spring-boot-starter-data-jpa` present

## 5. Applied Fixes

## 5.1 Configuration Repair in application.yml

File modified: `src/main/resources/application.yml`

### Added Spring datasource configuration

- Added local MySQL URL with Docker-friendly defaults:
  - `jdbc:mysql://localhost:3306/collabcode_db`
- Included common JDBC options:
  - `createDatabaseIfNotExist=true`
  - `useSSL=false`
  - `allowPublicKeyRetrieval=true`
  - `serverTimezone=UTC`

### Added JPA/Hibernate configuration

- Enabled automatic schema update:
  - `spring.jpa.hibernate.ddl-auto: update`
- Enabled SQL visibility and formatting:
  - `show-sql: true`
  - `hibernate.format_sql: true`

### Added explicit MySQL dialect

- `spring.jpa.database-platform: org.hibernate.dialect.MySQLDialect`

This avoids dialect ambiguity in environments where metadata cannot be retrieved early.

### Corrected password default for no-password local DB

Changed:

- From: `password: ${DB_PASSWORD:root}`
- To: `password: ${DB_PASSWORD:}`

This prevents Spring from forcing a password when your local DB uses blank credentials.

## 6. Final Working Configuration

Current `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: collabcode-api
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/collabcode_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

app:
  security:
    jwt-secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
    jwt-expiration: 86400000
```

## 7. Why the Error Cascaded into UserRepository

`UserRepository` is a JPA repository bean. During initialization it requires an `EntityManager` backed by `entityManagerFactory`.

When datasource connectivity fails, Hibernate cannot initialize `entityManagerFactory`. That causes repository creation to fail, which then causes constructor-injected beans depending on the repository to fail (`ApplicationConfig`), and then any bean depending on those (`JwtAuthenticationFilter`, `SecurityConfig`, web context).

So the repository error was a symptom, not the original cause.

## 8. Verification Checklist (Completed)

- [x] Datasource URL defined
- [x] Datasource credentials defined
- [x] JPA `ddl-auto` set to `update`
- [x] Main class in root package with `@SpringBootApplication`
- [x] Entity package aligned under root package
- [x] Repository package aligned under root package
- [x] `@Entity` and `@Id` present in `User`
- [x] `mysql-connector-j` present in Maven dependencies
- [x] No YAML validation errors after edits
- [x] Application startup confirmed working by user

## 9. Recommended Hardening for Next Step

1. Create a dedicated application DB user instead of using root.
2. Move local credentials to environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).
3. Add profile-specific config (`application-dev.yml`, `application-prod.yml`).
4. Keep `ddl-auto=update` only for development; use migrations (Flyway/Liquibase) for production.

## 10. Optional Dev Profile Template

If needed, add:

- `application.yml` for shared defaults
- `application-dev.yml` for local overrides
- Start with `SPRING_PROFILES_ACTIVE=dev`

This keeps secure/prod settings isolated from local development values.

---

Prepared as part of infrastructure and JPA startup repair for collabcode-api.
