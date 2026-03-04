package com.rushikesh.controller;

import com.rushikesh.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${app.upload.dir:uploads/menu-images}")
    private String uploadDir;

    @PostMapping("/image")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        // validate file type
        String contentType = file.getContentType();
        if (contentType == null ||
            !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    "Only image files are allowed"));
        }

        // validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    "File size must be less than 5MB"));
        }

        try {
            // create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // generate unique filename
            String extension = file.getOriginalFilename()
                .substring(file.getOriginalFilename()
                    .lastIndexOf('.'));
            String fileName = UUID.randomUUID()
                .toString() + extension;

            // save file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath,
                StandardCopyOption.REPLACE_EXISTING);

            // return accessible URL
            String fileUrl = "/uploads/menu-images/" + fileName;
            log.info("Image uploaded: {}", fileUrl);

            return ResponseEntity.ok(
                ApiResponse.success(
                    "Image uploaded successfully", fileUrl));

        } catch (IOException e) {
            log.error("Upload failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Upload failed"));
        }
    }
}