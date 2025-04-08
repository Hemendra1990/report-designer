package com.reportdesigner.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public interface BaseMapper<D, E> {
    D toDto(E e);

    E toEntity(D d);

    default List<D> toDtoList(List<E> entities) {
        if (Objects.nonNull(entities)) {
            return entities.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    default List<E> toEntityList(List<D> dtoList) {
        if (Objects.nonNull(dtoList)) {
            return dtoList.stream()
                    .map(this::toEntity)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

}