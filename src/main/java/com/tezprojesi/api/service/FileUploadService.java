package com.tezprojesi.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    public FileUploadService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Yuklenecek dosya bos olamaz.");
        }

        // Check file size (50MB limit)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Dosya boyutu 50MB'dan büyük olamaz. Yüklenen dosya: " + (file.getSize() / 1024 / 1024) + "MB");
        }
        
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String fileExtension = "";
        
        try {
            int lastIndex = originalFileName.lastIndexOf('.');
            if (lastIndex > 0) {
                fileExtension = originalFileName.substring(lastIndex);
            }
            
            // Generate unique file name to avoid conflicts
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Path loadFileAsResource(String fileName) {
        try {
            // Validate fileName - prevent directory traversal and null bytes
            if (fileName == null || fileName.isEmpty() || fileName.contains("..")
                    || fileName.contains("/") || fileName.contains("\\") || fileName.contains("\0")) {
                throw new RuntimeException("Geçersiz dosya adı: " + fileName);
            }
            
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            
            // Double-check: verify the resolved path is still within storage directory
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Dosya erişimi reddedildi: Geçersiz yol " + fileName);
            }
            
            if (Files.exists(filePath)) {
                return filePath;
            } else {
                throw new RuntimeException("Dosya bulunamadı: " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Dosya yüklenirken hata: " + fileName, ex);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }
}
