package com.tezprojesi.api.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message = ex.getMessage().toLowerCase();
        
        if (message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message.contains("invalid") || message.contains("unauthorized")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (message.contains("already exists")) {
            status = HttpStatus.CONFLICT;
        }
        
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Beklenmedik bir sistem hatası oluştu.");
        error.put("details", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
