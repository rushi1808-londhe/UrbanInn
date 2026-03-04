package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.*;
import com.rushikesh.enums.*;
import com.rushikesh.exception.*;
import com.rushikesh.repository.*;
import com.rushikesh.security.AuthHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rushikesh.enums.OrderStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceptionistService {

    private final GuestSessionRepository guestSessionRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final BillRepository billRepository;
    private final AuthHelper authHelper;

    // ══════════════════════════════════════
    //  CHECK-IN
    // ══════════════════════════════════════

    @Transactional
    public GuestSessionResponse checkIn(CheckInRequest request) {
        Long hotelId = authHelper.getCurrentUserHotelId();
        User receptionist = authHelper.getCurrentUser();

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                    new ResourceNotFoundException("Room not found"));

        if (!room.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException(
                "Room does not belong to your hotel");
        }

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException(
                "Room " + room.getRoomNumber() +
                " is not available. Status: " + room.getStatus());
        }

        guestSessionRepository.findByRoomIdAndActiveTrue(room.getId())
                .ifPresent(s -> {
                    throw new BadRequestException(
                        "Room already has an active guest");
                });

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Hotel not found"));

        GuestSession session = GuestSession.builder()
                .hotel(hotel)
                .room(room)
                .guestName(request.getGuestName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .idProof(request.getIdProof())
                .idType(request.getIdType())
                .numberOfGuests(request.getNumberOfGuests())
                .checkInDate(request.getCheckInDate())
                .expectedCheckOutDate(request.getExpectedCheckOutDate())
                .active(true)
                .checkedInBy(receptionist)
                .build();

        session = guestSessionRepository.save(session);
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        log.info("Guest {} checked into room {}",
                session.getGuestName(), room.getRoomNumber());

        return mapToGuestSessionResponse(session);
    }

    // ══════════════════════════════════════
    //  CHECK-OUT
    // ══════════════════════════════════════

    @Transactional
    public BillResponse checkOut(Long sessionId) {
        GuestSession session = guestSessionRepository
            .findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Guest session not found"));

        if (!session.isActive()) {
            throw new BadRequestException(
                "Guest already checked out");
        }

        LocalDate checkInDate = session.getCheckInDate();
        LocalDateTime checkOutTime = LocalDateTime.now();

        long nights = java.time.temporal.ChronoUnit.DAYS
            .between(checkInDate, checkOutTime.toLocalDate());
        if (nights == 0) nights = 1;

        double pricePerNight = session.getRoom()
            .getPricePerNight().doubleValue();
        double roomCharges = nights * pricePerNight;

        List<FoodOrder> orders = foodOrderRepository
            .findByGuestSessionIdOrderByPlacedAtDesc(sessionId);
        double foodCharges = orders.stream()
            .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
            .mapToDouble(o -> o.getTotalAmount().doubleValue())
            .sum();

        double totalAmount = roomCharges + foodCharges;

        // mark session inactive
        session.setActive(false);
        session.setActualCheckOutDate(checkOutTime.toLocalDate());
        guestSessionRepository.save(session);

        // update room to cleaning
        Room room = session.getRoom();
        room.setStatus(RoomStatus.CLEANING);
        roomRepository.save(room);

        // save bill
        Bill bill = Bill.builder()
            .guestSession(session)
            .roomCharges(roomCharges)
            .foodCharges(foodCharges)
            .totalAmount(totalAmount)
            .generatedAt(LocalDateTime.now())
            .checkedOutAt(checkOutTime)
            .build();
        billRepository.save(bill);

        // build responses
        List<FoodOrderResponse> orderResponses = orders.stream()
            .map(this::mapOrderToResponse)
            .collect(Collectors.toList());

        List<ServiceRequest> services =
            serviceRequestRepository
                .findByGuestSessionIdOrderByRequestedAtDesc(sessionId);
        List<ServiceRequestResponse> serviceResponses = services.stream()
            .map(this::mapToServiceRequestResponse)
            .collect(Collectors.toList());

        return buildBillResponse(bill, session, orderResponses,
            serviceResponses, nights, pricePerNight, checkOutTime);
    }

    // ══════════════════════════════════════
    //  GET BILL
    // ══════════════════════════════════════

    public BillResponse getBillBySession(Long sessionId) {
        Bill bill = billRepository
            .findByGuestSessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Bill not found"));

        GuestSession session = bill.getGuestSession();

        List<FoodOrder> orders = foodOrderRepository
            .findByGuestSessionIdOrderByPlacedAtDesc(sessionId);
        List<ServiceRequest> services =
            serviceRequestRepository
                .findByGuestSessionIdOrderByRequestedAtDesc(sessionId);

        List<FoodOrderResponse> orderResponses = orders.stream()
            .map(this::mapOrderToResponse)
            .collect(Collectors.toList());
        List<ServiceRequestResponse> serviceResponses = services.stream()
            .map(this::mapToServiceRequestResponse)
            .collect(Collectors.toList());

        long nights = java.time.temporal.ChronoUnit.DAYS
            .between(session.getCheckInDate(),
                     bill.getCheckedOutAt().toLocalDate());
        if (nights == 0) nights = 1;

        double pricePerNight = session.getRoom()
            .getPricePerNight().doubleValue();

        return buildBillResponse(bill, session, orderResponses,
            serviceResponses, nights, pricePerNight,
            bill.getCheckedOutAt());
    }

    public List<BillResponse> getAllBills() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return billRepository
            .findByGuestSession_Hotel_IdOrderByGeneratedAtDesc(hotelId)
            .stream()
            .map(bill -> {
                Long sessionId = bill.getGuestSession().getId();
                List<FoodOrder> orders = foodOrderRepository
                    .findByGuestSessionIdOrderByPlacedAtDesc(sessionId);
                List<ServiceRequest> services = serviceRequestRepository
                    .findByGuestSessionIdOrderByRequestedAtDesc(sessionId);

                List<FoodOrderResponse> orderResponses = orders.stream()
                    .map(this::mapOrderToResponse)
                    .collect(Collectors.toList());
                List<ServiceRequestResponse> serviceResponses = services.stream()
                    .map(this::mapToServiceRequestResponse)
                    .collect(Collectors.toList());

                GuestSession session = bill.getGuestSession();
                long nights = java.time.temporal.ChronoUnit.DAYS
                    .between(session.getCheckInDate(),
                             bill.getCheckedOutAt().toLocalDate());
                if (nights == 0) nights = 1;

                double pricePerNight = session.getRoom()
                    .getPricePerNight().doubleValue();

                return buildBillResponse(bill, session, orderResponses,
                    serviceResponses, nights, pricePerNight,
                    bill.getCheckedOutAt());
            })
            .collect(Collectors.toList());
    }

    // ══════════════════════════════════════
    //  GUEST MANAGEMENT
    // ══════════════════════════════════════

    public List<GuestSessionResponse> getAllActiveGuests() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return guestSessionRepository
            .findByHotelIdAndActiveTrue(hotelId)
            .stream()
            .map(this::mapToGuestSessionResponse)
            .collect(Collectors.toList());
    }

    public List<GuestSessionResponse> getAllGuests() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return guestSessionRepository.findAll()
            .stream()
            .filter(s -> s.getHotel().getId().equals(hotelId))
            .map(this::mapToGuestSessionResponse)
            .collect(Collectors.toList());
    }

    public GuestSessionResponse getGuestById(Long sessionId) {
        return mapToGuestSessionResponse(findSessionById(sessionId));
    }

    public GuestSessionResponse getGuestByRoom(Long roomId) {
        GuestSession session = guestSessionRepository
            .findByRoomIdAndActiveTrue(roomId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No active guest for this room"));
        return mapToGuestSessionResponse(session);
    }

    // ══════════════════════════════════════
    //  SERVICE REQUESTS
    // ══════════════════════════════════════

    public List<ServiceRequestResponse> getPendingServiceRequests() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return serviceRequestRepository
            .findByHotelIdAndStatusOrderByRequestedAtAsc(
                hotelId, ServiceStatus.PENDING)
            .stream()
            .map(this::mapToServiceRequestResponse)
            .collect(Collectors.toList());
    }

    public List<ServiceRequestResponse> getAllServiceRequests() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return serviceRequestRepository
            .findByHotelIdOrderByRequestedAtDesc(hotelId)
            .stream()
            .map(this::mapToServiceRequestResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public ServiceRequestResponse updateServiceRequestStatus(
            Long requestId, ServiceStatus status) {
        ServiceRequest request = serviceRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Service request not found"));

        // only allow PENDING → IN_PROGRESS
        // COMPLETED is set by guest
        if (status == ServiceStatus.COMPLETED) {
            throw new BadRequestException(
                "Only the guest can mark service as completed");
        }

        request.setStatus(status);
        if (status == ServiceStatus.CANCELLED) {
            request.setCompletedAt(LocalDateTime.now());
        }
        request = serviceRequestRepository.save(request);
        return mapToServiceRequestResponse(request);
    }

    // ══════════════════════════════════════
    //  ROOMS
    // ══════════════════════════════════════

    public List<RoomResponse> getAllRooms() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return roomRepository.findByHotelId(hotelId)
            .stream()
            .map(this::mapToRoomResponse)
            .collect(Collectors.toList());
    }

    // ══════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════

    private BillResponse buildBillResponse(
            Bill bill, GuestSession session,
            List<FoodOrderResponse> orderResponses,
            List<ServiceRequestResponse> serviceResponses,
            long nights, double pricePerNight,
            LocalDateTime checkOutTime) {

        return BillResponse.builder()
            .id(bill.getId())
            .sessionId(session.getId())
            .guestName(session.getGuestName())
            .phoneNumber(session.getPhoneNumber())
            .roomNumber(session.getRoom().getRoomNumber())
            .roomType(session.getRoom().getRoomType().toString())
            .idType(session.getIdType())
            .idProof(session.getIdProof())
            .hotelName(session.getHotel().getName())
            .checkInDate(session.getCheckInDate()
                .atStartOfDay())
            .checkOutDate(checkOutTime)
            .numberOfNights((int) nights)
            .pricePerNight(pricePerNight)
            .roomCharges(bill.getRoomCharges())
            .foodOrders(orderResponses)
            .foodCharges(bill.getFoodCharges())
            .services(serviceResponses)
            .totalAmount(bill.getTotalAmount())
            .generatedAt(bill.getGeneratedAt())
            .build();
    }

    private FoodOrderResponse mapOrderToResponse(FoodOrder order) {
        List<OrderItemResponse> itemResponses = order.getItems()
            .stream()
            .map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())          // ← BigDecimal directly
                .subtotal(item.getUnitPrice()
                    .multiply(new java.math.BigDecimal(
                        item.getQuantity())))             // ← BigDecimal directly
                .build())
            .collect(Collectors.toList());

        return FoodOrderResponse.builder()
            .id(order.getId())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())          // ← BigDecimal directly
            .placedAt(order.getPlacedAt())
            .items(itemResponses)
            .guestName(order.getGuestSession().getGuestName())
            .roomNumber(order.getGuestSession()
                .getRoom().getRoomNumber())
            .build();
    }

    private GuestSession findSessionById(Long sessionId) {
        return guestSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Guest session not found: " + sessionId));
    }

    private GuestSessionResponse mapToGuestSessionResponse(
            GuestSession s) {
        return GuestSessionResponse.builder()
            .id(s.getId())
            .guestName(s.getGuestName())
            .phoneNumber(s.getPhoneNumber())
            .email(s.getEmail())
            .idProof(s.getIdProof())
            .idType(s.getIdType())
            .numberOfGuests(s.getNumberOfGuests())
            .checkInDate(s.getCheckInDate())
            .expectedCheckOutDate(s.getExpectedCheckOutDate())
            .actualCheckOutDate(s.getActualCheckOutDate())
            .active(s.isActive())
            .roomId(s.getRoom().getId())
            .roomNumber(s.getRoom().getRoomNumber())
            .roomType(s.getRoom().getRoomType())
            .roomStatus(s.getRoom().getStatus().name())
            .hotelId(s.getHotel().getId())
            .hotelName(s.getHotel().getName())
            .checkedInByName(s.getCheckedInBy() != null
                ? s.getCheckedInBy().getName() : null)
            .createdAt(s.getCreatedAt())
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
            .roomNumber(r.getGuestSession()
                .getRoom().getRoomNumber())
            .hotelId(r.getHotel().getId())
            .requestedAt(r.getRequestedAt())
            .completedAt(r.getCompletedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }

    private RoomResponse mapToRoomResponse(Room room) {
        RoomResponse.RoomResponseBuilder builder =
            RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .floor(room.getFloor())
                .pricePerNight(room.getPricePerNight())
                .status(room.getStatus().name())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName());

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            guestSessionRepository
                .findByRoomIdAndActiveTrue(room.getId())
                .ifPresent(session -> {
                    builder.currentGuestName(
                        session.getGuestName());
                    builder.currentGuestPhone(
                        session.getPhoneNumber());
                    builder.currentGuestSessionId(
                        session.getId());
                });
        }
        return builder.build();
    }
    
    @Transactional
    public RoomResponse updateRoomStatus(
            Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "Room not found"));

        // don't allow changing OCCUPIED room manually
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new BadRequestException(
                "Cannot manually change occupied room status." +
                " Use checkout instead.");
        }

        room.setStatus(RoomStatus.valueOf(status));
        roomRepository.save(room);
        return mapToRoomResponse(room);
    }
}