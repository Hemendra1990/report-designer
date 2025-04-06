package com.reportdesigner.model;

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

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

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

    @PrePersist
    protected void onCreate() {
        if (publishUrl == null) {
            publishUrl = UUID.randomUUID().toString();
        }
    }
} 