package com.rushikesh.dto;

import java.math.BigDecimal;

public class MenuItemResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private boolean available;
    private boolean vegetarian;
    private String imageUrl;
    private Long hotelId;

    // ── Constructor ──
    public MenuItemResponse() {}

    public MenuItemResponse(Long id, String name, String description,
            String category, BigDecimal price, boolean available,
            boolean vegetarian, String imageUrl, Long hotelId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.available = available;
        this.vegetarian = vegetarian;
        this.imageUrl = imageUrl;
        this.hotelId = hotelId;
    }

    // ── Getters ──
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public boolean isAvailable() { return available; }
    public boolean isVegetarian() { return vegetarian; }
    public String getImageUrl() { return imageUrl; }
    public Long getHotelId() { return hotelId; }

    // ── Setters ──
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setAvailable(boolean available) { this.available = available; }
    public void setVegetarian(boolean vegetarian) { this.vegetarian = vegetarian; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    // ── Builder ──
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private String category;
        private BigDecimal price;
        private boolean available;
        private boolean vegetarian;
        private String imageUrl;
        private Long hotelId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder available(boolean available) { this.available = available; return this; }
        public Builder vegetarian(boolean vegetarian) { this.vegetarian = vegetarian; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder hotelId(Long hotelId) { this.hotelId = hotelId; return this; }

        public MenuItemResponse build() {
            return new MenuItemResponse(id, name, description, category,
                    price, available, vegetarian, imageUrl, hotelId);
        }
    }
}