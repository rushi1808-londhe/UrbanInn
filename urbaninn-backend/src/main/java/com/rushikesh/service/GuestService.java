package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.*;
import com.rushikesh.enums.OrderStatus;
import com.rushikesh.enums.ServiceStatus;
import com.rushikesh.exception.BadRequestException;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rushikesh.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestSessionRepository guestSessionRepository;
    private final MenuItemRepository menuItemRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final HotelRepository hotelRepository;
    private final KitchenService kitchenService;
    private final jakarta.servlet.http.HttpServletRequest request;
    // ══════════════════════════════════════
    //  HELPER — extract guest context
    //  from JWT attributes set by JwtAuthFilter
    // ══════════════════════════════════════

    private GuestSession getGuestSession(HttpServletRequest httpRequest) {
        Long guestSessionId = (Long) httpRequest.getAttribute("guestSessionId");
        if (guestSessionId == null) {
            throw new BadRequestException("Invalid guest session");
        }
        return guestSessionRepository.findById(guestSessionId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Guest session not found"));
    }

    private Long getHotelId(HttpServletRequest httpRequest) {
        Long hotelId = (Long) httpRequest.getAttribute("hotelId");
        if (hotelId == null) {
            throw new BadRequestException("Hotel context missing");
        }
        return hotelId;
    }

    // ══════════════════════════════════════
    //  SESSION INFO
    // ══════════════════════════════════════

    public GuestSessionResponse getMySession(HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);
        return mapToGuestSessionResponse(session);
    }

    // ══════════════════════════════════════
    //  ROOM STATUS
    // ══════════════════════════════════════

    public GuestRoomStatusResponse getMyRoomStatus(
            HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);
        Room room = session.getRoom();

        return GuestRoomStatusResponse.builder()
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .floor(room.getFloor())
                .status(room.getStatus().name())
                .hotelName(session.getHotel().getName())
                .guestName(session.getGuestName())
                .checkInDate(session.getCheckInDate())
                .expectedCheckOutDate(session.getExpectedCheckOutDate())
                .numberOfGuests(session.getNumberOfGuests())
                .build();
    }
    
    private Long getCurrentSessionId() {
        Object sessionId = request.getAttribute("guestSessionId");
        if (sessionId == null) {
            throw new UnauthorizedException("Not authenticated as guest");
        }
        return Long.parseLong(sessionId.toString());
    }
    
    private ServiceRequestResponse mapToResponse(ServiceRequest r) {
        return ServiceRequestResponse.builder()
            .id(r.getId())
            .serviceType(r.getServiceType().name())
            .status(r.getStatus().name())
            .notes(r.getNotes())
            .guestSessionId(r.getGuestSession().getId())
            .guestName(r.getGuestSession().getGuestName())
            .roomNumber(r.getGuestSession().getRoom().getRoomNumber())
            .hotelId(r.getHotel().getId())
            .requestedAt(r.getRequestedAt())
            .completedAt(r.getCompletedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }

    // ══════════════════════════════════════
    //  MENU
    // ══════════════════════════════════════

    public List<MenuItemResponse> getMenu(HttpServletRequest httpRequest) {
        Long hotelId = getHotelId(httpRequest);
        return menuItemRepository.findByHotelIdAndAvailableTrue(hotelId)
                .stream()
                .map(this::mapToMenuItemResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getMenuByCategory(
            String category, HttpServletRequest httpRequest) {
        Long hotelId = getHotelId(httpRequest);
        return menuItemRepository
                .findByHotelIdAndCategory(hotelId, category)
                .stream()
                .filter(MenuItem::isAvailable)
                .map(this::mapToMenuItemResponse)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════
    //  FOOD ORDERS
    // ══════════════════════════════════════

    @Transactional
    public FoodOrderResponse placeOrder(
            PlaceOrderRequest request,
            HttpServletRequest httpRequest) {

        GuestSession session = getGuestSession(httpRequest);
        Long hotelId = getHotelId(httpRequest);

        if (!session.isActive()) {
            throw new BadRequestException("Your session has ended");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Hotel not found"));

        // build order items + calculate total
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository
                    .findById(itemReq.getMenuItemId())
                    .orElseThrow(() ->
                        new ResourceNotFoundException(
                            "Menu item not found: " + itemReq.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new BadRequestException(
                    menuItem.getName() + " is currently unavailable");
            }

            if (!menuItem.getHotel().getId().equals(hotelId)) {
                throw new BadRequestException(
                    "Menu item does not belong to your hotel");
            }

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .build();

            orderItems.add(orderItem);
            total = total.add(
                menuItem.getPrice().multiply(
                    BigDecimal.valueOf(itemReq.getQuantity())));
        }

        // create order
        FoodOrder order = FoodOrder.builder()
                .guestSession(session)
                .hotel(hotel)
                .status(OrderStatus.PLACED)
                .totalAmount(total)
                .specialInstructions(request.getSpecialInstructions())
                .build();

        // link items to order
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        order = foodOrderRepository.save(order);
        log.info("Order placed by guest {} room {}",
                session.getGuestName(),
                session.getRoom().getRoomNumber());

        return kitchenService.mapToFoodOrderResponse(order);
    }

    public List<FoodOrderResponse> getMyOrders(
            HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);
        return foodOrderRepository
                .findByGuestSessionIdOrderByPlacedAtDesc(session.getId())
                .stream()
                .map(kitchenService::mapToFoodOrderResponse)
                .collect(Collectors.toList());
    }

    public FoodOrderResponse getOrderById(
            Long orderId, HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);

        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Order not found"));

        // security check — guest can only see their own orders
        if (!order.getGuestSession().getId().equals(session.getId())) {
            throw new BadRequestException(
                "You can only view your own orders");
        }

        return kitchenService.mapToFoodOrderResponse(order);
    }

    @Transactional
    public FoodOrderResponse cancelOrder(
            Long orderId, HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);

        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Order not found"));

        if (!order.getGuestSession().getId().equals(session.getId())) {
            throw new BadRequestException(
                "You can only cancel your own orders");
        }

        // can only cancel if still PLACED
        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException(
                "Order cannot be cancelled — it is already " +
                order.getStatus().name());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = foodOrderRepository.save(order);
        log.info("Order {} cancelled by guest", orderId);

        return kitchenService.mapToFoodOrderResponse(order);
    }

    // ══════════════════════════════════════
    //  SERVICE REQUESTS
    // ══════════════════════════════════════

    @Transactional
    public ServiceRequestResponse createServiceRequest(
            ServiceRequestCreate request,
            HttpServletRequest httpRequest) {

        GuestSession session = getGuestSession(httpRequest);
        Long hotelId = getHotelId(httpRequest);

        if (!session.isActive()) {
            throw new BadRequestException("Your session has ended");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Hotel not found"));

        ServiceRequest serviceRequest = ServiceRequest.builder()
                .guestSession(session)
                .hotel(hotel)
                .serviceType(request.getServiceType())
                .status(ServiceStatus.PENDING)
                .notes(request.getNotes())
                .build();

        serviceRequest = serviceRequestRepository.save(serviceRequest);
        log.info("Service request {} by guest {} room {}",
                request.getServiceType(),
                session.getGuestName(),
                session.getRoom().getRoomNumber());

        return mapToServiceRequestResponse(serviceRequest);
    }

    public List<ServiceRequestResponse> getMyServiceRequests(
            HttpServletRequest httpRequest) {
        GuestSession session = getGuestSession(httpRequest);
        return serviceRequestRepository
                .findByGuestSessionIdOrderByRequestedAtDesc(session.getId())
                .stream()
                .map(this::mapToServiceRequestResponse)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════
    //  PRIVATE MAPPERS
    // ══════════════════════════════════════

    private GuestSessionResponse mapToGuestSessionResponse(GuestSession s) {
        return GuestSessionResponse.builder()
                .id(s.getId())
                .guestName(s.getGuestName())
                .phoneNumber(s.getPhoneNumber())
                .email(s.getEmail())
                .numberOfGuests(s.getNumberOfGuests())
                .checkInDate(s.getCheckInDate())
                .expectedCheckOutDate(s.getExpectedCheckOutDate())
                .active(s.isActive())
                .roomId(s.getRoom().getId())
                .roomNumber(s.getRoom().getRoomNumber())
                .roomType(s.getRoom().getRoomType())
                .roomStatus(s.getRoom().getStatus().name())
                .hotelId(s.getHotel().getId())
                .hotelName(s.getHotel().getName())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private MenuItemResponse mapToMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .price(item.getPrice())
                .available(item.isAvailable())
                .vegetarian(item.isVegetarian())
                .imageUrl(item.getImageUrl())
                .hotelId(item.getHotel().getId())
                .build();
    }

    private ServiceRequestResponse mapToServiceRequestResponse(
            ServiceRequest r) {
        return ServiceRequestResponse.builder()
                .id(r.getId())
                .serviceType(r.getServiceType().name())
                .status(r.getStatus().name())
                .notes(r.getNotes())
                .guestSessionId(r.getGuestSession().getId())
                .guestName(r.getGuestSession().getGuestName())
                .roomNumber(r.getGuestSession().getRoom().getRoomNumber())
                .hotelId(r.getHotel().getId())
                .requestedAt(r.getRequestedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
    public ServiceRequestResponse markServiceCompleted(
            Long serviceId) {

        Long sessionId = getCurrentSessionId();

        ServiceRequest req = serviceRequestRepository
            .findById(serviceId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Service request not found"));

        if (!req.getGuestSession().getId().equals(sessionId)) {
            throw new UnauthorizedException(
                "Not your service request");
        }

        if (req.getStatus() != ServiceStatus.IN_PROGRESS) {
            throw new BadRequestException(
                "Can only complete IN_PROGRESS requests");
        }

        req.setStatus(ServiceStatus.COMPLETED);
        req.setCompletedAt(LocalDateTime.now());
        serviceRequestRepository.save(req);

        return mapToResponse(req);
    }
}