package com.reportdesigner.repository;

import com.reportdesigner.model.ReportTypeLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReportTypeLayoutRepository extends JpaRepository<ReportTypeLayout, String> {

    @Modifying
    @Transactional
    @Query("UPDATE ReportTypeLayout SET active = :status WHERE id IN (:layoutIds)")
    void updateLayoutColumnStatus(List<String> layoutIds, Boolean status);
}
