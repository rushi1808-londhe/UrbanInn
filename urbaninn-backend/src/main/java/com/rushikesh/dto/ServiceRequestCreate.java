package com.rushikesh.dto;

import com.rushikesh.enums.ServiceType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceRequestCreate {

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    private String notes;
}