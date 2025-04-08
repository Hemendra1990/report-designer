package com.reportdesigner.model;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dashboards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Dashboard extends BaseEntity {

    @Id
    @Tsid
    @Column(length = 50)
    private String id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @Column
    @Size(max = 500)
    private String description;

    @Column(nullable = false)
    private String layout;

    @Column(nullable = false)
    private String theme;

    @Builder.Default
    @OneToMany(mappedBy = "dashboard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Widget> widgets = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;

    @Column(nullable = false)
    private String refreshInterval;

    @Column(nullable = false)
    @Builder.Default
    private boolean autoRefresh = false;

    @Column(nullable = false)
    private boolean isPublic = false;

    @Column(nullable = false, unique = true)
    private String publishUrl;

    private Boolean active;

    @PrePersist
    protected void onCreate() {
        if (publishUrl == null) {
            publishUrl = UUID.randomUUID().toString();
        }
    }
} 