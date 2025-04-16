package com.reportdesigner.multitenancy;

import com.bipros.common.constant.BiprosSuperAdminConstants;
import com.bipros.common.constant.ErrorCode;
import com.bipros.common.dto.response.ApiResponse;
import com.bipros.common.exception.UnityException;
import com.bipros.common.exception.ValidationException;
import com.reportdesigner.service.external.IdentityServiceClient;
import com.zaxxer.hikari.HikariDataSource;
import io.hypersistence.tsid.TSID;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class MultiTenancyService {
    private String sqlScript = "";

    @Value("${spring.datasource.url}")
    private String dataSourceUrl;

    @Value("${spring.datasource.username}")
    private String dataSourceUsername;

    @Value("${spring.datasource.password}")
    private String dataSourcePassword;

    @Value("${spring.datasource.driver-class-name}")
    private String dataSourceDriver;

    private final DataSource dataSource;
    private final DataSourceConfig dataSourceConfig;
    private final ApplicationContextService applicationContextService;
    private final IdentityServiceClient identityServiceClient;

    @PostConstruct
    private void getSqlScript() {
        Resource resource = new ClassPathResource("schema/RD-schema.sql");
        try (InputStreamReader reader = new InputStreamReader(resource.getInputStream())) {
            sqlScript = new BufferedReader(reader).lines().collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    public String createAndInitializeSchema(String schemaName) throws ValidationException, IOException {
        schemaName = getSchemaName(schemaName);
        if (!schemaExists(schemaName)) {
            createSchema(schemaName);
            DataSource newDatasource = createDataSource(dataSourceUrl + "?currentSchema=" + schemaName, dataSourceUsername, dataSourcePassword, dataSourceDriver);
            configureDataSource(schemaName, newDatasource);
            try {
                generateTablesFromSchemaSql(schemaName, newDatasource);
                SignUpThreadLocal.setCurrentSchema(schemaName);
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
            cleanUpSignUpThreadLocal();
        }
        return schemaName;
    }

    private void createSchema(String schemaName) throws ValidationException {
        String sb = "CREATE SCHEMA " + schemaName;
        try (final Connection connection = dataSource.getConnection();
             final PreparedStatement preparedStatement = connection.prepareStatement(sb)) {
            preparedStatement.execute();
        } catch (Exception e) {
            cleanUpSignUpThreadLocal();
            throw new ValidationException("Unable to create Schema", ErrorCode.ERR_PROCESSING, e.getMessage());
        }
    }

    public List<String> createAndInitializeOrgSchema(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        ApiResponse allOrganisations = identityServiceClient.getAllOrganisations(token);
        Object data = allOrganisations.getData();
        List<String> schemaNameList = new ArrayList<>();

        if (data instanceof List<?> dataList) {

            schemaNameList = dataList.stream()
                    .filter(HashMap.class::isInstance)
                    .map(obj -> (HashMap<?, ?>) obj)
                    .map(map -> map.get("schemaName"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        schemaNameList.forEach(schemaName -> {
            try {
                if (!BiprosSuperAdminConstants.SCHEMA_NAME.equalsIgnoreCase(schemaName)) {
                    createAndInitializeSchema(schemaName);
                }
            } catch (ValidationException | IOException e) {
                throw new UnityException(e.getMessage());
            }
        });
        return schemaNameList;
    }

    public void generateTablesFromSchemaSql(String newSchema, DataSource dataSource) {
        try {
            String searchPathSql = "SET search_path TO " + newSchema;
            try (final Connection connection = dataSource.getConnection();
                 final PreparedStatement setSearchPathPreparedStatement = connection.prepareStatement(searchPathSql); //Set so that we won't be getting "org.postgresql.util.PSQLException: ERROR: no schema has been selected to create in"
                 final PreparedStatement preparedStatement = connection.prepareStatement(sqlScript)) {
                setSearchPathPreparedStatement.execute();
                preparedStatement.execute();
            }
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new UnityException("Error executing schema.sql: " + e.getMessage());
        }
    }

    public String getSchemaName(String schemaName) {
        return schemaName.replaceAll("[^a-zA-Z0-9]+", "_").toLowerCase();
    }

    private boolean schemaExists(String schemaName) {
        String sql = "SELECT 1 FROM pg_namespace WHERE nspname ='" + schemaName + "'";
        try (final Connection connection = dataSource.getConnection(); final PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
            final ResultSet resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                final int result = resultSet.getInt(1);
                return result == 1;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private void configureDataSource(String schemaName, DataSource dataSource) {
        if (saveSchemaMetaData(schemaName)) {
            applicationContextService.setNewDataSourceInAbstractRoutingDatasource(schemaName, dataSource);
        }
    }

    private boolean saveSchemaMetaData(String schemaName) {
        try (Connection connection = dataSource.getConnection();
             PreparedStatement checkStatement = connection.prepareStatement("SELECT TRUE FROM schema_meta_data WHERE schema_name = ?");
             PreparedStatement insertStatement = connection.prepareStatement("INSERT INTO schema_meta_data (id, schema_name, url, username, password) VALUES (?, ?, ?, ?, ?)")) {
            checkStatement.setString(1, schemaName);
            try (ResultSet resultSet = checkStatement.executeQuery()) {
                // Insert only if no record exists for that schema
                if (!resultSet.next()) {
                    insertStatement.setString(1, TSID.Factory.getTsid().toString());
                    insertStatement.setString(2, schemaName);
                    insertStatement.setString(3, dataSourceUrl);
                    insertStatement.setString(4, dataSourceUsername);
                    insertStatement.setString(5, dataSourcePassword);
                    return insertStatement.executeUpdate() > 0;
                }
            }
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return false;
    }

    private DataSource createDataSource(String url, String username, String password, String driver) {
        HikariDataSource hikariDataSource = new HikariDataSource();
        hikariDataSource.setJdbcUrl(url);
        hikariDataSource.setUsername(username);
        hikariDataSource.setPassword(password);
        hikariDataSource.setDriverClassName(driver);
        hikariDataSource.setMetricRegistry(dataSourceConfig.metricRegistry());
        return hikariDataSource;
    }

    private void cleanUpSignUpThreadLocal() {
        SignUpThreadLocal.setCurrentSchema(null);
        SignUpThreadLocal.setAuthUserDto(null);
    }
}