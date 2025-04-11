package com.reportdesigner.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    private static final String SPLIT_CHAR = ";";

    @Override
    public String convertToDatabaseColumn(List<String> stringList) {
        return !CollectionUtils.isEmpty(stringList) ? String.join(SPLIT_CHAR, stringList) : null;
    }

    @Override
    public List<String> convertToEntityAttribute(String string) {
        return StringUtils.isNotEmpty(string) ? Arrays.asList(string.split(SPLIT_CHAR)) : new ArrayList<>();
    }
}