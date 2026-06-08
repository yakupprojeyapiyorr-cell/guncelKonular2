package com.tezprojesi.api.config;

import com.tezprojesi.api.exception.EntityNotFoundException;
import com.tezprojesi.api.exception.UnauthorizedException;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(
            ErrorResponse.builder()
                .status(404)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(401).body(
            ErrorResponse.builder()
                .status(401)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        int status = 400; // BAD_REQUEST
        String message = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (message.contains("not found")) {
            status = 404;
        } else if (message.contains("invalid") || message.contains("unauthorized")) {
            status = 401;
        } else if (message.contains("already exists")) {
            status = 409;
        }

        return ResponseEntity.status(status).body(
            ErrorResponse.builder()
                .status(status)
                .message(ex.getMessage() != null ? ex.getMessage() : "Runtime error")
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(500).body(
            ErrorResponse.builder()
                .status(500)
                .message("Internal server error")
                .timestamp(LocalDateTime.now())
                .build()
        );
    }
}

@Data
@Builder
class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
