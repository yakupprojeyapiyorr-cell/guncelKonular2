package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
    private String name;
    private String surname;
    private String profilePictureUrl;
    private String role;
}
