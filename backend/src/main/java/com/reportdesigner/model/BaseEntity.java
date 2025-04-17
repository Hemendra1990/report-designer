package com.reportdesigner.model;

import com.reportdesigner.multitenancy.AuthorizationFilter;
import com.reportdesigner.multitenancy.SpecificSchemaThreadLocal;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.Optional;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Column(updatable = false)
    private String createdBy;

    @Column(updatable = false)
    private OffsetDateTime createdOn;

    private String updatedBy;
    private OffsetDateTime updatedOn;
    private Boolean isActive;
    private Boolean isDeleted;

    @PrePersist
    public void prePersist() {
        this.setCreatedOn(OffsetDateTime.now());
        this.setUpdatedOn(OffsetDateTime.now());
        this.setIsActive(true);
        this.setIsDeleted(false);
        this.setCreatedBy();
    }

    @PreUpdate
    public void preUpdate() {
        this.setUpdatedOn(OffsetDateTime.now());
        this.setUpdatedBy();
    }

    public void setCreatedBy() {
        String loggedInUserId = Optional.ofNullable(SpecificSchemaThreadLocal.getAuthUserDetails())
                .orElseGet(AuthorizationFilter::getAuthUserDetails).getId();
        this.setCreatedBy(loggedInUserId);
        this.setUpdatedBy(loggedInUserId);
    }

    public void setUpdatedBy() {
        String loggedInUserId = Optional.ofNullable(SpecificSchemaThreadLocal.getAuthUserDetails())
                .orElseGet(AuthorizationFilter::getAuthUserDetails).getId();
        this.setUpdatedBy(loggedInUserId);
    }
} 