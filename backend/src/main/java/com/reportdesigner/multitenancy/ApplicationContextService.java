package com.reportdesigner.multitenancy;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Map;

@Log4j2
@Component
public class ApplicationContextService implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    public void setNewDataSourceInAbstractRoutingDatasource(String schemaName, DataSource newDatasource) {
        MultiTenantDataSource multiTenantDataSource = applicationContext.getBean(MultiTenantDataSource.class);
        final Map<Object, Object> targetDataSourcesForHouseKeeping = multiTenantDataSource.getTargetDataSourceForHouseKeeping();
        if (newDatasource != null) {
            targetDataSourcesForHouseKeeping.put(schemaName, newDatasource);
            multiTenantDataSource.setTargetDataSources(targetDataSourcesForHouseKeeping);
            multiTenantDataSource.afterPropertiesSet(); // Ensure the data source is properly refreshed
        } else {
            throw new IllegalArgumentException("Tenant ID does not exist: " + schemaName);
        }
    }

    public void deleteDataSourceFromAbstractRoutingDatasource(String schemaName, DataSource idleDataSource) {
        MultiTenantDataSource multiTenantDataSource = applicationContext.getBean(MultiTenantDataSource.class);
        final Map<Object, Object> targetDataSourcesForHouseKeeping = multiTenantDataSource.getTargetDataSourceForHouseKeeping();
        if (targetDataSourcesForHouseKeeping.containsKey(schemaName)) {
            HikariDataSource dataSource = (HikariDataSource) targetDataSourcesForHouseKeeping.get(schemaName);
            try {
                dataSource.close();
            } catch (Exception e){
                log.error(e.getMessage());
            }
            targetDataSourcesForHouseKeeping.remove(schemaName);
            targetDataSourcesForHouseKeeping.put(schemaName, idleDataSource);
            multiTenantDataSource.setTargetDataSources(targetDataSourcesForHouseKeeping);
            multiTenantDataSource.afterPropertiesSet(); // Ensure the data source is properly refreshed
        } else {
            log.error("TargetDataSources does not contain "+ schemaName + "schema");
        }
    }
}