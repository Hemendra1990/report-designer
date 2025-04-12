package com.reportdesigner.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class FilterRuleGroup implements Serializable {
	private String combinator;
	@Data
	public static class FilterRule implements Serializable {
		String operator;
		String columnName;
		Object value;
		Object optionalValue;
		String dataType;
		Boolean treatAsRelation;
	}
	List<FilterRule> rules = new ArrayList<>();
	List<FilterRuleGroup> ruleGroups = new ArrayList<>();
}